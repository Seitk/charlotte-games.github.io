// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
const gameState = {
    isGameOver: false,
    startTime: null,
    gameDuration: 30000, // 1 minute in milliseconds
    remainingTime: 30000
};

// Create restart button
const restartButton = document.createElement('button');
restartButton.textContent = 'Restart Game';
restartButton.style.position = 'absolute';
restartButton.style.left = '50%';
restartButton.style.top = '60%';
restartButton.style.transform = 'translate(-50%, -50%)';
restartButton.style.padding = '15px 30px';
restartButton.style.fontSize = '20px';
restartButton.style.backgroundColor = '#4CAF50';
restartButton.style.color = 'white';
restartButton.style.border = 'none';
restartButton.style.borderRadius = '5px';
restartButton.style.cursor = 'pointer';
restartButton.style.display = 'none';
restartButton.style.zIndex = '1000';

// Add hover effect
restartButton.addEventListener('mouseover', () => {
    restartButton.style.backgroundColor = '#45a049';
});

restartButton.addEventListener('mouseout', () => {
    restartButton.style.backgroundColor = '#4CAF50';
});

// Add click handler
restartButton.addEventListener('click', () => {
    initGame();
    restartButton.style.display = 'none';
    gameLoop();
});

// Add button to the page
document.body.appendChild(restartButton);

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Player properties
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 50,
    speed: 4.5,
    facingRight: true,
    lastX: canvas.width / 2,
    lastY: canvas.height / 2,
    velocityX: 0,
    velocityY: 0
};

// Score properties
const score = {
    points: 0,
    fontSize: 24,
    fontFamily: 'Arial',
    color: 'white',
    x: canvas.width - 20,
    y: 30
};

// Timer properties
const timer = {
    fontSize: 24,
    fontFamily: 'Arial',
    color: 'white',
    x: 20,
    y: 30
};

// Character configuration
const characterConfig = {
    cloudia: {
        name: 'Cloudia',
        image: 'characters/cloudia.png',
        size: 50,
        speed: 2.5,
        followSpeed: 3.5,
        followDistance: 100,
        detectionRadius: 150,
        resetDelay: 5000,
        points: 10
    },
    star: {
        name: 'Star',
        image: 'characters/star.png',
        size: 50,
        speed: 3,
        followSpeed: 4,
        followDistance: 200,
        detectionRadius: 150,
        resetDelay: 5000,
        points: 15
    },
    clover: {
        name: 'Clover',
        image: 'characters/clover.png',
        size: 50,
        speed: 3.5,
        followSpeed: 4.5,
        followDistance: 300,
        detectionRadius: 150,
        resetDelay: 5000,
        points: 20
    },
    shyping: {
        name: 'Shyping',
        image: 'characters/emotional/shyping.png',
        size: 50,
        speed: 2,
        followSpeed: 3,
        followDistance: 120,
        detectionRadius: 130,
        resetDelay: 5000,
        points: 15
    },
    charmping: {
        name: 'Charmping',
        image: 'characters/emotional/charmping.png',
        size: 50,
        speed: 2.8,
        followSpeed: 3.8,
        followDistance: 140,
        detectionRadius: 140,
        resetDelay: 5000,
        points: 20
    },
    kikiping: {
        name: 'Kikiping',
        image: 'characters/emotional/kikiping.png',
        size: 50,
        speed: 3.2,
        followSpeed: 4.2,
        followDistance: 160,
        detectionRadius: 160,
        resetDelay: 5000,
        points: 25
    },
    egoping: {
        name: 'Egoping',
        image: 'characters/villain/egoping.png',
        size: 50,
        speed: 4,
        followSpeed: 5,
        followDistance: 180,
        detectionRadius: 170,
        resetDelay: 5000,
        points: 50
    },
    giggleping: {
        name: 'Giggleping',
        image: 'characters/villain/giggleping.png',
        size: 50,
        speed: 4.5,
        followSpeed: 5.5,
        followDistance: 200,
        detectionRadius: 180,
        resetDelay: 5000,
        points: 50
    }
};

// Character manager
const characters = {};

// Initialize characters
function initializeCharacters() {
    for (const [id, config] of Object.entries(characterConfig)) {
        // Create character instance
        characters[id] = {
            ...config,
            x: Math.random() * (canvas.width - config.size) + config.size/2,
            y: Math.random() * (canvas.height - config.size) + config.size/2,
            isCaught: false,
            caughtTime: 0,
            image: new Image()
        };
        
        // Load character image
        characters[id].image.src = config.image;
    }
}

// Load player image
const playerImage = new Image();
playerImage.src = 'heartspring.png';

// Effect properties
const effect = {
    active: false,
    x: 0,
    y: 0,
    size: 0,
    maxSize: 70,
    growthRate: 2,
    alpha: 1,
    fadeRate: 0.02,
    image: new Image(),
    rotation: 0,
    color: 'rgba(255, 255, 255, 0.4)'
};

// Load effect image
effect.image.src = 'effects/blink.png';

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

// Remove the old virtual controller code and replace with drag controller
const dragController = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    element: document.createElement('div'),
    indicator: document.createElement('div')
};

// Style drag controller
dragController.element.style.position = 'absolute';
dragController.element.style.width = '100px';
dragController.element.style.height = '100px';
dragController.element.style.borderRadius = '50%';
dragController.element.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
dragController.element.style.border = '2px solid rgba(255, 255, 255, 0.5)';
dragController.element.style.display = 'none';
dragController.element.style.zIndex = '1000';
dragController.element.style.touchAction = 'none';

// Style indicator
dragController.indicator.style.position = 'absolute';
dragController.indicator.style.width = '20px';
dragController.indicator.style.height = '20px';
dragController.indicator.style.borderRadius = '50%';
dragController.indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
dragController.indicator.style.transform = 'translate(-50%, -50%)';
dragController.indicator.style.pointerEvents = 'none';

// Add indicator to controller
dragController.element.appendChild(dragController.indicator);

// Add controller to page
document.body.appendChild(dragController.element);

// Touch event handlers
function handleTouchStart(e) {
    if (e.target === restartButton) return;
    e.preventDefault();
    const touch = e.touches[0];
    startController(touch.clientX, touch.clientY);
}

function handleTouchMove(e) {
    if (!dragController.active) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    updateController(touch.clientX, touch.clientY);
}

function handleTouchEnd(e) {
    if (e.target === restartButton) return;
    e.preventDefault();
    endController();
}

// Mouse event handlers
function handleMouseDown(e) {
    if (e.target === restartButton) return;
    e.preventDefault();
    startController(e.clientX, e.clientY);
}

function handleMouseMove(e) {
    if (!dragController.active) return;
    e.preventDefault();
    updateController(e.clientX, e.clientY);
}

function handleMouseUp(e) {
    if (e.target === restartButton) return;
    e.preventDefault();
    endController();
}

// Common controller functions
function startController(x, y) {
    dragController.active = true;
    dragController.startX = x;
    dragController.startY = y;
    dragController.currentX = x;
    dragController.currentY = y;
    
    // Position and show controller
    dragController.element.style.left = `${x - 50}px`;
    dragController.element.style.top = `${y - 50}px`;
    dragController.element.style.display = 'block';
    
    // Reset keys
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;
}

function updateController(x, y) {
    dragController.currentX = x;
    dragController.currentY = y;
    
    // Calculate relative position from center
    const centerX = dragController.startX;
    const centerY = dragController.startY;
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    
    // Calculate distance and angle
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    
    // Update indicator position (clamped to controller bounds)
    const maxDistance = 40;
    const clampedDistance = Math.min(maxDistance, distance);
    const indicatorX = Math.cos(angle) * clampedDistance;
    const indicatorY = Math.sin(angle) * clampedDistance;
    
    dragController.indicator.style.left = `${50 + indicatorX}px`;
    dragController.indicator.style.top = `${50 + indicatorY}px`;
    
    // Calculate movement based on drag angle and distance
    const normalizedDistance = Math.min(1, distance / maxDistance);
    const moveX = Math.cos(angle) * normalizedDistance;
    const moveY = Math.sin(angle) * normalizedDistance;
    
    // Update player velocity
    player.velocityX = moveX * player.speed;
    player.velocityY = moveY * player.speed;
    
    // Update player facing direction
    player.facingRight = deltaX > 0;
}

function endController() {
    dragController.active = false;
    dragController.element.style.display = 'none';
    
    // Reset player velocity
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Reset keys
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;
}

// Add event listeners
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

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
    character.x = Math.random() * (canvas.width - character.size) + character.size/2;
    character.y = Math.random() * (canvas.height - character.size) + character.size/2;
    character.isCaught = false;
    character.caughtTime = 0;
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

    // Update timer
    if (!gameState.isGameOver) {
        gameState.remainingTime = Math.max(0, gameState.gameDuration - (Date.now() - gameState.startTime));
        
        if (gameState.remainingTime <= 0) {
            gameState.isGameOver = true;
        }
    }

    // Draw timer
    const minutes = Math.floor(gameState.remainingTime / 30000);
    const seconds = Math.floor((gameState.remainingTime % 30000) / 1000);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    ctx.font = `${timer.fontSize}px ${timer.fontFamily}`;
    ctx.fillStyle = timer.color;
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${timeString}`, timer.x, timer.y);

    // Draw score
    ctx.font = `${score.fontSize}px ${score.fontFamily}`;
    ctx.fillStyle = score.color;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score.points}`, score.x, score.y);

    // If game is over, show game over screen
    if (gameState.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 30);
        
        ctx.font = '36px Arial';
        ctx.fillText(`Final Score: ${score.points}`, canvas.width/2, canvas.height/2 + 30);
        
        // Show restart button
        restartButton.style.display = 'block';
        return;
    }

    // Update player position based on velocity
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player within canvas bounds
    player.x = Math.max(player.size/2, Math.min(canvas.width - player.size/2, player.x));
    player.y = Math.max(player.size/2, Math.min(canvas.height - player.size/2, player.y));

    // Update all characters
    for (const [id, character] of Object.entries(characters)) {
        // Check for collision
        if (!character.isCaught && checkCollision(player.x, player.y, character.x, character.y, character.size)) {
            character.isCaught = true;
            character.caughtTime = Date.now();
            effect.active = true;
            effect.x = character.x;
            effect.y = character.y;
            effect.size = 0;
            effect.alpha = 1;
            score.points += character.points;
        }

        // Check if it's time to reset
        if (character.isCaught && Date.now() - character.caughtTime >= character.resetDelay) {
            resetCharacter(character);
        }

        // Update position if not caught
        if (!character.isCaught) {
            const distance = calculateDistance(player.x, player.y, character.x, character.y);
            if (distance < character.detectionRadius) {
                const angle = Math.atan2(character.y - player.y, character.x - player.x);
                character.x += Math.cos(angle) * character.speed;
                character.y += Math.sin(angle) * character.speed;
            }
            character.x = Math.max(character.size/2, Math.min(canvas.width - character.size/2, character.x));
            character.y = Math.max(character.size/2, Math.min(canvas.height - character.size/2, character.y));
        }

        // Draw character
        if (character.image.complete && !character.isCaught) {
            ctx.drawImage(
                character.image,
                character.x - character.size/2,
                character.y - character.size/2,
                character.size,
                character.size
            );
        }
    }

    // Update effect
    if (effect.active) {
        effect.size += effect.growthRate;
        effect.alpha -= effect.fadeRate;
        
        if (effect.alpha <= 0) {
            effect.active = false;
        }
    }

    // Draw effect if active
    if (effect.active && effect.image.complete) {
        ctx.save();
        ctx.globalAlpha = effect.alpha;
        
        // Draw colored circle behind the effect
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.size/2, 0, Math.PI * 2);
        ctx.fillStyle = effect.color;
        ctx.fill();
        
        // Draw the effect image
        ctx.drawImage(
            effect.image,
            effect.x - effect.size/2,
            effect.y - effect.size/2,
            effect.size,
            effect.size
        );
        ctx.restore();
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

// Initialize game
function initGame() {
    // Reset game state
    gameState.isGameOver = false;
    gameState.startTime = Date.now();
    gameState.remainingTime = gameState.gameDuration;
    score.points = 0;
    
    // Reset player position
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.lastX = canvas.width / 2;
    player.lastY = canvas.height / 2;
    
    // Reset effect
    effect.active = false;
    effect.size = 0;
    effect.alpha = 1;
    effect.rotation = 0;
    
    // Reinitialize characters
    initializeCharacters();
}

// Start the game
initGame();
gameLoop.running = true;
gameLoop(); 