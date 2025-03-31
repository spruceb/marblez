import { Component } from '../engine/ecs/Component';
import { IJump } from '../types/components';
import { PHYSICS } from '../utils/Constants';

/**
 * Component for jumping behavior and state
 */
export class Jump extends Component implements IJump {
  jumpPower: number;
  isJumping: boolean;
  isFalling: boolean;
  isOnSurface: boolean;
  jumpRequested: boolean;
  canJump: boolean;
  jumpCooldown: number;
  jumpCooldownTime: number;
  
  /**
   * Create a new jump component
   * @param jumpPower The initial upward velocity on jump
   */
  constructor(jumpPower: number = PHYSICS.JUMP_POWER) {
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
  requestJump(): void {
    if (this.canJump && this.isOnSurface && !this.isJumping && this.jumpCooldown <= 0) {
      this.jumpRequested = true;
    }
  }
  
  /**
   * Execute the jump if one was requested
   * @returns True if a jump was executed, false otherwise
   */
  executeJumpIfRequested(): boolean {
    if (this.jumpRequested && this.isOnSurface && this.jumpCooldown <= 0) {
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
   * @param deltaTime Time in seconds since the last update
   */
  updateCooldown(deltaTime: number): void {
    if (this.jumpCooldown > 0) {
      this.jumpCooldown = Math.max(0, this.jumpCooldown - deltaTime);
    }
  }
}