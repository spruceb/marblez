import { System } from '../engine/ecs/System';
import { Transform, Render, Physics, MarbleTag, Collider } from '../components';
import { IEntity, IWorld } from '../types/ecs';
import { IRenderSystem } from '../types/systems';
import { ITransform, IRender, IPhysics, ICollider } from '../types/components';
import * as THREE from 'three';

/**
 * System that updates mesh positions and rotations for rendering
 */
export class RenderSystem extends System implements IRenderSystem {
  scene: THREE.Scene;
  
  /**
   * Create a new render system
   * @param world The world this system operates in
   * @param scene The Three.js scene
   */
  constructor(world: IWorld, scene: THREE.Scene) {
    super(world);
    this.requiredComponents = [Transform, Render];
    this.scene = scene;
  }
  
  /**
   * Update entity meshes for rendering
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent(Transform) as ITransform;
      const render = entity.getComponent(Render) as IRender;
      
      if (render.visible && render.mesh) {
        // Update mesh position and rotation
        render.mesh.position.copy(transform.position);
        
        // Special rotation handling for marbles (rolling)
        const physics = entity.getComponent(Physics) as IPhysics | undefined;
        const isMarble = entity.hasComponent(MarbleTag);
        
        if (isMarble && physics) {
          // For marbles, use physics-based rolling rotation
          this.updateMarbleRotation(entity, transform, render, physics, deltaTime);
        } else {
          // For other objects, use the transform rotation directly
          // Direct assignment for Euler rotation
          render.mesh.rotation.x = transform.rotation.x;
          render.mesh.rotation.y = transform.rotation.y;
          render.mesh.rotation.z = transform.rotation.z;
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
   * @param entity The marble entity
   * @param transform The transform component
   * @param render The render component
   * @param physics The physics component
   * @param deltaTime Time in seconds since the last update
   */
  updateMarbleRotation(
    entity: IEntity, 
    transform: ITransform, 
    render: IRender, 
    physics: IPhysics, 
    deltaTime: number
  ): void {
    // Get marble radius from collider or mesh
    let radius = 1;
    
    // Check if entity has a physics collider with radius
    const collider = entity.getComponent(Collider) as ICollider | undefined;
    if (collider && collider.type === 'sphere' && collider.params.radius) {
      radius = collider.params.radius;
    } else if (
      render.mesh instanceof THREE.Mesh && 
      render.mesh.geometry instanceof THREE.SphereGeometry && 
      (render.mesh.geometry as THREE.SphereGeometry).parameters && 
      (render.mesh.geometry as THREE.SphereGeometry).parameters.radius
    ) {
      radius = (render.mesh.geometry as THREE.SphereGeometry).parameters.radius;
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