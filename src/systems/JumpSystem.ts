import { System } from '../engine/ecs/System';
import { Transform, Physics, Jump } from '../components';
import { IEntity, IWorld } from '../types/ecs';
import { IJumpSystem } from '../types/systems';
import { ITransform, IPhysics, IJump } from '../types/components';

/**
 * System that handles jumping state transitions
 */
export class JumpSystem extends System implements IJumpSystem {
  /**
   * Create a new jump system
   * @param world The world this system operates in
   */
  constructor(world: IWorld) {
    super(world);
    this.requiredComponents = [Transform, Physics, Jump];
  }
  
  /**
   * Update jumping states
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent(Transform) as ITransform;
      const physics = entity.getComponent(Physics) as IPhysics;
      const jump = entity.getComponent(Jump) as IJump;
      
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