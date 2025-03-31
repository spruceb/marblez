import { Component } from '../engine/ecs/Component.js';
import { PHYSICS } from '../utils/Constants.js';

/**
 * Component for jumping behavior and state
 */
export class Jump extends Component {
  /**
   * Create a new jump component
   * @param {number} jumpPower - The initial upward velocity on jump
   */
  constructor(jumpPower = PHYSICS.JUMP_POWER) {
    super();
    this.jumpPower = jumpPower;
    this.isJumping = false;
    this.isFalling = false;
    this.isOnSurface = true;
    this.jumpRequested = false;
    this.canJump = true;
    
    // Jump cooldown to prevent rapid consecutive jumps
    this.jumpCooldown = 0;
    this.jumpCooldownTime = 0.2; // seconds
  }
  
  /**
   * Request a jump to be executed on the next physics update
   * This allows for jump input and physics to be separated
   */
  requestJump() {
    if (this.canJump && this.isOnSurface && !this.isJumping && this.jumpCooldown <= 0) {
      this.jumpRequested = true;
    }
  }
  
  /**
   * Execute the jump if one was requested
   * @returns {boolean} True if a jump was executed, false otherwise
   */
  executeJumpIfRequested() {
    if (this.jumpRequested) {
      this.isJumping = true;
      this.isOnSurface = false;
      this.jumpRequested = false;
      this.jumpCooldown = this.jumpCooldownTime;
      return true;
    }
    return false;
  }
  
  /**
   * Update jump cooldown timer
   * @param {number} deltaTime - Time in seconds since the last update
   */
  updateCooldown(deltaTime) {
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }
  }
}