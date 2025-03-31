import { Component } from '../engine/ecs/Component.js';
import { PHYSICS } from '../utils/Constants.js';

/**
 * Component for surface properties (friction, bounciness, etc.)
 */
export class Surface extends Component {
  /**
   * Create a new surface component
   * @param {number} friction - Friction coefficient
   */
  constructor(friction = PHYSICS.GROUND_FRICTION) {
    super();
    this.friction = friction;
    this.bounciness = PHYSICS.BOUNCE_COEFFICIENT;
    this.isJumpable = true; // Whether the player can jump from this surface
    this.isRamp = false; // Whether this is a ramp (affects sliding behavior)
    this.rampAngle = 0; // Angle of the ramp (in radians)
    this.slideFactor = 1.0; // How much sliding force to apply on ramps
  }
}