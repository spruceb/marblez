import { System } from '../engine/ecs/System';
import { Transform, Physics, Jump, PlayerControl } from '../components';
import { IEntity, IWorld } from '../types/ecs';
import { IPhysicsSystem } from '../types/systems';
import { ITransform, IPhysics, IJump, IPlayerControl } from '../types/components';
import * as THREE from 'three';

/**
 * System that updates entity positions based on physics
 */
export class PhysicsSystem extends System implements IPhysicsSystem {
  /**
   * Create a new physics system
   * @param world The world this system operates in
   */
  constructor(world: IWorld) {
    super(world);
    this.requiredComponents = [Transform, Physics];
  }
  
  /**
   * Update entity physics
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent(Transform) as ITransform;
      const physics = entity.getComponent(Physics) as IPhysics;
      
      // Skip static entities
      if (physics.isStatic) continue;
      
      // Save previous position for collision resolution
      transform.savePreviousPosition();
      
      // Handle player movement
      const playerControl = entity.getComponent(PlayerControl) as IPlayerControl | undefined;
      if (playerControl) {
        this.processPlayerMovement(entity, transform, physics, playerControl, deltaTime);
      }
      
      // Handle jumping
      const jump = entity.getComponent(Jump) as IJump | undefined;
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
   * @param entity The player entity
   * @param transform The entity's transform component
   * @param physics The entity's physics component
   * @param playerControl The player control component
   * @param deltaTime Time in seconds since the last update
   */
  processPlayerMovement(
    entity: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    playerControl: IPlayerControl, 
    deltaTime: number
  ): void {
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
   * @param entity The entity
   * @param transform The entity's transform component
   * @param physics The entity's physics component
   * @param jump The entity's jump component
   * @param deltaTime Time in seconds since the last update
   */
  processJumping(
    entity: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    jump: IJump, 
    deltaTime: number
  ): void {
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