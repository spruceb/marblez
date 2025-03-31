import { Component } from '../engine/ecs/Component';
import { IPhysics } from '../types/components';
import * as THREE from 'three';
import { PHYSICS } from '../utils/Constants';

/**
 * Component for physics properties (velocity, mass, etc.)
 */
export class Physics extends Component implements IPhysics {
  velocity: THREE.Vector3;
  mass: number;
  gravity: number;
  friction: number;
  airFriction: number;
  bounceCoefficient: number;
  isOnGround: boolean;
  isStatic: boolean;
  
  /**
   * Create a new physics component
   * @param mass Mass of the entity
   * @param gravity Gravity applied to the entity
   */
  constructor(mass: number = 1, gravity: number = PHYSICS.GRAVITY) {
    super();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.mass = mass;
    this.gravity = gravity;
    this.friction = PHYSICS.GROUND_FRICTION;
    this.airFriction = PHYSICS.AIR_FRICTION;
    this.bounceCoefficient = PHYSICS.BOUNCE_COEFFICIENT;
    this.isOnGround = false;
    this.isStatic = false; // If true, this entity doesn't move (like platforms)
  }
}