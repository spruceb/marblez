import { Component } from '../engine/ecs/Component.js';
import * as THREE from 'three';

/**
 * Component for visual representation
 */
export class Render extends Component {
  /**
   * Create a new render component
   * @param {THREE.Mesh|THREE.Group} mesh - The mesh or group to render
   */
  constructor(mesh) {
    super();
    this.mesh = mesh;
    this.visible = true;
    this.castShadow = true;
    this.receiveShadow = true;
    
    // Apply shadow settings to the mesh
    if (this.mesh) {
      this.applySettings(this.mesh);
    }
  }
  
  /**
   * Apply shadow settings to a mesh or group
   * @param {THREE.Object3D} object - The object to apply settings to
   */
  applySettings(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = this.castShadow;
      object.receiveShadow = this.receiveShadow;
    }
    
    // If it's a group, apply to all children
    if (object.children) {
      for (const child of object.children) {
        this.applySettings(child);
      }
    }
  }
}