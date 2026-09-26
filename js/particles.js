class ParticleSystem {
    constructor() {
        this.particles = [];
        this.weatherParticles = [];
    }

    /**
     * Create dust trail particles behind the drone
     * Each particle has position, velocity, life, and size
     */
    createDust(x, y, angle, speed) {
        const count = Math.floor(speed * 2) + 1;
       
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x - Math.cos(angle) * 15 + (Math.random() - 0.5) * 10,
                y: y - Math.sin(angle) * 15 + (Math.random() - 0.5) * 10,
                vx: -Math.cos(angle) * speed * 0.3 + (Math.random() - 0.5) * 2,
                vy: -Math.sin(angle) * speed * 0.3 + (Math.random() - 0.5) * 2,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.01,
                size: 3 + Math.random() * 5,
                color: `rgba(139, 119, 101, ${0.3 + Math.random() * 0.3})`
            });
        }
    }

    /**
     * Create rain particles for weather effects
     */
    createRain(count, canvasWidth) {
        for (let i = 0; i < count; i++) {
            this.weatherParticles.push({
                x: Math.random() * canvasWidth,
                y: -10,
                vx: 2 + Math.random() * 2,
                vy: 8 + Math.random() * 4,
                length: 10 + Math.random() * 10,
                life: 1.0
            });
        }
    }

    /**
     * Create dust storm particles
     */
    createDustStorm(count, canvasWidth, canvasHeight) {
        for (let i = 0; i < count; i++) {
            this.weatherParticles.push({
                x: -10,
                y: Math.random() * canvasHeight,
                vx: 5 + Math.random() * 5,
                vy: (Math.random() - 0.5) * 2,
                size: 5 + Math.random() * 15,
                life: 1.0,
                color: `rgba(194, 178, 128, ${0.1 + Math.random() * 0.2})`
            });
        }
    }

    update(canvasWidth, canvasHeight) {
        // Update dust particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= p.decay;
            p.size *= 0.99;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update weather particles
        for (let i = this.weatherParticles.length - 1; i >= 0; i--) {
            const p = this.weatherParticles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x > canvasWidth + 20 || p.y > canvasHeight + 20 || p.life <= 0) {
                this.weatherParticles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw dust particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.life * 0.5})`);
            ctx.fill();
        });

        // Draw weather particles
        this.weatherParticles.forEach(p => {
            if (p.length) {
                // Rain
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx, p.y + p.vy + p.length);
                ctx.strokeStyle = `rgba(174, 194, 224, ${p.life * 0.6})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            } else {
                // Dust
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        });
    }

    clear() {
        this.particles = [];
        this.weatherParticles = [];
    }
}