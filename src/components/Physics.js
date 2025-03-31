import { Component } from '../engine/ecs/Component.js';
import * as THREE from 'three';
import { PHYSICS } from '../utils/Constants.js';

/**
 * Component for physics properties (velocity, mass, etc.)
 */
export class Physics extends Component {
  /**
   * Create a new physics component
   * @param {number} mass - Mass of the entity
   * @param {number} gravity - Gravity applied to the entity
   */
  constructor(mass = 1, gravity = PHYSICS.GRAVITY) {
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