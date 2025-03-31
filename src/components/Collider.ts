import { Component } from '../engine/ecs/Component';
import { ICollider, ColliderType } from '../types/components';
import * as THREE from 'three';
import { PHYSICS } from '../utils/Constants';

/**
 * Component for collision detection
 */
export class Collider extends Component implements ICollider {
  type: ColliderType;
  params: Record<string, any>;
  isTrigger: boolean;
  bounce: number;
  debugMesh: THREE.Mesh | null;
  debugVisible: boolean;
  
  /**
   * Create a new collider component
   * @param type The type of collider ('box', 'sphere', 'torus', etc.)
   * @param params Parameters for the collider (size, radius, etc.)
   */
  constructor(type: ColliderType, params: Record<string, any> = {}) {
    super();
    this.type = type;
    this.params = params;
    this.isTrigger = false; // If true, detects collisions but doesn't respond physically
    this.bounce = PHYSICS.BOUNCE_COEFFICIENT; // Bounciness factor
    
    // For debug visualization
    this.debugMesh = null;
    this.debugVisible = false;
  }
  
  /**
   * Create a debug visualization mesh for this collider
   * @param scene The scene to add the debug mesh to
   */
  createDebugMesh(scene: THREE.Scene): void {
    if (this.debugMesh) {
      scene.remove(this.debugMesh);
    }
    
    let geometry: THREE.BufferGeometry;
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    
    if (this.type === 'box') {
      geometry = new THREE.BoxGeometry(
        this.params.width || 1,
        this.params.height || 1,
        this.params.depth || 1
      );
    } else if (this.type === 'sphere') {
      geometry = new THREE.SphereGeometry(this.params.radius || 1, 16, 16);
    } else if (this.type === 'torus') {
      geometry = new THREE.TorusGeometry(
        this.params.radius || 1,
        this.params.tube || 0.5,
        16, 32
      );
    } else {
      // Default to simple cube
      geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    this.debugMesh = new THREE.Mesh(geometry, material);
    if (this.debugVisible) {
      scene.add(this.debugMesh);
    }
  }
  
  /**
   * Show or hide the debug visualization
   * @param visible Whether the debug mesh should be visible
   * @param scene The scene containing the debug mesh
   */
  setDebugVisible(visible: boolean, scene: THREE.Scene): void {
    this.debugVisible = visible;
    
    if (!this.debugMesh && visible) {
      this.createDebugMesh(scene);
    }
    
    if (this.debugMesh) {
      if (visible && !this.debugMesh.parent) {
        scene.add(this.debugMesh);
      } else if (!visible && this.debugMesh.parent) {
        scene.remove(this.debugMesh);
      }
    }
  }
}