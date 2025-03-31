import { System } from '../engine/ecs/System.js';
import { Transform, Render, Physics, MarbleTag } from '../components/index.js';
import * as THREE from 'three';

/**
 * System that updates mesh positions and rotations for rendering
 */
export class RenderSystem extends System {
  /**
   * Create a new render system
   * @param {World} world - The world this system operates in
   * @param {THREE.Scene} scene - The Three.js scene
   */
  constructor(world, scene) {
    super(world);
    this.requiredComponents = [Transform, Render];
    this.scene = scene;
  }
  
  /**
   * Update entity meshes for rendering
   * @param {number} deltaTime - Time in seconds since the last update
   */
  update(deltaTime) {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      const render = entity.getComponent(Render);
      
      if (render.visible && render.mesh) {
        // Update mesh position and rotation
        render.mesh.position.copy(transform.position);
        
        // Special rotation handling for marbles (rolling)
        const physics = entity.getComponent(Physics);
        const isMarble = entity.hasComponent(MarbleTag);
        
        if (isMarble && physics) {
          // For marbles, use physics-based rolling rotation
          this.updateMarbleRotation(entity, transform, render, physics, deltaTime);
        } else {
          // For other objects, use the transform rotation directly
          render.mesh.rotation.set(
            transform.rotation.x,
            transform.rotation.y,
            transform.rotation.z
          );
        }
        
        // Add to scene if not already added
        if (!render.mesh.parent) {
          this.scene.add(render.mesh);
        }
      }
    }
  }
  
  /**
   * Update marble rotation based on physics for rolling effect
   * @param {Entity} entity - The marble entity
   * @param {Transform} transform - The transform component
   * @param {Render} render - The render component
   * @param {Physics} physics - The physics component
   * @param {number} deltaTime - Time in seconds since the last update
   */
  updateMarbleRotation(entity, transform, render, physics, deltaTime) {
    // Get marble radius from collider or mesh
    let radius = 1;
    
    // Check if entity has a physics collider with radius
    const collider = entity.getComponent('Collider');
    if (collider && collider.type === 'sphere' && collider.params.radius) {
      radius = collider.params.radius;
    } else if (render.mesh.geometry.parameters && render.mesh.geometry.parameters.radius) {
      radius = render.mesh.geometry.parameters.radius;
    }
    
    // Calculate rotation based on velocity and radius
    const rotationFactor = 1 / radius;
    
    // Update rotation based on velocity
    // Rolling on Z axis based on X velocity (left/right movement)
    render.mesh.rotation.z -= physics.velocity.x * rotationFactor;
    
    // Rolling on X axis based on Z velocity (forward/backward movement)
    render.mesh.rotation.x += physics.velocity.z * rotationFactor;
  }
}