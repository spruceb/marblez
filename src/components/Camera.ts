import { Component } from '../engine/ecs/Component';
import { ICamera } from '../types/components';
import * as THREE from 'three';
import { CAMERA } from '../utils/Constants';

/**
 * Component for camera control
 */
export class Camera extends Component implements ICamera {
  offset: THREE.Vector3;
  rotationSpeed: number;
  angle: number;
  height: number;
  distance: number;
  
  /**
   * Create a new camera component
   * @param offset Offset from target entity
   * @param rotationSpeed Speed of camera rotation
   */
  constructor(
    offset: THREE.Vector3 = new THREE.Vector3(0, 15, 25),
    rotationSpeed: number = CAMERA.ROTATION_SPEED
  ) {
    super();
    this.offset = offset.clone();
    this.rotationSpeed = rotationSpeed;
    this.angle = 0; // Current rotation angle (in radians)
    this.height = offset.y; // Fixed height above target
    this.distance = offset.z; // Fixed distance from target
  }
}