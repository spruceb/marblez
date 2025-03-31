import { Component } from '../engine/ecs/Component.js';
import * as THREE from 'three';
import { CAMERA } from '../utils/Constants.js';

/**
 * Component for camera control
 */
export class Camera extends Component {
  /**
   * Create a new camera component
   * @param {THREE.Vector3} offset - Offset from target entity
   * @param {number} rotationSpeed - Speed of camera rotation
   */
  constructor(
    offset = new THREE.Vector3(0, 15, 25),
    rotationSpeed = CAMERA.ROTATION_SPEED
  ) {
    super();
    this.offset = offset.clone();
    this.rotationSpeed = rotationSpeed;
    this.angle = 0; // Current rotation angle (in radians)
    this.height = offset.y; // Fixed height above target
    this.distance = offset.z; // Fixed distance from target
  }
}