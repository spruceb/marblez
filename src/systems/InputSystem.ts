import { System } from '../engine/ecs/System';
import { PlayerControl, Jump, Camera } from '../components';
import { IEntity, IWorld } from '../types/ecs';
import { IInputSystem } from '../types/systems';
import { InputManager } from '../engine/InputManager';
import { IPlayerControl, IJump, ICamera } from '../types/components';

/**
 * System that processes player input and updates relevant components
 */
export class InputSystem extends System implements IInputSystem {
  inputManager: InputManager;
  
  /**
   * Create a new input system
   * @param world The world this system operates in
   * @param inputManager The input manager
   */
  constructor(world: IWorld, inputManager: InputManager) {
    super(world);
    this.requiredComponents = [PlayerControl];
    this.inputManager = inputManager;
  }
  
  /**
   * Update player entities based on input
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const playerControl = entity.getComponent(PlayerControl) as IPlayerControl;
      
      // Update movement direction based on input and camera angle
      let cameraAngle = 0;
      const camera = entity.getComponent(Camera) as ICamera | undefined;
      if (camera) {
        // Get the camera angle (now updated in CameraSystem)
        cameraAngle = camera.angle;
      }
      
      // Set movement direction
      playerControl.setMoveDirection(this.inputManager.keys, cameraAngle);
      
      // Handle jump input
      const jump = entity.getComponent(Jump) as IJump | undefined;
      if (jump && this.inputManager.isKeyDown(' ')) {
        jump.requestJump();
      }
    }
    
    // Update input manager for next frame
    this.inputManager.update();
  }
}