import { Component } from '../engine/ecs/Component.js';
import * as THREE from 'three';
import { PHYSICS } from '../utils/Constants.js';

/**
 * Component for collision detection
 */
export class Collider extends Component {
  /**
   * Create a new collider component
   * @param {string} type - The type of collider ('box', 'sphere', 'torus', etc.)
   * @param {Object} params - Parameters for the collider (size, radius, etc.)
   */
  constructor(type, params = {}) {
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
   * @param {THREE.Scene} scene - The scene to add the debug mesh to
   */
  createDebugMesh(scene) {
    if (this.debugMesh) {
      scene.remove(this.debugMesh);
    }
    
    let geometry;
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
   * @param {boolean} visible - Whether the debug mesh should be visible
   * @param {THREE.Scene} scene - The scene containing the debug mesh
   */
  setDebugVisible(visible, scene) {
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