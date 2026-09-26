/**
 * EcoDash - Main Game Engine
 * African Digital Logistics & Infrastructure Simulator
 *
 * Built with HTML5 Canvas, CSS3, and Vanilla JavaScript (ES6+)
 * STADIO - WAS262 Web Animation Scripting
 */

// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    TOTAL_TIME: 300, // 5 minutes in seconds
    TARGET_DELIVERIES: 5,
    DELIVERY_RADIUS: 40,
    WEATHER_CHANGE_INTERVAL: 30, // seconds
};

// ==================== GAME STATE ====================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

// ==================== MAIN GAME CLASS ====================
class EcoDashGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        // Game objects
        this.player = new Player(100, 100);
        this.obstacleManager = new ObstacleManager(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.particleSystem = new ParticleSystem();
        this.uiManager = new UIManager();

        // Delivery points
        this.deliveryPoints = [];
        this.generateDeliveryPoints();

        // Game state
        this.state = GameState.MENU;
        this.timeLeft = CONFIG.TOTAL_TIME;
        this.lastTime = 0;
        this.deltaTime = 1;

        // Input
        this.keys = {};

        // Environment
        this.environment = {
            weather: 'clear', // clear, rain, dust_storm
            weatherTimer: 0,
            windActive: false,
            windAngle: 0,
            windForce: 0
        };

        // Bind events
        this.bindEvents();
       
        // Start game loop
        this.gameLoop(0);
    }

    /**
     * Generate random delivery points across the map
     */
    generateDeliveryPoints() {
        this.deliveryPoints = [];
        for (let i = 0; i < CONFIG.TARGET_DELIVERIES; i++) {
            this.deliveryPoints.push({
                x: Math.random() * (CONFIG.CANVAS_WIDTH - 200) + 100,
                y: Math.random() * (CONFIG.CANVAS_HEIGHT - 200) + 100,
                completed: false,
                radius: CONFIG.DELIVERY_RADIUS
            });
        }
    }

    /**
     * Bind keyboard and button events
     */
    bindEvents() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
           
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
            if (e.key === 'r' || e.key === 'R') {
                this.restart();
            }
            if (e.key === ' ' && this.state === GameState.PLAYING) {
                e.preventDefault();
                this.player.isBoosting = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
           
            if (e.key === ' ') {
                this.player.isBoosting = false;
            }
        });

        // Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('restart-pause-btn').addEventListener('click', () => this.restart());
        document.getElementById('menu-btn').addEventListener('click', () => this.goToMenu());
    }

    /**
     * Start the game
     */
    start() {
        this.state = GameState.PLAYING;
        this.uiManager.hideAllScreens();
        this.resetGame();
    }

    /**
     * Reset game to initial state
     */
    resetGame() {
        this.player.reset(100, 100);
        this.obstacleManager.reset();
        this.particleSystem.clear();
        this.generateDeliveryPoints();
        this.timeLeft = CONFIG.TOTAL_TIME;
        this.environment.weather = 'clear';
        this.environment.weatherTimer = 0;
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            this.uiManager.showScreen('pause');
        } else if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.uiManager.hideAllScreens();
        }
    }

    /**
     * Restart the game without page refresh
     */
    restart() {
        this.resetGame();
        this.state = GameState.PLAYING;
        this.uiManager.hideAllScreens();
    }

    /**
     * Return to main menu
     */
    goToMenu() {
        this.state = GameState.MENU;
        this.uiManager.showScreen('start');
    }

    /**
     * Main game loop
     */
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.deltaTime = Math.min(deltaTime / 16.67, 2); // Normalize to ~60fps

        // Update game state
        if (this.state === GameState.PLAYING) {
            this.update(this.deltaTime);
        }

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    /**
     * Update game logic
     */
    update(dt) {
        // Update timer
        this.timeLeft -= dt / 60; // Convert frames to seconds

        // Check lose condition
        if (this.timeLeft <= 0 || this.player.battery <= 0) {
            this.state = GameState.GAME_OVER;
            this.uiManager.showGameOver(this.player, false);
            return;
        }

        // Check win condition
        if (this.player.deliveries >= CONFIG.TARGET_DELIVERIES) {
            this.state = GameState.GAME_OVER;
            this.uiManager.showGameOver(this.player, true);
            return;
        }

        // Update environment
        this.updateEnvironment(dt);

        // Update player
        this.player.update(dt, this.keys, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, this.environment);

        // Update obstacles
        this.obstacleManager.update(dt);

        // Check collisions
        this.handleCollisions();

        // Check delivery points
        this.checkDeliveries();

        // Update particles
        this.particleSystem.update(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // Spawn dust trail
        const speed = Math.sqrt(this.player.velocityX ** 2 + this.player.velocityY ** 2);
        if (speed > 1) {
            this.particleSystem.createDust(
                this.player.x,
                this.player.y,
                this.player.angle,
                speed
            );
        }

        // Update UI
        this.uiManager.updateHUD(this.player, this.timeLeft, CONFIG.TOTAL_TIME);

        // Increase difficulty over time
        this.obstacleManager.difficulty = 1 + (1 - this.timeLeft / CONFIG.TOTAL_TIME) * 2;
    }

    /**
     * Update environmental conditions (weather, wind)
     */
    updateEnvironment(dt) {
        this.environment.weatherTimer += dt / 60;

        if (this.environment.weatherTimer > CONFIG.WEATHER_CHANGE_INTERVAL) {
            this.environment.weatherTimer = 0;
            this.changeWeather();
        }

        // Apply weather effects
        switch (this.environment.weather) {
            case 'rain':
                this.particleSystem.createRain(3, CONFIG.CANVAS_WIDTH);
                break;
            case 'dust_storm':
                this.particleSystem.createDustStorm(5, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
                break;
        }
    }

    /**
     * Randomly change weather conditions
     */
    changeWeather() {
        const weathers = ['clear', 'clear', 'rain', 'dust_storm'];
        this.environment.weather = weathers[Math.floor(Math.random() * weathers.length)];

        // Wind effects
        if (this.environment.weather === 'dust_storm') {
            this.environment.windActive = true;
            this.environment.windAngle = Math.random() * Math.PI * 2;
            this.environment.windForce = 0.1 + Math.random() * 0.15;
        } else if (this.environment.weather === 'rain') {
            this.environment.windActive = true;
            this.environment.windAngle = Math.PI / 2;
            this.environment.windForce = 0.05;
        } else {
            this.environment.windActive = false;
            this.environment.windForce = 0;
        }
    }

    /**
     * Handle collisions between player and obstacles
     */
    handleCollisions() {
        const collisions = CollisionDetector.checkPlayerObstacles(
            this.player,
            this.obstacleManager.obstacles
        );

        collisions.forEach(obs => {
            switch (obs.effect) {
                case 'damage':
                    this.player.battery -= obs.damage * 0.1;
                    this.player.velocityX *= -0.5;
                    this.player.velocityY *= -0.5;
                    break;
                   
                case 'slow':
                    this.player.velocityX *= 0.5;
                    this.player.velocityY *= 0.5;
                    this.player.isRecharging = false;
                    break;
                   
                case 'cargo_loss':
                    if (Math.random() < 0.3) {
                        this.player.cargo = 'Cargo Lost!';
                    }
                    this.player.velocityX *= -0.3;
                    this.player.velocityY *= -0.3;
                    break;
                   
                case 'block':
                    // Push player away
                    const dx = this.player.x - obs.x;
                    const dy = this.player.y - obs.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    this.player.x = obs.x + (dx / dist) * (obs.radius || 50);
                    this.player.y = obs.y + (dy / dist) * (obs.radius || 50);
                    this.player.velocityX *= -0.5;
                    this.player.velocityY *= -0.5;
                    break;
                   
                case 'no_recharge':
                    this.player.isRecharging = false;
                    break;
                   
                case 'recharge':
                    this.player.isRecharging = true;
                    break;
            }
        });

        // Check if player left charging station
        const onCharger = collisions.some(obs => obs.effect === 'recharge');
        if (!onCharger) {
            this.player.isRecharging = false;
        }
    }

    /**
     * Check if player reached delivery points
     */
    checkDeliveries() {
        this.deliveryPoints.forEach(point => {
            if (point.completed) return;

            const dx = this.player.x - point.x;
            const dy = this.player.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < point.radius + this.player.radius) {
                point.completed = true;
                this.player.deliveries++;
                this.player.score += 200;
                this.player.cargo = 'Delivered!';
               
                // Recharge bonus for successful delivery
                this.player.battery = Math.min(this.player.maxBattery, this.player.battery + 15);
            }
        });
    }

    /**
     * Render everything
     */
    render() {
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // Draw African savanna background
        this.drawBackground(ctx);

        // Draw delivery points
        this.drawDeliveryPoints(ctx);

        // Draw obstacles
        this.obstacleManager.draw(ctx);

        // Draw particles
        this.particleSystem.draw(ctx);

        // Draw player
        this.player.draw(ctx);

        // Draw weather overlay
        this.drawWeatherOverlay(ctx);

        // Draw mini-map
        this.drawMiniMap(ctx);
    }

    /**
     * Draw African savanna background
     */
    drawBackground(ctx) {
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT * 0.6);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.5, '#B3E5FC');
        skyGradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // Sun
        ctx.beginPath();
        ctx.arc(CONFIG.CANVAS_WIDTH - 100, 80, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD54F';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CONFIG.CANVAS_WIDTH - 100, 80, 50, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 213, 79, 0.3)';
        ctx.fill();

        // Ground
        const groundGradient = ctx.createLinearGradient(0, CONFIG.CANVAS_HEIGHT * 0.4, 0, CONFIG.CANVAS_HEIGHT);
        groundGradient.addColorStop(0, '#A5D6A7');
        groundGradient.addColorStop(0.5, '#81C784');
        groundGradient.addColorStop(1, '#66BB6A');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, CONFIG.CANVAS_HEIGHT * 0.4, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT * 0.6);

        // Distant mountains
        ctx.beginPath();
        ctx.moveTo(0, CONFIG.CANVAS_HEIGHT * 0.4);
        ctx.lineTo(150, CONFIG.CANVAS_HEIGHT * 0.25);
        ctx.lineTo(300, CONFIG.CANVAS_HEIGHT * 0.38);
        ctx.lineTo(500, CONFIG.CANVAS_HEIGHT * 0.2);
        ctx.lineTo(700, CONFIG.CANVAS_HEIGHT * 0.35);
        ctx.lineTo(900, CONFIG.CANVAS_HEIGHT * 0.22);
        ctx.lineTo(1100, CONFIG.CANVAS_HEIGHT * 0.36);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT * 0.3);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT * 0.4);
        ctx.closePath();
        ctx.fillStyle = 'rgba(121, 85, 72, 0.4)';
        ctx.fill();

        // Acacia trees
        this.drawTree(ctx, 100, 500);
        this.drawTree(ctx, 950, 450);
        this.drawTree(ctx, 550, 650);
        this.drawTree(ctx, 1100, 600);
    }

    /**
     * Draw an acacia tree
     */
    drawTree(ctx, x, y) {
        // Trunk
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x - 3, y - 60);
        ctx.lineTo(x + 3, y - 60);
        ctx.lineTo(x + 5, y);
        ctx.fillStyle = '#5D4037';
        ctx.fill();

        // Canopy
        ctx.beginPath();
        ctx.ellipse(x, y - 70, 50, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2E7D32';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x - 20, y - 65, 30, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#388E3C';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 20, y - 65, 30, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#388E3C';
        ctx.fill();
    }

    /**
     * Draw delivery points
     */
    drawDeliveryPoints(ctx) {
        this.deliveryPoints.forEach((point, index) => {
            if (point.completed) return;

            const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;

            // Glow
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.radius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
            ctx.fill();

            // Delivery marker
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#FFC107';
            ctx.fill();
            ctx.strokeStyle = '#FF8F00';
            ctx.lineWidth = 3;
            ctx.stroke();

            // House icon
            ctx.beginPath();
            ctx.moveTo(point.x - 10, point.y + 5);
            ctx.lineTo(point.x, point.y - 10);
            ctx.lineTo(point.x + 10, point.y + 5);
            ctx.closePath();
            ctx.fillStyle = '#5D4037';
            ctx.fill();

            ctx.fillStyle = '#5D4037';
            ctx.fillRect(point.x - 8, point.y + 5, 16, 10);

            // Label
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(`Delivery ${index + 1}`, point.x, point.y - 20);
        });
    }

    /**
     * Draw weather overlay effects
     */
    drawWeatherOverlay(ctx) {
        if (this.environment.weather === 'rain') {
            ctx.fillStyle = 'rgba(100, 100, 150, 0.15)';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        } else if (this.environment.weather === 'dust_storm') {
            ctx.fillStyle = 'rgba(194, 178, 128, 0.15)';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }
    }

    /**
     * Draw mini-map in corner
     */
    drawMiniMap(ctx) {
        const mapX = CONFIG.CANVAS_WIDTH - 170;
        const mapY = CONFIG.CANVAS_HEIGHT - 140;
        const mapW = 150;
        const mapH = 120;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(mapX, mapY, mapW, mapH);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX, mapY, mapW, mapH);

        // Scale factor
        const scaleX = mapW / CONFIG.CANVAS_WIDTH;
        const scaleY = mapH / CONFIG.CANVAS_HEIGHT;

        // Draw delivery points
        this.deliveryPoints.forEach(point => {
            if (point.completed) return;
            ctx.beginPath();
            ctx.arc(mapX + point.x * scaleX, mapY + point.y * scaleY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFC107';
            ctx.fill();
        });

        // Draw obstacles
        this.obstacleManager.obstacles.forEach(obs => {
            ctx.beginPath();
            ctx.arc(mapX + obs.x * scaleX, mapY + obs.y * scaleY, 2, 0, Math.PI * 2);
            ctx.fillStyle = obs.type === 'charging_station' ? '#4CAF50' : '#f44336';
            ctx.fill();
        });

        // Draw player
        ctx.beginPath();
        ctx.arc(mapX + this.player.x * scaleX, mapY + this.player.y * scaleY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#2196F3';
        ctx.fill();

        // Label
        ctx.font = '10px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText('MINI-MAP', mapX + 5, mapY + 12);
    }
}

// ==================== INITIALIZE GAME ====================
window.addEventListener('load', () => {
    new EcoDashGame();
});

