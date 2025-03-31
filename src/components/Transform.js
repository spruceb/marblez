import { Component } from '../engine/ecs/Component.js';
import * as THREE from 'three';

/**
 * Component for position, rotation, and scale
 */
export class Transform extends Component {
  /**
   * Create a new transform component
   * @param {THREE.Vector3} position - Initial position
   * @param {THREE.Vector3} rotation - Initial rotation (in radians)
   * @param {THREE.Vector3} scale - Initial scale
   */
  constructor(
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Vector3(0, 0, 0),
    scale = new THREE.Vector3(1, 1, 1)
  ) {
    super();
    this.position = position.clone();
    this.rotation = rotation.clone();
    this.scale = scale.clone();
    
    // Previous position for collision handling
    this.previousPosition = position.clone();
  }
  
  /**
   * Save the current position as previous position
   */
  savePreviousPosition() {
    this.previousPosition.copy(this.position);
  }
}