import { System } from '../engine/ecs/System.js';
import { Transform, Physics, Jump } from '../components/index.js';

/**
 * System that handles jumping state transitions
 */
export class JumpSystem extends System {
  /**
   * Create a new jump system
   * @param {World} world - The world this system operates in
   */
  constructor(world) {
    super(world);
    this.requiredComponents = [Transform, Physics, Jump];
  }
  
  /**
   * Update jumping states
   * @param {number} deltaTime - Time in seconds since the last update
   */
  update(deltaTime) {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      const physics = entity.getComponent(Physics);
      const jump = entity.getComponent(Jump);
      
      // When landing on a surface from jumping or falling
      if ((jump.isJumping || jump.isFalling) && jump.isOnSurface) {
        jump.isJumping = false;
        jump.isFalling = false;
        physics.velocity.y = 0;
      }
      
      // When jumping turns to falling
      if (jump.isJumping && physics.velocity.y < 0) {
        jump.isJumping = false;
        jump.isFalling = true;
      }
      
      // When not on a surface, we're either jumping or falling
      if (!jump.isOnSurface && !jump.isJumping && !jump.isFalling) {
        jump.isFalling = true;
      }
    }
  }
}