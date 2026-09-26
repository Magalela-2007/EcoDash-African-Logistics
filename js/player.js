
class Player {
    constructor(x, y) {
        // Position
        this.x = x;
        this.y = y;
       
        // Velocity (vector components)
        this.velocityX = 0;
        this.velocityY = 0;
       
        // Physical properties
        this.radius = 18;
        this.angle = 0;
        this.thrust = 0.35;
        this.drag = 0.97;
        this.maxSpeed = 6;
       
        // Resource management
        this.maxBattery = 100;
        this.battery = 100;
        this.batteryDrainRate = 0.03;
        this.boostDrainRate = 0.08;
       
        // Status
        this.isBoosting = false;
        this.isRecharging = false;
        this.cargo = 'Medical Supplies';
        this.deliveries = 0;
        this.score = 0;
        this.distanceTravelled = 0;
        this.energyUsed = 0;
       
        // Visual
        this.rotorAngle = 0;
        this.dustParticles = [];
    }

    /**
     * Update player position using physics
     * @param {number} dt - Delta time (frame time)
     * @param {object} keys - Keyboard state
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {object} environment - Environmental modifiers (wind, etc.)
     */
    update(dt, keys, canvasWidth, canvasHeight, environment) {
        // Handle input
        let inputX = 0;
        let inputY = 0;

        if (keys['ArrowLeft'] || keys['a'] || keys['A']) inputX -= 1;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) inputX += 1;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) inputY -= 1;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) inputY += 1;

        // Normalize diagonal movement
        const inputMagnitude = Math.sqrt(inputX * inputX + inputY * inputY);
        if (inputMagnitude > 0) {
            inputX /= inputMagnitude;
            inputY /= inputMagnitude;
        }

        // Apply thrust (using trigonometry for angle calculation)
        const currentThrust = this.isBoosting ? this.thrust * 2 : this.thrust;
        this.velocityX += inputX * currentThrust;
        this.velocityY += inputY * currentThrust;

        // Calculate movement angle for visual rotation
        if (inputMagnitude > 0) {
            this.angle = Math.atan2(inputY, inputX);
        }

        // Apply environmental forces (crosswind)
        if (environment && environment.windActive) {
            this.velocityX += Math.cos(environment.windAngle) * environment.windForce;
            this.velocityY += Math.sin(environment.windAngle) * environment.windForce;
        }

        // Apply drag (friction)
        this.velocityX *= this.drag;
        this.velocityY *= this.drag;

        // Clamp to max speed
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (speed > this.maxSpeed) {
            this.velocityX = (this.velocityX / speed) * this.maxSpeed;
            this.velocityY = (this.velocityY / speed) * this.maxSpeed;
        }

        // Update position
        const prevX = this.x;
        const prevY = this.y;
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        // Track distance
        this.distanceTravelled += Math.sqrt((this.x - prevX) ** 2 + (this.y - prevY) ** 2);

        // Boundary collision (bounce back)
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.velocityX *= -0.5;
        }
        if (this.x + this.radius > canvasWidth) {
            this.x = canvasWidth - this.radius;
            this.velocityX *= -0.5;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocityY *= -0.5;
        }
        if (this.y + this.radius > canvasHeight) {
            this.y = canvasHeight - this.radius;
            this.velocityY *= -0.5;
        }

        // Battery consumption (physics-based curve)
        this.updateBattery(dt, speed);

        // Update rotor animation
        this.rotorAngle += 0.3 + speed * 0.1;

        // Spawn dust particles
        if (speed > 1) {
            this.spawnDustParticle();
        }

        // Update particles
        this.updateParticles();
    }

    /**
     * Battery drain based on speed and boost state
     * Uses non-linear curve for realistic consumption
     */
    updateBattery(dt, speed) {
        if (this.isRecharging) {
            this.battery = Math.min(this.maxBattery, this.battery + 0.3 * dt);
            return;
        }

        // Base drain + speed-dependent drain
        let drain = this.batteryDrainRate;
        drain += (speed / this.maxSpeed) * 0.05;
       
        if (this.isBoosting) {
            drain += this.boostDrainRate;
        }

        this.battery -= drain * dt;
        this.energyUsed += drain * dt;

        if (this.battery < 0) {
            this.battery = 0;
        }
    }

    /**
     * Spawn dust particle behind drone
     */
    spawnDustParticle() {
        this.dustParticles.push({
            x: this.x - Math.cos(this.angle) * this.radius,
            y: this.y - Math.sin(this.angle) * this.radius,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 1.0,
            size: Math.random() * 4 + 2
        });
    }

    /**
     * Update all dust particles
     */
    updateParticles() {
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const p = this.dustParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.size *= 0.98;

            if (p.life <= 0) {
                this.dustParticles.splice(i, 1);
            }
        }
    }

    /**
     * Draw the drone on canvas
     */
    draw(ctx) {
        // Draw dust particles first (behind drone)
        this.dustParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 119, 101, ${p.life * 0.4})`;
            ctx.fill();
        });

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);

        // Drone body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2E7D32';
        ctx.fill();
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Solar panel on top
        ctx.beginPath();
        ctx.rect(-this.radius * 0.6, -this.radius * 0.5, this.radius * 1.2, this.radius * 0.4);
        ctx.fillStyle = '#1565C0';
        ctx.fill();
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Rotor arms
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.8, -this.radius * 0.3);
        ctx.lineTo(-this.radius * 1.4, -this.radius * 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.radius * 0.8, -this.radius * 0.3);
        ctx.lineTo(this.radius * 1.4, -this.radius * 0.8);
        ctx.stroke();

        // Rotors (animated)
        ctx.save();
        ctx.translate(-this.radius * 1.4, -this.radius * 0.8);
        ctx.rotate(this.rotorAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.6, this.radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(this.radius * 1.4, -this.radius * 0.8);
        ctx.rotate(-this.rotorAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.6, this.radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
        ctx.fill();
        ctx.restore();

        // Cargo indicator
        ctx.beginPath();
        ctx.arc(0, this.radius * 0.3, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FF5722';
        ctx.fill();

        ctx.restore();

        // Battery indicator ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 6, -Math.PI / 2,
                -Math.PI / 2 + (Math.PI * 2 * (this.battery / this.maxBattery)));
        ctx.strokeStyle = this.battery > 30 ? '#4CAF50' : '#f44336';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * Reset player for new game
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.battery = this.maxBattery;
        this.deliveries = 0;
        this.score = 0;
        this.distanceTravelled = 0;
        this.energyUsed = 0;
        this.dustParticles = [];
    }
}
