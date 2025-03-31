import * as THREE from 'three';
import { 
  Transform, 
  Physics, 
  Render, 
  Collider, 
  Surface, 
  ObstacleTag,
  RampTag,
  RingTag,
  WallTag
} from '../components';
import { OBJECTS, COLORS } from '../utils/Constants';
import { createBrickTexture, createWoodTexture } from '../utils/TextureGenerator';
import { IObstacleFactory } from '../types/factories';
import { IEntity, IWorld } from '../types/ecs';
import { IPhysics, ISurface, ITransform } from '../types/components';

/**
 * Factory class for creating obstacle entities
 */
export class ObstacleFactory {
  /**
   * Create a box obstacle entity
   * @param world The world to create the entity in
   * @param position The position of the obstacle
   * @param width The width of the obstacle
   * @param height The height of the obstacle
   * @param depth The depth of the obstacle
   * @param color The color of the obstacle
   * @param isStatic Whether the obstacle is static or dynamic
   * @returns The created obstacle entity
   */
  static createBoxObstacle(
    world: IWorld,
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    color: number = COLORS.OBSTACLE,
    isStatic: boolean = true
  ): IEntity {
    // Create box mesh
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Create entity and add components
    const obstacle = world.createEntity()
      .addComponent(new Transform(position))
      .addComponent(new Render(mesh))
      .addComponent(new Collider('box', { 
        width: width, 
        height: height, 
        depth: depth 
      }))
      .addComponent(new Surface(0.8)) // Medium friction
      .addComponent(new Physics(isStatic ? 0 : 1, isStatic ? 0 : OBJECTS.GRAVITY))
      .addComponent(new ObstacleTag());
    
    // Mark physics as static if needed
    const physics = obstacle.getComponent(Physics) as IPhysics;
    physics.isStatic = isStatic;
    
    return obstacle;
  }
  
  /**
   * Create a sphere obstacle entity
   * @param world The world to create the entity in
   * @param position The position of the obstacle
   * @param radius The radius of the obstacle
   * @param color The color of the obstacle
   * @param isStatic Whether the obstacle is static or dynamic
   * @returns The created obstacle entity
   */
  static createSphereObstacle(
    world: IWorld,
    position: THREE.Vector3,
    radius: number,
    color: number = COLORS.OBSTACLE,
    isStatic: boolean = true
  ): IEntity {
    // Create sphere mesh
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Create entity and add components
    const obstacle = world.createEntity()
      .addComponent(new Transform(position))
      .addComponent(new Render(mesh))
      .addComponent(new Collider('sphere', { radius: radius }))
      .addComponent(new Surface(0.8)) // Medium friction
      .addComponent(new Physics(isStatic ? 0 : 1, isStatic ? 0 : OBJECTS.GRAVITY))
      .addComponent(new ObstacleTag());
    
    // Mark physics as static if needed
    const physics = obstacle.getComponent(Physics) as IPhysics;
    physics.isStatic = isStatic;
    
    return obstacle;
  }
  
  /**
   * Create a torus obstacle entity
   * @param world The world to create the entity in
   * @param position The position of the obstacle
   * @param radius The radius of the torus
   * @param tube The tube radius of the torus
   * @param rotation The rotation of the torus
   * @param color The color of the obstacle
   * @returns The created obstacle entity
   */
  static createTorusObstacle(
    world: IWorld,
    position: THREE.Vector3,
    radius: number,
    tube: number,
    rotation: THREE.Vector3 = new THREE.Vector3(Math.PI / 2, 0, 0),
    color: number = COLORS.RING
  ): IEntity {
    // Create ring mesh
    const ringGeometry = new THREE.TorusGeometry(radius, tube, 16, 32);
    
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.3
    });
    
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.castShadow = true;
    ringMesh.receiveShadow = true;
    
    // Create transform with rotation
    const transform = new Transform(position);
    transform.rotation.copy(rotation);
    
    // Create entity and add components
    const ring = world.createEntity()
      .addComponent(transform)
      .addComponent(new Render(ringMesh))
      .addComponent(new Collider('torus', { 
        radius: radius, 
        tube: tube,
        innerRadius: radius - tube,
        outerRadius: radius + tube
      }))
      .addComponent(new Surface(0.7))
      .addComponent(new Physics(0, 0))
      .addComponent(new ObstacleTag())
      .addComponent(new RingTag());
    
    // Mark physics as static
    const physics = ring.getComponent(Physics) as IPhysics;
    physics.isStatic = true;
    
    return ring;
  }
  
  /**
   * Create a ramp obstacle
   * @param position Position of the ramp
   * @param width Width of the ramp
   * @param height Height of the ramp
   * @param angle Inclination angle in radians
   * @returns The created ramp entity
   */
  static createRamp(
    world: IWorld,
    position: THREE.Vector3,
    width: number = OBJECTS.RAMP_SIZE, 
    height: number = OBJECTS.RAMP_HEIGHT, 
    angle: number = OBJECTS.RAMP_ANGLE
  ): IEntity {
    // Calculate length based on height and angle
    const length = height / Math.sin(angle) * 2;
    
    // Create ramp mesh
    const rampGeometry = new THREE.BoxGeometry(width, height, length);
    const brickTexture = createBrickTexture();
    
    const rampMaterial = new THREE.MeshStandardMaterial({
      map: brickTexture,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
    rampMesh.castShadow = true;
    rampMesh.receiveShadow = true;
    
    // Create transform with rotation
    const transform = new Transform(position);
    transform.rotation.x = -angle; // Rotate to create the incline
    
    // Create entity and add components
    const ramp = world.createEntity()
      .addComponent(transform)
      .addComponent(new Render(rampMesh))
      .addComponent(new Collider('box', { 
        width: width, 
        height: height, 
        depth: length 
      }))
      .addComponent(new Surface(0.99)) // Low friction for sliding
      .addComponent(new Physics(0, 0))
      .addComponent(new ObstacleTag())
      .addComponent(new RampTag());
    
    // Mark physics as static
    const physics = ramp.getComponent(Physics) as IPhysics;
    physics.isStatic = true;
    
    // Configure surface for ramp behavior
    const surface = ramp.getComponent(Surface) as ISurface;
    surface.isRamp = true;
    surface.rampAngle = angle;
    surface.slideFactor = 2.0; // Higher slide factor to simulate gravity effect
    
    return ramp;
  }
  
  /**
   * Create a wall obstacle
   * @param world The world to add the entity to
   * @param position Position of the wall
   * @param width Width of the wall
   * @param height Height of the wall
   * @param depth Depth/thickness of the wall
   * @returns The created wall entity
   */
  static createWall(
    world: IWorld,
    position: THREE.Vector3,
    width: number = 10, 
    height: number = OBJECTS.WALL_HEIGHT, 
    depth: number = OBJECTS.WALL_THICKNESS
  ): IEntity {
    // Create wall mesh
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const woodTexture = createWoodTexture();
    
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    
    // Create entity and add components
    const wall = world.createEntity()
      .addComponent(new Transform(position))
      .addComponent(new Render(wallMesh))
      .addComponent(new Collider('box', { 
        width: width, 
        height: height, 
        depth: depth 
      }))
      .addComponent(new Surface(0.8)) // Medium friction
      .addComponent(new Physics(0, 0))
      .addComponent(new ObstacleTag())
      .addComponent(new WallTag());
    
    // Mark physics as static
    const physics = wall.getComponent(Physics) as IPhysics;
    physics.isStatic = true;
    
    return wall;
  }
  
  /**
   * Create a ring obstacle to jump through
   * @param world The world to add the entity to
   * @param position Position of the ring
   * @param radius Radius of the ring
   * @param tubeRadius Thickness of the ring tube
   * @returns The created ring entity
   * 
   * NOTE: This function is currently unused due to collision detection issues.
   * The ring obstacle creates an invisible wall that blocks player movement.
   * A complete rewrite of the torus collision detection would be needed to fix this.
   */
  static createRing(
    world: IWorld,
    position: THREE.Vector3,
    radius: number = OBJECTS.RING_RADIUS, 
    tubeRadius: number = OBJECTS.RING_THICKNESS
  ): IEntity {
    return ObstacleFactory.createTorusObstacle(
      world,
      position,
      radius,
      tubeRadius,
      new THREE.Vector3(Math.PI / 2, 0, 0),
      COLORS.RING
    );
  }
  
  /**
   * Create a zigzag wall obstacle
   * @param world The world to add the entity to
   * @param startPosition Starting position of the zigzag
   * @param segmentCount Number of zigzag segments
   * @param segmentLength Length of each segment
   * @returns Array of created wall entities
   */
  static createZigzagWall(
    world: IWorld,
    startPosition: THREE.Vector3,
    segmentCount: number = 5, 
    segmentLength: number = 12
  ): IEntity[] {
    const walls: IEntity[] = [];
    const wallHeight = OBJECTS.WALL_HEIGHT;
    const wallThickness = OBJECTS.WALL_THICKNESS;
    const zigzagSpacing = 10;
    
    for (let i = 0; i < segmentCount; i++) {
      const xPos = startPosition.x + i * zigzagSpacing;
      const zPos = startPosition.z + 20 * Math.sin(i * Math.PI/2); // Zigzag pattern
      
      const position = new THREE.Vector3(xPos, wallHeight/2, zPos);
      const wall = ObstacleFactory.createWall(world, position, wallThickness, wallHeight, segmentLength);
      
      // Rotate every other wall for zigzag pattern
      if (i % 2 === 1) {
        const transform = wall.getComponent(Transform) as ITransform;
        transform.rotation.y = Math.PI / 2;
      }
      
      walls.push(wall);
    }
    
    return walls;
  }
}