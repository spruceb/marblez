import { ObstacleFactory } from '../../../src/factories/ObstacleFactory';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import { Collider } from '../../../src/components/Collider';
import { Surface } from '../../../src/components/Surface';
import { Render } from '../../../src/components/Render';
import { ObstacleTag, RingTag, RampTag, WallTag } from '../../../src/components/Tags';
import { COLORS, OBJECTS } from '../../../src/utils/Constants';
import * as THREE from 'three';

describe('ObstacleFactory', () => {
  let world: World;
  
  beforeEach(() => {
    world = new World();
  });
  
  test('should create a box obstacle', () => {
    const position = new THREE.Vector3(5, 2, 10);
    const obstacle = ObstacleFactory.createBoxObstacle(world, position, 2, 2, 2);
    
    // Check components
    expect(obstacle.hasComponent(Transform)).toBe(true);
    expect(obstacle.hasComponent(Render)).toBe(true);
    expect(obstacle.hasComponent(Collider)).toBe(true);
    expect(obstacle.hasComponent(Surface)).toBe(true);
    expect(obstacle.hasComponent(Physics)).toBe(true);
    expect(obstacle.hasComponent(ObstacleTag)).toBe(true);
    
    // Check transform position
    const transform = obstacle.getComponent(Transform)!;
    expect(transform.position).toEqual(position);
    
    // Check collider dimensions
    const collider = obstacle.getComponent(Collider)!;
    expect(collider.type).toBe('box');
    expect(collider.params.width).toBe(2);
    expect(collider.params.height).toBe(2);
    expect(collider.params.depth).toBe(2);
    
    // Check physics (default is static)
    const physics = obstacle.getComponent(Physics)!;
    expect(physics.isStatic).toBe(true);
  });
  
  test('should create dynamic box obstacle', () => {
    const position = new THREE.Vector3(5, 5, 5);
    const obstacle = ObstacleFactory.createBoxObstacle(world, position, 1, 1, 1, COLORS.OBSTACLE, false);
    
    // Check physics (should be dynamic)
    const physics = obstacle.getComponent(Physics)!;
    expect(physics.isStatic).toBe(false);
    expect(physics.gravity).toBeGreaterThan(0);
  });
  
  test('should create a sphere obstacle', () => {
    const position = new THREE.Vector3(10, 3, 10);
    const radius = 1.5;
    const obstacle = ObstacleFactory.createSphereObstacle(world, position, radius);
    
    // Check components
    expect(obstacle.hasComponent(Transform)).toBe(true);
    expect(obstacle.hasComponent(Render)).toBe(true);
    expect(obstacle.hasComponent(Collider)).toBe(true);
    expect(obstacle.hasComponent(Surface)).toBe(true);
    expect(obstacle.hasComponent(Physics)).toBe(true);
    expect(obstacle.hasComponent(ObstacleTag)).toBe(true);
    
    // Check transform position
    const transform = obstacle.getComponent(Transform)!;
    expect(transform.position).toEqual(position);
    
    // Check collider 
    const collider = obstacle.getComponent(Collider)!;
    expect(collider.type).toBe('sphere');
    expect(collider.params.radius).toBe(radius);
  });
  
  test('should create a torus obstacle', () => {
    const position = new THREE.Vector3(0, 5, 0);
    const radius = 3;
    const tube = 0.5;
    const rotation = new THREE.Vector3(Math.PI / 2, 0, 0);
    
    const torus = ObstacleFactory.createTorusObstacle(world, position, radius, tube, rotation);
    
    // Check components
    expect(torus.hasComponent(Transform)).toBe(true);
    expect(torus.hasComponent(Render)).toBe(true);
    expect(torus.hasComponent(Collider)).toBe(true);
    expect(torus.hasComponent(Surface)).toBe(true);
    expect(torus.hasComponent(Physics)).toBe(true);
    expect(torus.hasComponent(ObstacleTag)).toBe(true);
    expect(torus.hasComponent(RingTag)).toBe(true);
    
    // Check transform rotation
    const transform = torus.getComponent(Transform)!;
    expect(transform.rotation).toEqual(rotation);
    
    // Check collider
    const collider = torus.getComponent(Collider)!;
    expect(collider.type).toBe('torus');
    expect(collider.params.radius).toBe(radius);
    expect(collider.params.tube).toBe(tube);
    
    // Should have inner and outer radius params for collision
    expect(collider.params.innerRadius).toBeDefined();
    expect(collider.params.outerRadius).toBeDefined();
  });
  
  test('should create a ring', () => {
    const position = new THREE.Vector3(0, 10, 0);
    const ring = ObstacleFactory.createRing(world, position);
    
    // Check components
    expect(ring.hasComponent(Transform)).toBe(true);
    expect(ring.hasComponent(Render)).toBe(true);
    expect(ring.hasComponent(Collider)).toBe(true);
    expect(ring.hasComponent(Surface)).toBe(true);
    expect(ring.hasComponent(Physics)).toBe(true);
    expect(ring.hasComponent(ObstacleTag)).toBe(true);
    expect(ring.hasComponent(RingTag)).toBe(true);
    
    // Check defaults
    const collider = ring.getComponent(Collider)!;
    expect(collider.params.radius).toBe(OBJECTS.RING_RADIUS);
    
    // Ring should be vertical (rotated around X axis)
    const transform = ring.getComponent(Transform)!;
    expect(transform.rotation.x).toBeCloseTo(Math.PI / 2);
  });
  
  test('should create a ramp', () => {
    const position = new THREE.Vector3(20, 0, 20);
    const ramp = ObstacleFactory.createRamp(world, position);
    
    // Check components
    expect(ramp.hasComponent(Transform)).toBe(true);
    expect(ramp.hasComponent(Render)).toBe(true);
    expect(ramp.hasComponent(Collider)).toBe(true);
    expect(ramp.hasComponent(Surface)).toBe(true);
    expect(ramp.hasComponent(Physics)).toBe(true);
    expect(ramp.hasComponent(ObstacleTag)).toBe(true);
    expect(ramp.hasComponent(RampTag)).toBe(true);
    
    // Check surface properties
    const surface = ramp.getComponent(Surface)!;
    expect(surface.isRamp).toBe(true);
    expect(surface.rampAngle).toBe(OBJECTS.RAMP_ANGLE);
    expect(surface.slideFactor).toBeGreaterThan(1); // Should have higher slide factor
    
    // Check transform rotation
    const transform = ramp.getComponent(Transform)!;
    expect(transform.rotation.x).toBeCloseTo(-OBJECTS.RAMP_ANGLE);
  });
  
  test('should create a wall', () => {
    const position = new THREE.Vector3(-10, 0, -10);
    const wall = ObstacleFactory.createWall(world, position);
    
    // Check components
    expect(wall.hasComponent(Transform)).toBe(true);
    expect(wall.hasComponent(Render)).toBe(true);
    expect(wall.hasComponent(Collider)).toBe(true);
    expect(wall.hasComponent(Surface)).toBe(true);
    expect(wall.hasComponent(Physics)).toBe(true);
    expect(wall.hasComponent(ObstacleTag)).toBe(true);
    expect(wall.hasComponent(WallTag)).toBe(true);
    
    // Check transform position
    const transform = wall.getComponent(Transform)!;
    expect(transform.position).toEqual(position);
    
    // Check physics is static
    const physics = wall.getComponent(Physics)!;
    expect(physics.isStatic).toBe(true);
  });
  
  test('should create zigzag walls', () => {
    const startPosition = new THREE.Vector3(0, 0, 0);
    const segmentCount = 3;
    
    const walls = ObstacleFactory.createZigzagWall(world, startPosition, segmentCount);
    
    // Should create the specified number of walls
    expect(walls.length).toBe(segmentCount);
    
    // Check components of first wall
    const firstWall = walls[0];
    expect(firstWall.hasComponent(Transform)).toBe(true);
    expect(firstWall.hasComponent(Render)).toBe(true);
    expect(firstWall.hasComponent(Collider)).toBe(true);
    expect(firstWall.hasComponent(Surface)).toBe(true);
    expect(firstWall.hasComponent(Physics)).toBe(true);
    expect(firstWall.hasComponent(ObstacleTag)).toBe(true);
    expect(firstWall.hasComponent(WallTag)).toBe(true);
    
    // Every other wall should be rotated 90 degrees (alternating pattern)
    const transform1 = walls[0].getComponent(Transform)!;
    const transform2 = walls[1].getComponent(Transform)!;
    
    // First wall should have rotation.y === 0
    expect(transform1.rotation.y).toBe(0);
    
    // Second wall should have rotation.y === PI/2
    expect(transform2.rotation.y).toBeCloseTo(Math.PI / 2);
  });
});