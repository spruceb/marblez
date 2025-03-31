import { System } from '../engine/ecs/System';
import { Transform, Physics, Jump, MarbleTag } from '../components';
import { IEntity, IWorld } from '../types/ecs';
import { IDebugSystem } from '../types/systems';
import { ITransform, IPhysics, IJump } from '../types/components';

/**
 * System that updates debug display information
 */
export class DebugSystem extends System implements IDebugSystem {
  debugElement: HTMLElement;
  frameCount: number;
  lastTime: number;
  fps: number;
  
  /**
   * Create a new debug system
   * @param world The world this system operates in
   * @param debugElement The HTML element to display debug info in
   */
  constructor(world: IWorld, debugElement: HTMLElement) {
    super(world);
    this.requiredComponents = [Transform, Physics];
    this.debugElement = debugElement;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
  }
  
  /**
   * Update debug display
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    // Update FPS counter
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;
    
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;
    }
    
    // Find player/marble entities for display
    const marbleEntities = this.world.getEntitiesWithComponents([MarbleTag, Transform, Physics]);
    
    if (marbleEntities.length > 0) {
      const entity = marbleEntities[0];
      const transform = entity.getComponent(Transform) as ITransform;
      const physics = entity.getComponent(Physics) as IPhysics;
      const jump = entity.getComponent(Jump) as IJump | undefined;
      
      let debugText = `FPS: ${this.fps}<br>`;
      
      // Basic physics and position info
      debugText += `Position: ${transform.position.x.toFixed(2)}, ${transform.position.y.toFixed(2)}, ${transform.position.z.toFixed(2)}<br>`;
      debugText += `Velocity: ${physics.velocity.x.toFixed(2)}, ${physics.velocity.y.toFixed(2)}, ${physics.velocity.z.toFixed(2)}<br>`;
      debugText += `IsOnGround: ${physics.isOnGround}<br>`;
      
      // Jump info if available
      if (jump) {
        debugText += `IsOnSurface: ${jump.isOnSurface}<br>`;
        debugText += `IsJumping: ${jump.isJumping}<br>`;
        debugText += `IsFalling: ${jump.isFalling}<br>`;
        debugText += `JumpCooldown: ${jump.jumpCooldown.toFixed(2)}<br>`;
      }
      
      // Update the debug element
      this.debugElement.innerHTML = debugText;
    }
  }
}