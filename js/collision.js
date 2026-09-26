
 class CollisionDetector {
    /**
     * Circle-to-Circle collision detection
     * Uses distance formula: d = √((x2-x1)² + (y2-y1)²)
     */
    static circleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }

    /**
     * AABB (Axis-Aligned Bounding Box) collision detection
     * Checks if two rectangles overlap
     */
    static aabbCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * Circle-to-Rectangle collision detection
     * Finds closest point on rectangle to circle center
     */
    static circleRectCollision(circle, rect) {
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
       
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
       
        return (dx * dx + dy * dy) < (circle.radius * circle.radius);
    }

    /**
     * Check all collisions between player and obstacles
     * Returns array of collided obstacles
     */
    static checkPlayerObstacles(player, obstacles) {
        const collisions = [];
        const playerCircle = { x: player.x, y: player.y, radius: player.radius };

        obstacles.forEach(obs => {
            let collided = false;
           
            if (obs.type === 'pothole' || obs.type === 'wildlife' ||
                obs.type === 'loadshedding' || obs.type === 'charging_station') {
                collided = this.circleCollision(playerCircle, obs);
            } else {
                const obsBounds = obs.getBounds();
                collided = this.circleRectCollision(playerCircle, obsBounds);
            }

            if (collided) {
                collisions.push(obs);
            }
        });

        return collisions;
    }
}


