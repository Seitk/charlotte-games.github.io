// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Player properties
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 50,
    speed: 5,
    facingRight: true,
    lastX: canvas.width / 2,
    lastY: canvas.height / 2
};

// Load player image
const playerImage = new Image();
playerImage.src = 'heartspring.png';

// Cloudia character
const cloudia = {
    x: Math.random() * (canvas.width - 50) + 25,
    y: Math.random() * (canvas.height - 50) + 25,
    size: 50,
    speed: 2,
    followSpeed: 3,
    followDistance: 100,
    detectionRadius: 150,
    isCaught: false,
    caughtTime: 0,
    resetDelay: 10000
};

// Star character
const star = {
    x: Math.random() * (canvas.width - 50) + 25,
    y: Math.random() * (canvas.height - 50) + 25,
    size: 50,
    speed: 2.5,
    followSpeed: 3.5,
    followDistance: 200,
    detectionRadius: 150,
    isCaught: false,
    caughtTime: 0,
    resetDelay: 10000
};

// Clover character
const clover = {
    x: Math.random() * (canvas.width - 50) + 25,
    y: Math.random() * (canvas.height - 50) + 25,
    size: 50,
    speed: 3,
    followSpeed: 4,
    followDistance: 300,
    detectionRadius: 150,
    isCaught: false,
    caughtTime: 0,
    resetDelay: 10000
};

// Heart effect properties
const heartEffect = {
    active: false,
    x: 0,
    y: 0,
    size: 0,
    maxSize: 30,
    growthRate: 1,
    alpha: 1,
    fadeRate: 0.02
};

// Load character images
const cloudiaImage = new Image();
cloudiaImage.src = 'characters/cloudia.png';

const starImage = new Image();
starImage.src = 'characters/star.png';

const cloverImage = new Image();
cloverImage.src = 'characters/clover.png';

// Keyboard state
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Event listeners for keyboard
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
        // Update facing direction when moving left/right
        if (e.key.toLowerCase() === 'a') player.facingRight = false;
        if (e.key.toLowerCase() === 'd') player.facingRight = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
    }
});

// Calculate distance between two points
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Check collision between player and character
function checkCollision(playerX, playerY, characterX, characterY, characterSize) {
    const distance = calculateDistance(playerX, playerY, characterX, characterY);
    return distance < (player.size/2 + characterSize/2);
}

// Reset character to a new random position
function resetCharacter(character) {
    character.x = Math.random() * (canvas.width - 50) + 25;
    character.y = Math.random() * (canvas.height - 50) + 25;
    character.isCaught = false;
    character.caughtTime = 0;
}

// Draw heart effect
function drawHeart(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size/20, size/20);
    ctx.fillStyle = `rgba(255, 0, 0, ${heartEffect.alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -10, -10, -20, 0, -30);
    ctx.bezierCurveTo(10, -20, 0, -10, 0, 0);
    ctx.fill();
    ctx.restore();
}

// Update character position to follow player
function followPlayer(character, targetX, targetY) {
    // Calculate the direction vector from character to target
    const dx = targetX - character.x;
    const dy = targetY - character.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        // Move towards target position
        character.x += (dx / distance) * character.followSpeed;
        character.y += (dy / distance) * character.followSpeed;
    }
    
    // Keep character within canvas bounds
    character.x = Math.max(character.size/2, Math.min(canvas.width - character.size/2, character.x));
    character.y = Math.max(character.size/2, Math.min(canvas.height - character.size/2, character.y));
}

// Game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Update player position based on key presses
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;

    // Keep player within canvas bounds
    player.x = Math.max(player.size/2, Math.min(canvas.width - player.size/2, player.x));
    player.y = Math.max(player.size/2, Math.min(canvas.height - player.size/2, player.y));

    // Calculate player's movement direction
    const playerDx = player.x - player.lastX;
    const playerDy = player.y - player.lastY;
    const playerAngle = Math.atan2(playerDy, playerDx);
    
    // Update last position
    player.lastX = player.x;
    player.lastY = player.y;

    // Check for collision with Cloudia
    if (!cloudia.isCaught && checkCollision(player.x, player.y, cloudia.x, cloudia.y, cloudia.size)) {
        cloudia.isCaught = true;
        cloudia.caughtTime = Date.now();
        heartEffect.active = true;
        heartEffect.x = cloudia.x;
        heartEffect.y = cloudia.y;
        heartEffect.size = 0;
        heartEffect.alpha = 1;
    }

    // Check for collision with Star
    if (!star.isCaught && checkCollision(player.x, player.y, star.x, star.y, star.size)) {
        star.isCaught = true;
        star.caughtTime = Date.now();
        heartEffect.active = true;
        heartEffect.x = star.x;
        heartEffect.y = star.y;
        heartEffect.size = 0;
        heartEffect.alpha = 1;
    }

    // Check for collision with Clover
    if (!clover.isCaught && checkCollision(player.x, player.y, clover.x, clover.y, clover.size)) {
        clover.isCaught = true;
        clover.caughtTime = Date.now();
        heartEffect.active = true;
        heartEffect.x = clover.x;
        heartEffect.y = clover.y;
        heartEffect.size = 0;
        heartEffect.alpha = 1;
    }

    // Update heart effect
    if (heartEffect.active) {
        heartEffect.size += heartEffect.growthRate;
        heartEffect.alpha -= heartEffect.fadeRate;
        
        if (heartEffect.alpha <= 0) {
            heartEffect.active = false;
        }
    }

    // Check if it's time to reset Cloudia
    if (cloudia.isCaught && Date.now() - cloudia.caughtTime >= cloudia.resetDelay) {
        resetCharacter(cloudia);
    }

    // Check if it's time to reset Star
    if (star.isCaught && Date.now() - star.caughtTime >= star.resetDelay) {
        resetCharacter(star);
    }

    // Check if it's time to reset Clover
    if (clover.isCaught && Date.now() - clover.caughtTime >= clover.resetDelay) {
        resetCharacter(clover);
    }

    // Update Cloudia's position
    if (cloudia.isCaught) {
        // Calculate target position behind player
        const cloudiaTargetX = player.x - Math.cos(playerAngle) * cloudia.followDistance;
        const cloudiaTargetY = player.y - Math.sin(playerAngle) * cloudia.followDistance;
        followPlayer(cloudia, cloudiaTargetX, cloudiaTargetY);
    } else {
        const distance = calculateDistance(player.x, player.y, cloudia.x, cloudia.y);
        if (distance < cloudia.detectionRadius) {
            const angle = Math.atan2(cloudia.y - player.y, cloudia.x - player.x);
            cloudia.x += Math.cos(angle) * cloudia.speed;
            cloudia.y += Math.sin(angle) * cloudia.speed;
        }
        cloudia.x = Math.max(cloudia.size/2, Math.min(canvas.width - cloudia.size/2, cloudia.x));
        cloudia.y = Math.max(cloudia.size/2, Math.min(canvas.height - cloudia.size/2, cloudia.y));
    }

    // Update Star's position
    if (star.isCaught) {
        // Calculate target position behind Cloudia
        const starTargetX = cloudia.x - Math.cos(playerAngle) * (star.followDistance - cloudia.followDistance);
        const starTargetY = cloudia.y - Math.sin(playerAngle) * (star.followDistance - cloudia.followDistance);
        followPlayer(star, starTargetX, starTargetY);
    } else {
        const distance = calculateDistance(player.x, player.y, star.x, star.y);
        if (distance < star.detectionRadius) {
            const angle = Math.atan2(star.y - player.y, star.x - player.x);
            star.x += Math.cos(angle) * star.speed;
            star.y += Math.sin(angle) * star.speed;
        }
        star.x = Math.max(star.size/2, Math.min(canvas.width - star.size/2, star.x));
        star.y = Math.max(star.size/2, Math.min(canvas.height - star.size/2, star.y));
    }

    // Update Clover's position
    if (clover.isCaught) {
        // Calculate target position behind Star
        const cloverTargetX = star.x - Math.cos(playerAngle) * (clover.followDistance - star.followDistance);
        const cloverTargetY = star.y - Math.sin(playerAngle) * (clover.followDistance - star.followDistance);
        followPlayer(clover, cloverTargetX, cloverTargetY);
    } else {
        const distance = calculateDistance(player.x, player.y, clover.x, clover.y);
        if (distance < clover.detectionRadius) {
            const angle = Math.atan2(clover.y - player.y, clover.x - player.x);
            clover.x += Math.cos(angle) * clover.speed;
            clover.y += Math.sin(angle) * clover.speed;
        }
        clover.x = Math.max(clover.size/2, Math.min(canvas.width - clover.size/2, clover.x));
        clover.y = Math.max(clover.size/2, Math.min(canvas.height - clover.size/2, clover.y));
    }

    // Draw Cloudia
    if (cloudiaImage.complete) {
        ctx.drawImage(
            cloudiaImage,
            cloudia.x - cloudia.size/2,
            cloudia.y - cloudia.size/2,
            cloudia.size,
            cloudia.size
        );
    }

    // Draw Star
    if (starImage.complete) {
        ctx.drawImage(
            starImage,
            star.x - star.size/2,
            star.y - star.size/2,
            star.size,
            star.size
        );
    }

    // Draw Clover
    if (cloverImage.complete) {
        ctx.drawImage(
            cloverImage,
            clover.x - clover.size/2,
            clover.y - clover.size/2,
            clover.size,
            clover.size
        );
    }

    // Draw heart effect if active
    if (heartEffect.active) {
        drawHeart(heartEffect.x, heartEffect.y, heartEffect.size);
    }

    // Draw player image
    if (playerImage.complete) {
        ctx.save();
        ctx.translate(player.x, player.y);
        if (!player.facingRight) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(
            playerImage,
            -player.size/2,
            -player.size/2,
            player.size,
            player.size
        );
        ctx.restore();
    }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop(); 