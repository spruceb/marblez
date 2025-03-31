import { Component } from '../engine/ecs/Component';
import { ISurface } from '../types/components';
import { PHYSICS } from '../utils/Constants';

/**
 * Component for surface properties (friction, bounciness, etc.)
 */
export class Surface extends Component implements ISurface {
  friction: number;
  bounciness: number;
  isJumpable: boolean;
  isRamp: boolean;
  rampAngle: number;
  slideFactor: number;
  
  /**
   * Create a new surface component
   * @param friction Friction coefficient
   * @param bounciness Bounciness coefficient
   * @param isRamp Whether this is a ramp
   * @param rampAngle Angle of the ramp (in radians)
   * @param slideFactor How much sliding force to apply on ramps
   * @param isJumpable Whether the player can jump from this surface
   */
  constructor(
    friction: number = PHYSICS.GROUND_FRICTION,
    bounciness: number = PHYSICS.BOUNCE_COEFFICIENT,
    isRamp: boolean = false,
    rampAngle: number = 0,
    slideFactor: number = 1.0,
    isJumpable: boolean = true
  ) {
    super();
    this.friction = friction;
    this.bounciness = bounciness;
    this.isJumpable = isJumpable;
    this.isRamp = isRamp;
    this.rampAngle = rampAngle;
    this.slideFactor = slideFactor;
  }
}