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
} from '../components';
import { OBJECTS, PHYSICS, CAMERA, COLORS } from '../utils/Constants';
import { createMarbleTexture } from '../utils/TextureGenerator';
import { IMarbleFactory } from '../types/factories';
import { IEntity, IWorld } from '../types/ecs';

/**
 * Factory class for creating marble entities
 */
export class MarbleFactory {
  /**
   * Create a new marble entity
   * @param world The world to add the entity to
   * @param position Initial position
   * @param radius The radius of the marble
   * @param color The color of the marble
   * @returns The created marble entity
   */
  static create(
    world: IWorld, 
    position: THREE.Vector3 = new THREE.Vector3(0, OBJECTS.MARBLE_RADIUS, 0),
    radius: number = OBJECTS.MARBLE_RADIUS,
    color: number = COLORS.MARBLE
  ): IEntity {
    // Create marble mesh
    const marbleGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const marbleMaterial = new THREE.MeshPhysicalMaterial({
      color: color,
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
      .addComponent(new Collider('sphere', { radius: radius }))
      .addComponent(new Jump(PHYSICS.JUMP_POWER))
      .addComponent(new PlayerControl(PHYSICS.MARBLE_SPEED))
      .addComponent(new Camera(new THREE.Vector3(0, 15, 25), CAMERA.ROTATION_SPEED))
      .addComponent(new MarbleTag());
    
    return marble;
  }
}