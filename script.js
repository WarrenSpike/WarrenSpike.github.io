// Game Variables
let score = 0;
let isAiming = false;
let power = 0;
let gameActive = true;
let chargingInterval;
let targetPosition = { x: 200, y: 100 };

// DOM Elements
const crosshair = document.getElementById('crosshair');
const powerFill = document.getElementById('powerFill');
const scoreValue = document.getElementById('scoreValue');
const target = document.getElementById('target');
const gameArea = document.querySelector('.game-area');
const themeToggle = document.getElementById('themeToggle');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Initialize Game
function initGame() {
    // Mouse events for aiming
    gameArea.addEventListener('mousemove', updateCrosshair);
    gameArea.addEventListener('mousedown', startAiming);
    gameArea.addEventListener('mouseup', shoot);
    gameArea.addEventListener('mouseleave', cancelAiming);

    // Touch events for mobile
    gameArea.addEventListener('touchmove', function(e) {
        e.preventDefault();
        updateCrosshairTouch(e);
    });

    gameArea.addEventListener('touchstart', function(e) {
        e.preventDefault();
        updateCrosshairTouch(e);
        startAiming();
    });

    gameArea.addEventListener('touchend', function(e) {
        e.preventDefault();
        shoot();
    });

    // Initialize target position
    moveTarget();
    
    // Start falling Spikes
    setInterval(createFallingSpike, 2000);
}

// Crosshair Functions
function updateCrosshair(e) {
    const rect = gameArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    crosshair.style.left = (x - 15) + 'px';
    crosshair.style.top = (y - 15) + 'px';
}

function updateCrosshairTouch(e) {
    const rect = gameArea.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    crosshair.style.left = (x - 15) + 'px';
    crosshair.style.top = (y - 15) + 'px';
}

// Game Functions
function startAiming() {
    if (!gameActive) return;
    
    isAiming = true;
    power = 0;
    
    chargingInterval = setInterval(() => {
        if (power < 100) {
            power += 3;
            powerFill.style.height = power + '%';
        }
    }, 50);
}

function cancelAiming() {
    if (isAiming) {
        isAiming = false;
        clearInterval(chargingInterval);
        powerFill.style.height = '0%';
        power = 0;
    }
}

function shoot() {
    if (!isAiming || !gameActive) return;
    
    isAiming = false;
    clearInterval(chargingInterval);
    gameActive = false;
    
    // Get crosshair position
    const crosshairRect = crosshair.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    // Create muzzle flash effect
    createMuzzleFlash(crosshair.offsetLeft + 15, crosshair.offsetTop + 15);
    
    // Check if shot hits target (within reasonable distance)
    const distance = Math.sqrt(
        Math.pow(crosshairRect.left - targetRect.left, 2) + 
        Math.pow(crosshairRect.top - targetRect.top, 2)
    );
    
    // Hit detection based on power and distance
    const hitThreshold = Math.max(50, 150 - power); // Better aim with more power
    const isHit = distance < hitThreshold;
    
    setTimeout(() => {
        if (isHit) {
            handleSuccessfulShot();
        } else {
            handleMissedShot();
        }
        
        // Reset for next shot
        resetGame();
    }, 300);
}

function handleSuccessfulShot() {
    score++;
    scoreValue.textContent = score;
    
    // Target hit animation
    target.classList.add('hit-target');
    
    // Move target to new position
    setTimeout(() => {
        target.classList.remove('hit-target');
        moveTarget();
    }, 500);
}

function handleMissedShot() {
    // Visual feedback for miss - maybe shake the target or show miss indicator
    target.style.transform = 'scale(0.9)';
    setTimeout(() => {
        target.style.transform = 'scale(1)';
    }, 200);
}

function moveTarget() {
    const gameRect = gameArea.getBoundingClientRect();
    const maxX = gameArea.offsetWidth - 60; // Account for target size
    const maxY = gameArea.offsetHeight - 60;
    
    targetPosition.x = Math.random() * maxX;
    targetPosition.y = Math.random() * maxY;
    
    target.style.left = targetPosition.x + 'px';
    target.style.top = targetPosition.y + 'px';
}

function resetGame() {
    setTimeout(() => {
        powerFill.style.height = '0%';
        power = 0;
        gameActive = true;
    }, 500);
}

// Visual Effects
function createMuzzleFlash(x, y) {
    const flash = document.createElement('div');
    flash.className = 'muzzle-flash flash';
    flash.style.left = x + 'px';
    flash.style.top = y + 'px';
    
    gameArea.appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.remove();
        }
    }, 200);
}

function createFallingSpike() {
    const spike = document.createElement('div');
    spike.innerHTML = '🌵'; // Spike from Brawl Stars (cactus emoji)
    spike.className = 'spike';
    spike.style.left = Math.random() * window.innerWidth + 'px';
    spike.style.top = '-50px';
    
    document.body.appendChild(spike);
    
    // Remove spike after animation completes
    setTimeout(() => {
        if (spike.parentNode) {
            spike.remove();
        }
    }, 6000);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initGame();
});