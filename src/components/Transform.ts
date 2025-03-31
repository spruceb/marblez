import { Component } from '../engine/ecs/Component';
import { ITransform } from '../types/components';
import * as THREE from 'three';

/**
 * Component for position, rotation, and scale
 */
export class Transform extends Component implements ITransform {
  position: THREE.Vector3;
  rotation: THREE.Vector3;
  scale: THREE.Vector3;
  previousPosition: THREE.Vector3;
  
  /**
   * Create a new transform component
   * @param position Initial position
   * @param rotation Initial rotation (in radians)
   * @param scale Initial scale
   */
  constructor(
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    rotation: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
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
  savePreviousPosition(): void {
    this.previousPosition.copy(this.position);
  }
}