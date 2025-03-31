import * as THREE from 'three';
import { 
  Transform, 
  Physics, 
  Render, 
  Collider, 
  Jump, 
  PlayerControl, 
  Camera, 
  MarbleTag 
} from '../components/index.js';
import { OBJECTS, PHYSICS, CAMERA, COLORS } from '../utils/Constants.js';
import { createMarbleTexture } from '../utils/TextureGenerator.js';

/**
 * Factory class for creating marble entities
 */
export class MarbleFactory {
  /**
   * Create a new marble entity
   * @param {World} world - The world to add the entity to
   * @param {THREE.Vector3} position - Initial position
   * @returns {Entity} The created marble entity
   */
  static create(world, position) {
    // Create marble mesh
    const marbleGeometry = new THREE.SphereGeometry(OBJECTS.MARBLE_RADIUS, 32, 32);
    const marbleMaterial = new THREE.MeshPhysicalMaterial({
      color: COLORS.MARBLE,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7,
      transmission: 0.5,
      clearcoat: 0.5,
      map: createMarbleTexture()
    });
    
    const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);
    marbleMesh.castShadow = true;
    marbleMesh.receiveShadow = true;
    
    // Create entity and add components
    const marble = world.createEntity()
      .addComponent(new Transform(position))
      .addComponent(new Physics(1, PHYSICS.GRAVITY))
      .addComponent(new Render(marbleMesh))
      .addComponent(new Collider('sphere', { radius: OBJECTS.MARBLE_RADIUS }))
      .addComponent(new Jump(PHYSICS.JUMP_POWER))
      .addComponent(new PlayerControl(PHYSICS.MARBLE_SPEED))
      .addComponent(new Camera(new THREE.Vector3(0, 15, 25), CAMERA.ROTATION_SPEED))
      .addComponent(new MarbleTag());
    
    return marble;
  }
}