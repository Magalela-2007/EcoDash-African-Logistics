class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.rotation = 0;
       
        // Configure based on type
        this.configureByType();
    }

    configureByType() {
        switch (this.type) {
            case 'pothole':
                this.radius = 25;
                this.color = '#3E2723';
                this.damage = 10; // Battery damage
                this.effect = 'damage';
                break;
            case 'river':
                this.width = 80;
                this.height = 60;
                this.color = '#2196F3';
                this.effect = 'slow';
                this.speedMultiplier = 0.5;
                break;
            case 'wildlife':
                this.radius = 20;
                this.color = '#FF9800';
                this.effect = 'cargo_loss';
                this.speed = 1.5;
                this.direction = Math.random() * Math.PI * 2;
                break;
            case 'fallen_tree':
                this.width = 60;
                this.height = 20;
                this.color = '#5D4037';
                this.effect = 'block';
                break;
            case 'construction':
                this.width = 70;
                this.height = 70;
                this.color = '#FFC107';
                this.effect = 'block';
                break;
            case 'loadshedding':
                this.radius = 40;
                this.color = '#9C27B0';
                this.effect = 'no_recharge';
                break;
            case 'charging_station':
                this.radius = 30;
                this.color = '#4CAF50';
                this.effect = 'recharge';
                break;
            default:
                this.radius = 20;
                this.color = '#666';
                this.effect = 'none';
        }
    }

    update(dt) {
        // Wildlife moves
        if (this.type === 'wildlife') {
            this.x += Math.cos(this.direction) * this.speed;
            this.y += Math.sin(this.direction) * this.speed;
           
            // Bounce off boundaries
            if (this.x < this.radius || this.x > 1200 - this.radius) {
                this.direction = Math.PI - this.direction;
            }
            if (this.y < this.radius || this.y > 800 - this.radius) {
                this.direction = -this.direction;
            }
        }
       
        this.rotation += 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        switch (this.type) {
            case 'pothole':
                this.drawPothole(ctx);
                break;
            case 'river':
                this.drawRiver(ctx);
                break;
            case 'wildlife':
                this.drawWildlife(ctx);
                break;
            case 'fallen_tree':
                this.drawFallenTree(ctx);
                break;
            case 'construction':
                this.drawConstruction(ctx);
                break;
            case 'loadshedding':
                this.drawLoadshedding(ctx);
                break;
            case 'charging_station':
                this.drawChargingStation(ctx);
                break;
        }

        ctx.restore();
    }

    drawPothole(ctx) {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#3E2723';
        ctx.fill();
        ctx.strokeStyle = '#1B0000';
        ctx.lineWidth = 2;
        ctx.stroke();
       
        // Cracks
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-5, 5);
        ctx.lineTo(0, -2);
        ctx.lineTo(8, 6);
        ctx.strokeStyle = '#1B0000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawRiver(ctx) {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
        ctx.fill();
       
        // Water ripples
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width / 2 - i * 10, this.height / 2 - i * 5, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - i * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    drawWildlife(ctx) {
        // Simple animal shape (wildebeest)
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#8D6E63';
        ctx.fill();
       
        // Head
        ctx.beginPath();
        ctx.arc(this.radius * 0.8, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#6D4C41';
        ctx.fill();
       
        // Horns
        ctx.beginPath();
        ctx.moveTo(this.radius * 0.8, -this.radius * 0.6);
        ctx.lineTo(this.radius * 0.7, -this.radius * 1.2);
        ctx.lineTo(this.radius * 0.9, -this.radius * 1.2);
        ctx.lineTo(this.radius * 0.85, -this.radius * 0.6);
        ctx.fillStyle = '#3E2723';
        ctx.fill();
    }

    drawFallenTree(ctx) {
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
       
        // Bark texture
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1;
        for (let i = -this.width / 2 + 5; i < this.width / 2; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, -this.height / 2);
            ctx.lineTo(i, this.height / 2);
            ctx.stroke();
        }
    }

    drawConstruction(ctx) {
        // Construction zone
        ctx.fillStyle = '#FFC107';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
       
        // Warning stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.clip();
       
        for (let i = -this.width; i < this.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, -this.height / 2);
            ctx.lineTo(i + 20, this.height / 2);
            ctx.strokeStyle = '#212121';
            ctx.lineWidth = 8;
            ctx.stroke();
        }
        ctx.restore();
       
        // Border
        ctx.strokeStyle = '#F57F17';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    drawLoadshedding(ctx) {
        // Dark cloud effect
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(156, 39, 176, 0.3)';
        ctx.fill();
       
        // Lightning bolt
        ctx.beginPath();
        ctx.moveTo(-5, -this.radius * 0.6);
        ctx.lineTo(5, -5);
        ctx.lineTo(-3, -5);
        ctx.lineTo(5, this.radius * 0.6);
        ctx.strokeStyle = '#FFEB3B';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawChargingStation(ctx) {
        // Solar panel
        ctx.beginPath();
        ctx.rect(-this.radius * 0.8, -this.radius * 0.8, this.radius * 1.6, this.radius * 1.0);
        ctx.fillStyle = '#1565C0';
        ctx.fill();
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 2;
        ctx.stroke();
       
        // Grid lines
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-this.radius * 0.8 + i * this.radius * 0.53, -this.radius * 0.8);
            ctx.lineTo(-this.radius * 0.8 + i * this.radius * 0.53, -this.radius * 0.8 + this.radius);
            ctx.stroke();
        }
       
        // Base
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.3, this.radius * 0.2);
        ctx.lineTo(0, this.radius * 1.5);
        ctx.lineTo(this.radius * 0.3, this.radius * 0.2);
        ctx.fillStyle = '#757575';
        ctx.fill();
       
        // Glow effect
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(76, 175, 80, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * Get bounding box for AABB collision
     */
    getBounds() {
        if (this.type === 'pothole' || this.type === 'wildlife' ||
            this.type === 'loadshedding' || this.type === 'charging_station') {
            return {
                x: this.x - this.radius,
                y: this.y - this.radius,
                width: this.radius * 2,
                height: this.radius * 2
            };
        }
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

/**
 * Obstacle Manager - Handles spawning and updating all obstacles
 */
class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 120; // frames
        this.difficulty = 1;
    }

    /**
     * Spawn a new random obstacle
     */
    spawnObstacle() {
        const types = ['pothole', 'river', 'wildlife', 'fallen_tree', 'construction', 'loadshedding'];
        const type = types[Math.floor(Math.random() * types.length)];
       
        // Random position (avoid player spawn area)
        let x, y;
        do {
            x = Math.random() * (this.canvasWidth - 100) + 50;
            y = Math.random() * (this.canvasHeight - 100) + 100;
        } while (Math.hypot(x - 100, y - 100) < 150); // Avoid player spawn
       
        this.obstacles.push(new Obstacle(x, y, type));
    }

    /**
     * Spawn a charging station
     */
    spawnChargingStation() {
        const x = Math.random() * (this.canvasWidth - 100) + 50;
        const y = Math.random() * (this.canvasHeight - 100) + 100;
        this.obstacles.push(new Obstacle(x, y, 'charging_station'));
    }

    update(dt) {
        // Update existing obstacles
        this.obstacles.forEach(obs => obs.update(dt));

        // Spawn new obstacles
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval / this.difficulty) {
            this.spawnTimer = 0;
            this.spawnObstacle();
           
            // Occasionally spawn charging station
            if (Math.random() < 0.15) {
                this.spawnChargingStation();
            }
        }

        // Remove inactive obstacles (off screen)
        this.obstacles = this.obstacles.filter(obs => {
            return obs.x > -100 && obs.x < this.canvasWidth + 100 &&
                   obs.y > -100 && obs.y < this.canvasHeight + 100;
        });
    }

    draw(ctx) {
        this.obstacles.forEach(obs => obs.draw(ctx));
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.difficulty = 1;
    }
}
