import * as THREE from 'three';
import { 
  Transform, 
  Physics, 
  Render, 
  Collider, 
  Surface, 
  PlatformTag 
} from '../components';
import { OBJECTS, COLORS } from '../utils/Constants';
import { createGrassTexture } from '../utils/TextureGenerator';
import { IPlatformFactory } from '../types/factories';
import { IEntity, IWorld } from '../types/ecs';
import { IPhysics, ISurface } from '../types/components';

/**
 * Factory class for creating platform entities
 */
export class PlatformFactory {
  /**
   * Create a platform entity
   * @param world The world to create the entity in
   * @param position The position of the platform
   * @param width The width of the platform
   * @param height The height of the platform
   * @param depth The depth of the platform
   * @param color The color of the platform
   * @returns The created platform entity
   */
  static createPlatform(
    world: IWorld,
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    color: number = COLORS.JUMP_PLATFORM
  ): IEntity {
    // Create platform mesh
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.5,
      emissive: new THREE.Color(color),
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
        width: width, 
        height: height, 
        depth: depth 
      }))
      .addComponent(new Surface(0.7)) // Default friction
      .addComponent(new Physics(0, 0)) // Zero gravity, infinite mass
      .addComponent(new PlatformTag());
    
    // Mark physics as static
    const physics = platform.getComponent(Physics) as IPhysics;
    physics.isStatic = true;
    
    return platform;
  }
  
  /**
   * Create a ramp entity
   * @param world The world to create the entity in
   * @param position The position of the ramp
   * @param width The width of the ramp
   * @param height The height of the ramp
   * @param depth The depth of the ramp
   * @param rotation The rotation of the ramp
   * @param color The color of the ramp
   * @param slideFactor The slide factor of the ramp (how slippery it is)
   * @returns The created ramp entity
   */
  static createRamp(
    world: IWorld,
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    rotation: THREE.Vector3,
    color: number = COLORS.RAMP,
    slideFactor: number = 1.0
  ): IEntity {
    // Create ramp mesh
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Create transform with rotation
    const transform = new Transform(position);
    transform.rotation.copy(rotation);
    
    // Calculate ramp angle for physics (assuming rotation on X axis for a basic ramp)
    const rampAngle = rotation.x;
    
    // Create entity and add components
    const ramp = world.createEntity()
      .addComponent(transform)
      .addComponent(new Render(mesh))
      .addComponent(new Collider('box', { 
        width: width, 
        height: height, 
        depth: depth 
      }))
      .addComponent(new Surface(0.5, 1.0, true, rampAngle, slideFactor)) // Lower friction, ramp properties
      .addComponent(new Physics(0, 0)) // Zero gravity, infinite mass
      .addComponent(new PlatformTag());
    
    // Mark physics as static
    const physics = ramp.getComponent(Physics) as IPhysics;
    physics.isStatic = true;
    
    return ramp;
  }
  
  /**
   * Create a main platform
   * @param world The world to add the entity to
   * @param size Size of the platform
   * @returns The created platform entity
   */
  static createMainPlatform(world: IWorld, size: number = OBJECTS.PLATFORM_SIZE): IEntity {
    // Instead of using PlaneGeometry, use BoxGeometry for the floor
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
    const physics = platform.getComponent(Physics) as IPhysics;
    physics.isStatic = true;
    
    return platform;
  }
  
  /**
   * Create a jumping platform
   * @param world The world to add the entity to
   * @param position Position of the platform
   * @param size Size of the platform
   * @param height Height of the platform (thickness)
   * @returns The created platform entity
   */
  static createJumpPlatform(
    world: IWorld, 
    position: THREE.Vector3,
    size: number = 5, 
    height: number = 0.5
  ): IEntity {
    // Create platform mesh
    const geometry = new THREE.BoxGeometry(size, height, size);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.JUMP_PLATFORM,
      roughness: 0.5,
      metalness: 0.5,
      emissive: new THREE.Color(COLORS.JUMP_PLATFORM),
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
    const physics = platform.getComponent(Physics) as IPhysics;
    physics.isStatic = true;
    
    // Mark surface as jumpable
    const surface = platform.getComponent(Surface) as ISurface;
    surface.isJumpable = true;
    
    return platform;
  }
  
  /**
   * Create boundary borders around the main platform
   * @param world The world to add the entities to
   * @param size Size of the main platform
   * @returns Array of created boundary entities
   */
  static createBoundaries(world: IWorld, size: number = OBJECTS.PLATFORM_SIZE): IEntity[] {
    const boundaries: IEntity[] = [];
    const boundaryHeight = 1;
    const boundaryWidth = 1;
    
    // Material for boundaries
    const boundaryMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.BOUNDARY,
      roughness: 0.5,
      metalness: 0.3,
      emissive: new THREE.Color(COLORS.BOUNDARY),
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
      const physics = boundary.getComponent(Physics) as IPhysics;
      physics.isStatic = true;
      
      boundaries.push(boundary);
    }
    
    return boundaries;
  }
}