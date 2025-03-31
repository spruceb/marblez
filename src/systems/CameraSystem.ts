import { System } from '../engine/ecs/System';
import { Transform, Camera, MarbleTag } from '../components';
import { IEntity, IWorld } from '../types/ecs';
import { ICameraSystem, IInputSystem } from '../types/systems';
import { ITransform, ICamera } from '../types/components';
import * as THREE from 'three';

/**
 * System that updates the camera position based on target entities
 */
export class CameraSystem extends System implements ICameraSystem {
  threeCamera: THREE.Camera;
  
  /**
   * Create a new camera system
   * @param world The world this system operates in
   * @param threeCamera The Three.js camera to control
   */
  constructor(world: IWorld, threeCamera: THREE.Camera) {
    super(world);
    this.requiredComponents = [Transform, Camera];
    this.threeCamera = threeCamera;
  }
  
  /**
   * Update camera position and rotation
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    const entities = this.getEntities();
    
    // Find entities with the MarbleTag (player camera targets)
    const playerEntities = entities.filter(entity => entity.hasComponent(MarbleTag));
    
    // Process player cameras first
    for (const entity of playerEntities) {
      this.updateCameraForEntity(entity, deltaTime);
    }
    
    // If no player cameras, process other cameras
    if (playerEntities.length === 0) {
      for (const entity of entities) {
        this.updateCameraForEntity(entity, deltaTime);
      }
    }
  }
  
  /**
   * Update camera position and rotation for a specific entity
   * @param entity The entity to follow with the camera
   * @param deltaTime Time in seconds since the last update
   */
  updateCameraForEntity(entity: IEntity, deltaTime: number): void {
    const transform = entity.getComponent(Transform) as ITransform;
    const camera = entity.getComponent(Camera) as ICamera;
    
    // Get input from keys
    const inputSystem = this.world.systems.find(s => s.constructor.name === 'InputSystem') as IInputSystem | undefined;
    if (inputSystem) {
      const keys = inputSystem.inputManager.keys;
      
      // Update camera angle with Q/E or arrow keys
      const usingArrowsForCamera = (keys['ArrowLeft'] || keys['ArrowRight']) && 
                                !(keys['w'] || keys['s'] || keys['ArrowUp'] || keys['ArrowDown']);
      
      if (keys['q'] || (usingArrowsForCamera && keys['ArrowLeft'])) {
        camera.angle -= camera.rotationSpeed;
      }
      if (keys['e'] || (usingArrowsForCamera && keys['ArrowRight'])) {
        camera.angle += camera.rotationSpeed;
      }
    }
    
    // Calculate camera position in simple circular orbit
    const x = transform.position.x + Math.sin(camera.angle) * camera.distance;
    const y = transform.position.y + camera.height;
    const z = transform.position.z + Math.cos(camera.angle) * camera.distance;
    
    // Directly set camera position (no lerping)
    this.threeCamera.position.set(x, y, z);
    
    // Look at the target entity
    this.threeCamera.lookAt(transform.position);
  }
}