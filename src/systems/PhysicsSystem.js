import { System } from '../engine/ecs/System.js';
import { Transform, Physics, Jump, PlayerControl } from '../components/index.js';
import * as THREE from 'three';

/**
 * System that updates entity positions based on physics
 */
export class PhysicsSystem extends System {
  /**
   * Create a new physics system
   * @param {World} world - The world this system operates in
   */
  constructor(world) {
    super(world);
    this.requiredComponents = [Transform, Physics];
  }
  
  /**
   * Update entity physics
   * @param {number} deltaTime - Time in seconds since the last update
   */
  update(deltaTime) {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      const physics = entity.getComponent(Physics);
      
      // Skip static entities
      if (physics.isStatic) continue;
      
      // Save previous position for collision resolution
      transform.savePreviousPosition();
      
      // Handle player movement
      const playerControl = entity.getComponent(PlayerControl);
      if (playerControl) {
        this.processPlayerMovement(entity, transform, physics, playerControl, deltaTime);
      }
      
      // Handle jumping
      const jump = entity.getComponent(Jump);
      if (jump) {
        this.processJumping(entity, transform, physics, jump, deltaTime);
      } else {
        // Apply gravity to non-jumping entities that aren't static
        if (!physics.isOnGround) {
          physics.velocity.y -= physics.gravity;
        }
      }
      
      // Apply velocity to position
      transform.position.x += physics.velocity.x;
      transform.position.y += physics.velocity.y;
      transform.position.z += physics.velocity.z;
      
      // Apply friction
      if (physics.isOnGround) {
        physics.velocity.x *= physics.friction;
        physics.velocity.z *= physics.friction;
      } else {
        physics.velocity.x *= physics.airFriction;
        physics.velocity.z *= physics.airFriction;
      }
    }
  }
  
  /**
   * Process player movement from input
   * @param {Entity} entity - The player entity
   * @param {Transform} transform - The entity's transform component
   * @param {Physics} physics - The entity's physics component
   * @param {PlayerControl} playerControl - The player control component
   * @param {number} deltaTime - Time in seconds since the last update
   */
  processPlayerMovement(entity, transform, physics, playerControl, deltaTime) {
    // Get movement direction from player control
    const direction = playerControl.moveDirection;
    
    // Calculate movement speed based on ground contact
    const speed = physics.isOnGround ? 
      playerControl.speed : 
      playerControl.speed * playerControl.airControlFactor;
    
    // Apply movement force
    physics.velocity.x += direction.x * speed;
    physics.velocity.z += direction.z * speed;
  }
  
  /**
   * Process jumping behavior
   * @param {Entity} entity - The entity
   * @param {Transform} transform - The entity's transform component
   * @param {Physics} physics - The entity's physics component
   * @param {Jump} jump - The entity's jump component
   * @param {number} deltaTime - Time in seconds since the last update
   */
  processJumping(entity, transform, physics, jump, deltaTime) {
    // Update jump cooldown
    jump.updateCooldown(deltaTime);
    
    // Execute jump if requested
    if (jump.executeJumpIfRequested()) {
      // Apply jump velocity
      physics.velocity.y = jump.jumpPower;
      
      // Give a small boost to prevent immediate ground detection
      transform.position.y += 0.05;
      
      console.log('JUMPING!');
    }
    
    // Apply gravity if not on ground
    if (!jump.isOnSurface) {
      physics.velocity.y -= physics.gravity;
    }
    
    // Check if jump has peaked and is now falling
    if (jump.isJumping && physics.velocity.y < 0) {
      jump.isJumping = false;
      jump.isFalling = true;
    }
  }
}