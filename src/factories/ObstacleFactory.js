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
} from '../components/index.js';
import { OBJECTS, COLORS } from '../utils/Constants.js';
import { createBrickTexture, createWoodTexture } from '../utils/TextureGenerator.js';

/**
 * Factory class for creating obstacle entities
 */
export class ObstacleFactory {
  /**
   * Create a ramp obstacle
   * @param {World} world - The world to add the entity to
   * @param {THREE.Vector3} position - Position of the ramp
   * @param {number} width - Width of the ramp
   * @param {number} height - Height of the ramp
   * @param {number} angle - Inclination angle in radians
   * @returns {Entity} The created ramp entity
   */
  static createRamp(world, position, width = OBJECTS.RAMP_SIZE, height = OBJECTS.RAMP_HEIGHT, angle = OBJECTS.RAMP_ANGLE) {
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
    ramp.getComponent(Physics).isStatic = true;
    
    // Configure surface for ramp behavior
    const surface = ramp.getComponent(Surface);
    surface.isRamp = true;
    surface.rampAngle = angle;
    surface.slideFactor = 2.0; // Higher slide factor to simulate gravity effect
    
    return ramp;
  }
  
  /**
   * Create a wall obstacle
   * @param {World} world - The world to add the entity to
   * @param {THREE.Vector3} position - Position of the wall
   * @param {number} width - Width of the wall
   * @param {number} height - Height of the wall
   * @param {number} depth - Depth/thickness of the wall
   * @returns {Entity} The created wall entity
   */
  static createWall(world, position, width = 10, height = OBJECTS.WALL_HEIGHT, depth = OBJECTS.WALL_THICKNESS) {
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
    wall.getComponent(Physics).isStatic = true;
    
    return wall;
  }
  
  /**
   * Create a ring obstacle to jump through
   * @param {World} world - The world to add the entity to
   * @param {THREE.Vector3} position - Position of the ring
   * @param {number} radius - Radius of the ring
   * @param {number} tubeRadius - Thickness of the ring tube
   * @returns {Entity} The created ring entity
   */
  static createRing(world, position, radius = OBJECTS.RING_RADIUS, tubeRadius = OBJECTS.RING_THICKNESS) {
    // Create ring mesh
    const ringGeometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 32);
    
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.RING,
      roughness: 0.2,
      metalness: 0.8,
      emissive: COLORS.RING,
      emissiveIntensity: 0.3
    });
    
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.castShadow = true;
    ringMesh.receiveShadow = true;
    
    // Create transform with rotation to make ring horizontal
    const transform = new Transform(position);
    transform.rotation.x = Math.PI / 2;
    
    // Create entity and add components
    const ring = world.createEntity()
      .addComponent(transform)
      .addComponent(new Render(ringMesh))
      .addComponent(new Collider('torus', { 
        radius: radius, 
        tube: tubeRadius,
        innerRadius: radius - tubeRadius - OBJECTS.MARBLE_RADIUS,
        outerRadius: radius + tubeRadius + OBJECTS.MARBLE_RADIUS
      }))
      .addComponent(new Surface(0.7))
      .addComponent(new Physics(0, 0))
      .addComponent(new ObstacleTag())
      .addComponent(new RingTag());
    
    // Mark physics as static
    ring.getComponent(Physics).isStatic = true;
    
    return ring;
  }
  
  /**
   * Create a zigzag wall obstacle
   * @param {World} world - The world to add the entity to
   * @param {THREE.Vector3} startPosition - Starting position of the zigzag
   * @param {number} segmentCount - Number of zigzag segments
   * @param {number} segmentLength - Length of each segment
   * @returns {Entity[]} Array of created wall entities
   */
  static createZigzagWall(world, startPosition, segmentCount = 5, segmentLength = 12) {
    const walls = [];
    const wallHeight = OBJECTS.WALL_HEIGHT;
    const wallThickness = OBJECTS.WALL_THICKNESS;
    const zigzagSpacing = 10;
    
    for (let i = 0; i < segmentCount; i++) {
      const xPos = startPosition.x + i * zigzagSpacing;
      const zPos = startPosition.z + 20 * Math.sin(i * Math.PI/2); // Zigzag pattern
      
      const position = new THREE.Vector3(xPos, wallHeight/2, zPos);
      const wall = this.createWall(world, position, wallThickness, wallHeight, segmentLength);
      
      // Rotate every other wall for zigzag pattern
      if (i % 2 === 1) {
        const transform = wall.getComponent(Transform);
        transform.rotation.y = Math.PI / 2;
      }
      
      walls.push(wall);
    }
    
    return walls;
  }
}