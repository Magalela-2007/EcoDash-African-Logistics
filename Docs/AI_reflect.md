###  AI Reflection 



# AI Reflection 

## 1.Date 2026-09-01

### Prompt Used:
"Write a JavaScript function that moves a player object towards the mouse pointer using velocity and acceleration."

### AI Response :
AI provided a function using `Math.atan2()` to calculate angle, then applied velocity toward the pointer.

### Problems Identified:
1. The code used a fixed speed, not realistic acceleration/drag
2. No battery consumption consideration
3. Didn't account for canvas boundaries

### How I Improved It:
I rewrote the function to include:
- Acceleration with drag (physics-based movement)
- Battery drain proportional to speed
- Boundary clamping to keep player on screen
- Added descriptive variable names like `playerVelocityX` instead of `vx`

### Final Code :

function movePlayerTowards(targetX, targetY, dt) {
    const angleToTarget = Math.atan2(targetY - player.y, targetX - player.x);
    const thrustForce = 0.3;
   
    player.velocityX += Math.cos(angleToTarget) * thrustForce;
    player.velocityY += Math.sin(angleToTarget) * thrustForce;
   
    // Apply drag
    player.velocityX *= 0.98;
    player.velocityY *= 0.98;
   
    // Update position
    player.x += player.velocityX * dt;
    player.y += player.velocityY * dt;
   
    // Boundary check
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
   
    // Battery drain
    const speed = Math.sqrt(player.velocityX ** 2 + player.velocityY ** 2);
    player.battery -= (0.01 + speed * 0.02) * dt;
}


### 2.Date 2026-09-05

Prompt Used:

"How do I implement collision detection between a circle and a rectangle in JavaScript?"

AI Response:

AI provided AABB (Axis-Aligned Bounding Box) and circle-rectangle collision code.

How I Improved It:

I created an Obstacle class with collision method, and a checkAllCollisions() function that iterates through all obstacles. Added specific responses for each obstacle type (pothole = damage, river = slow down, wildlife = lose cargo).


References

 OpenAI. 2026. ChatGPT (Version 4.0) [Large language model]. https://chat.openai.com
· MDN Web Docs. 2026. Canvas API. Mozilla Foundation. https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
· STADIO. 2026. WAS262 Web Animation Scripting Module Guide. STADIO Higher Education.