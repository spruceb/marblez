import * as THREE from 'three';
import { System } from '../engine/ecs/System';
import { IWorld, IEntity } from '../types/ecs';
import { Collider, Transform } from '../components';
import { ICollider, ITransform } from '../types/components';

/**
 * System for visualizing colliders in the scene
 * This is a debugging tool and should be disabled in production
 */
export class ColliderVisualizer extends System {
  private scene: THREE.Scene;
  private visualizers: Map<number, THREE.Object3D>;
  
  /**
   * Create a new collider visualizer system
   * @param world The world this system operates in
   * @param scene The THREE.js scene to add visualizers to
   */
  constructor(world: IWorld, scene: THREE.Scene) {
    super(world);
    this.scene = scene;
    this.visualizers = new Map();
    this.requiredComponents = [Collider, Transform];
  }
  
  /**
   * Update the collider visualizers
   * @param deltaTime Time since last update
   */
  update(deltaTime: number): void {
    // Get all entities with colliders
    const entities = this.getEntities();
    
    // Track entities that still exist
    const existingEntities = new Set<number>();
    
    // Update existing visualizers and create new ones
    for (const entity of entities) {
      const entityId = entity.id;
      existingEntities.add(entityId);
      
      const transform = entity.getComponent(Transform) as ITransform;
      const collider = entity.getComponent(Collider) as ICollider;
      
      // Create or update visualizer
      if (!this.visualizers.has(entityId)) {
        const visualizer = this.createVisualizerForCollider(collider, transform);
        if (visualizer) {
          this.visualizers.set(entityId, visualizer);
          this.scene.add(visualizer);
        }
      } else {
        // Update existing visualizer
        const visualizer = this.visualizers.get(entityId);
        if (visualizer) {
          visualizer.position.copy(transform.position);
          visualizer.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        }
      }
    }
    
    // Remove visualizers for entities that no longer exist
    for (const [entityId, visualizer] of this.visualizers.entries()) {
      if (!existingEntities.has(entityId)) {
        this.scene.remove(visualizer);
        this.visualizers.delete(entityId);
      }
    }
  }
  
  /**
   * Create a visualizer mesh for a collider
   * @param collider The collider to visualize
   * @param transform The transform of the entity
   * @returns A THREE.js object representing the collider
   */
  private createVisualizerForCollider(collider: ICollider, transform: ITransform): THREE.Object3D | null {
    let geometry: THREE.BufferGeometry;
    
    switch (collider.type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(collider.params.radius, 16, 16);
        break;
      case 'box':
        geometry = new THREE.BoxGeometry(
          collider.params.width,
          collider.params.height,
          collider.params.depth
        );
        break;
      case 'torus':
        // Visual debug for torus - show both the tube and the inner region
        const torusGroup = new THREE.Group();
        
        // Create a torus for the main part
        const torusGeom = new THREE.TorusGeometry(
          collider.params.radius,
          collider.params.tube,
          8, // Lower radial segments for wireframe
          24  // Lower tubular segments for wireframe
        );
        const torusMesh = new THREE.Mesh(
          torusGeom,
          new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.6 
          })
        );
        
        // Create a cylinder to represent the inner hole boundary
        const innerRadius = collider.params.innerRadius || 
          (collider.params.radius - collider.params.tube);
        const cylinderGeom = new THREE.CylinderGeometry(
          innerRadius, // Top radius
          innerRadius, // Bottom radius
          collider.params.tube * 2, // Height (tube thickness * 2 for visibility)
          16, // radialSegments
          1, // heightSegments
          true // open ended
        );
        const cylinderMesh = new THREE.Mesh(
          cylinderGeom,
          new THREE.MeshBasicMaterial({ 
            color: 0xff00ff, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.6 
          })
        );
        
        // Add both to the group
        torusGroup.add(torusMesh);
        torusGroup.add(cylinderMesh);
        
        // Set initial position and rotation
        torusGroup.position.copy(transform.position);
        torusGroup.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        
        return torusGroup;
      default:
        return null;
    }
    
    // For box and sphere, create a simple wireframe mesh
    const material = new THREE.MeshBasicMaterial({ 
      color: collider.isTrigger ? 0x00ff00 : 0xff0000, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.6 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(transform.position);
    mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    
    return mesh;
  }
  
  /**
   * Clean up by removing all visualizers from the scene
   */
  cleanup(): void {
    for (const visualizer of this.visualizers.values()) {
      this.scene.remove(visualizer);
    }
    this.visualizers.clear();
  }
}