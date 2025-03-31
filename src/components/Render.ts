import { Component } from '../engine/ecs/Component';
import { IRender } from '../types/components';
import * as THREE from 'three';

/**
 * Component for visual representation
 */
export class Render extends Component implements IRender {
  mesh: THREE.Mesh | THREE.Group;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  
  /**
   * Create a new render component
   * @param mesh The mesh or group to render
   */
  constructor(mesh: THREE.Mesh | THREE.Group) {
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
   * @param object The object to apply settings to
   */
  applySettings(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
      object.castShadow = this.castShadow;
      object.receiveShadow = this.receiveShadow;
    }
    
    // If it's a group, apply to all children
    if (object.children && object.children.length > 0) {
      for (const child of object.children) {
        this.applySettings(child);
      }
    }
  }
}