import { System } from '../engine/ecs/System.js';
import { PlayerControl, Jump, Camera } from '../components/index.js';

/**
 * System that processes player input and updates relevant components
 */
export class InputSystem extends System {
  /**
   * Create a new input system
   * @param {World} world - The world this system operates in
   * @param {InputManager} inputManager - The input manager
   */
  constructor(world, inputManager) {
    super(world);
    this.requiredComponents = [PlayerControl];
    this.inputManager = inputManager;
  }
  
  /**
   * Update player entities based on input
   * @param {number} deltaTime - Time in seconds since the last update
   */
  update(deltaTime) {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const playerControl = entity.getComponent(PlayerControl);
      
      // Update movement direction based on input and camera angle
      let cameraAngle = 0;
      const camera = entity.getComponent(Camera);
      if (camera) {
        // Get the camera angle (now updated in CameraSystem)
        cameraAngle = camera.angle;
      }
      
      // Set movement direction
      playerControl.setMoveDirection(this.inputManager.keys, cameraAngle);
      
      // Handle jump input
      const jump = entity.getComponent(Jump);
      if (jump && this.inputManager.isKeyDown(' ')) {
        jump.requestJump();
      }
    }
    
    // Update input manager for next frame
    this.inputManager.update();
  }
}