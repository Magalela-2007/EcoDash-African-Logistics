# African Logistics challange: Solar-powered Medical Deliveries in Rural Kenya 

## Problem Context 
in the rurals of kenya , many communities live more than 10 kilometres from the nearest health facility , Roads are often unpaved and become impassable during rainy seasons , medical things like vaccines , blood and emergency medication must reach these communities quick .
 traditional delivery methods face challenges such as 
 - poor road conditions 
 - long travel distances 
  
  solar powered drones offer a sustainable solution but they face 
  - limited battery range 
  - dust storms that reduce visibilly 
  # Mathematical model 
   my simulation will use these mathematics 
   ## 1.Vehicle Movement using vectors and trigonometry 
   the drones postion updates each frame using trigonomentry 
   
   angle =Math,atan2(dy,dx)
   velocityX=Math.cos(angle)*speed
   velocityY=Math.sin(angle)*speed 
   x=x + velocityX
   y=y + velocityY

   ### 2.Battery usage 
   Battery is drained based on speed and landscape:
   
   drain=baseDrain +(speed/maxSpeed)*0.05
   battery=battery-drain 

   ### 3.Crosswind Effect 
   wind pushes the drone sideways:
   
   windForce=windSpeed*Math.sin(windAngle-deoneAngle)
   velocityX=velocityX +windForce 

   ### 4.Collision Detection
   using the distance formula to detect collions 

   dx=player.x-obstacle.x 
   dy=player.y-obstacle.y
   distance=Math.qrt(dx*dx+dy*dy)
if (distance <player,radius + obstacle.raduis){
    // Collision!
}
### References 
Stadio.2026.WAS262 Module guide.Stadio higher education