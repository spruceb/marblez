import * as THREE from 'three';
import { 
  Transform, 
  Physics, 
  Render, 
  Collider, 
  Surface, 
  PlatformTag 
} from '../components/index.js';
import { OBJECTS, COLORS } from '../utils/Constants.js';
import { createGrassTexture } from '../utils/TextureGenerator.js';

/**
 * Factory class for creating platform entities
 */
export class PlatformFactory {
  /**
   * Create a main platform
   * @param {World} world - The world to add the entity to
   * @param {number} size - Size of the platform
   * @returns {Entity} The created platform entity
   */
  static createMainPlatform(world, size = OBJECTS.PLATFORM_SIZE) {
    // Instead of using PlaneGeometry, let's use BoxGeometry for the floor
    // This ensures proper rendering and collision
    const floorGeometry = new THREE.BoxGeometry(size * 2, 0.1, size * 2);
    const grassTexture = createGrassTexture();
    
    // Fix texture repetition settings
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(8, 8);
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    // No need to rotate since we're using a box now
    floorMesh.position.y = -0.05; // Slightly below 0 to ensure marble sits on top
    floorMesh.receiveShadow = true;
    
    // Create entity and add components
    const platform = world.createEntity()
      .addComponent(new Transform(new THREE.Vector3(0, 0, 0)))
      .addComponent(new Render(floorMesh))
      .addComponent(new Collider('box', { 
        width: size * 2, 
        height: 0.1, 
        depth: size * 2 
      }))
      .addComponent(new Surface())
      .addComponent(new Physics(0, 0)) // Zero gravity, infinite mass
      .addComponent(new PlatformTag());
    
    // Mark physics as static
    platform.getComponent(Physics).isStatic = true;
    
    return platform;
  }
  
  /**
   * Create a jumping platform
   * @param {World} world - The world to add the entity to
   * @param {THREE.Vector3} position - Position of the platform
   * @param {number} size - Size of the platform
   * @param {number} height - Height of the platform (thickness)
   * @returns {Entity} The created platform entity
   */
  static createJumpPlatform(world, position, size = 5, height = 0.5) {
    // Create platform mesh
    const geometry = new THREE.BoxGeometry(size, height, size);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.JUMP_PLATFORM,
      roughness: 0.5,
      metalness: 0.5,
      emissive: COLORS.JUMP_PLATFORM,
      emissiveIntensity: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Create entity and add components
    const platform = world.createEntity()
      .addComponent(new Transform(position))
      .addComponent(new Render(mesh))
      .addComponent(new Collider('box', { 
        width: size, 
        height: height, 
        depth: size 
      }))
      .addComponent(new Surface(0.05)) // Lower friction
      .addComponent(new Physics(0, 0)) // Zero gravity, infinite mass
      .addComponent(new PlatformTag());
    
    // Mark physics as static
    platform.getComponent(Physics).isStatic = true;
    // Mark surface as jumpable
    platform.getComponent(Surface).isJumpable = true;
    
    return platform;
  }
  
  /**
   * Create boundary borders around the main platform
   * @param {World} world - The world to add the entities to
   * @param {number} size - Size of the main platform
   * @returns {Entity[]} Array of created boundary entities
   */
  static createBoundaries(world, size = OBJECTS.PLATFORM_SIZE) {
    const boundaries = [];
    const boundaryHeight = 1;
    const boundaryWidth = 1;
    
    // Material for boundaries
    const boundaryMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.BOUNDARY,
      roughness: 0.5,
      metalness: 0.3,
      emissive: COLORS.BOUNDARY,
      emissiveIntensity: 0.2
    });
    
    // Create four boundaries (top, bottom, left, right)
    const positions = [
      { x: 0, y: boundaryHeight / 2, z: -size, rotation: 0 }, // Top
      { x: 0, y: boundaryHeight / 2, z: size, rotation: 0 },  // Bottom
      { x: -size, y: boundaryHeight / 2, z: 0, rotation: Math.PI / 2 }, // Left
      { x: size, y: boundaryHeight / 2, z: 0, rotation: Math.PI / 2 }   // Right
    ];
    
    for (const pos of positions) {
      const boundaryGeometry = new THREE.BoxGeometry(size * 2, boundaryHeight, boundaryWidth);
      const boundaryMesh = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
      boundaryMesh.castShadow = true;
      boundaryMesh.receiveShadow = true;
      
      const transform = new Transform(
        new THREE.Vector3(pos.x, pos.y, pos.z)
      );
      transform.rotation.y = pos.rotation;
      
      const boundary = world.createEntity()
        .addComponent(transform)
        .addComponent(new Render(boundaryMesh))
        .addComponent(new Collider('box', { 
          width: size * 2, 
          height: boundaryHeight, 
          depth: boundaryWidth 
        }))
        .addComponent(new Surface(0.9)) // High friction
        .addComponent(new Physics(0, 0))
        .addComponent(new PlatformTag());
      
      // Mark physics as static
      boundary.getComponent(Physics).isStatic = true;
      
      boundaries.push(boundary);
    }
    
    return boundaries;
  }
}