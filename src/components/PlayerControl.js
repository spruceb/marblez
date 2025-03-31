import { Component } from '../engine/ecs/Component.js';
import { PHYSICS } from '../utils/Constants.js';

/**
 * Component for player input and control
 */
export class PlayerControl extends Component {
  /**
   * Create a new player control component
   * @param {number} speed - Base movement speed
   */
  constructor(speed = PHYSICS.MARBLE_SPEED) {
    super();
    this.speed = speed;
    this.airControlFactor = PHYSICS.AIR_CONTROL_FACTOR;
    this.moveDirection = { x: 0, z: 0 }; // Normalized movement direction
    this.jumpRequested = false;
  }
  
  /**
   * Set the movement direction based on input
   * @param {Object} keys - Object with key states (from InputManager)
   * @param {number} cameraAngle - Current camera rotation angle (in radians)
   */
  setMoveDirection(keys, cameraAngle) {
    // Reset movement direction
    this.moveDirection.x = 0;
    this.moveDirection.z = 0;
    
    // Track if the arrow keys are being used for camera rotation
    const usingArrowsForCamera = (keys['ArrowLeft'] || keys['ArrowRight']) && 
                                !(keys['w'] || keys['s'] || keys['ArrowUp'] || keys['ArrowDown']);
    
    // Forward/backward movement
    if (keys['w'] || keys['ArrowUp']) {
      this.moveDirection.z = -1;
    } else if (keys['s'] || keys['ArrowDown']) {
      this.moveDirection.z = 1;
    }
    
    // Left/right movement
    if (keys['a'] || (keys['ArrowLeft'] && !usingArrowsForCamera)) {
      this.moveDirection.x = -1;
    } else if (keys['d'] || (keys['ArrowRight'] && !usingArrowsForCamera)) {
      this.moveDirection.x = 1;
    }
    
    // Normalize if moving diagonally
    const length = Math.sqrt(this.moveDirection.x ** 2 + this.moveDirection.z ** 2);
    if (length > 0) {
      this.moveDirection.x /= length;
      this.moveDirection.z /= length;
    }
    
    // Rotate movement direction based on camera angle
    if (length > 0 && cameraAngle !== 0) {
      const cos = Math.cos(cameraAngle);
      const sin = Math.sin(cameraAngle);
      
      const newX = this.moveDirection.x * cos + this.moveDirection.z * sin;
      const newZ = this.moveDirection.z * cos - this.moveDirection.x * sin;
      
      this.moveDirection.x = newX;
      this.moveDirection.z = newZ;
    }
  }
}