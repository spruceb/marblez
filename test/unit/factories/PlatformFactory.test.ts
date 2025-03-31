import { PlatformFactory } from '../../../src/factories/PlatformFactory';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import { Collider } from '../../../src/components/Collider';
import { Surface } from '../../../src/components/Surface';
import { Render } from '../../../src/components/Render';
import { PlatformTag } from '../../../src/components/Tags';
import { COLORS, OBJECTS } from '../../../src/utils/Constants';
import * as THREE from 'three';

describe('PlatformFactory', () => {
  let world: World;
  
  beforeEach(() => {
    world = new World();
  });
  
  test('should create a basic platform', () => {
    const position = new THREE.Vector3(5, 1, 10);
    const platform = PlatformFactory.createPlatform(world, position, 10, 1, 10);
    
    // Check components
    expect(platform.hasComponent(Transform)).toBe(true);
    expect(platform.hasComponent(Render)).toBe(true);
    expect(platform.hasComponent(Collider)).toBe(true);
    expect(platform.hasComponent(Surface)).toBe(true);
    expect(platform.hasComponent(Physics)).toBe(true);
    expect(platform.hasComponent(PlatformTag)).toBe(true);
    
    // Check transform position
    const transform = platform.getComponent(Transform)!;
    expect(transform.position).toEqual(position);
    
    // Check collider dimensions
    const collider = platform.getComponent(Collider)!;
    expect(collider.type).toBe('box');
    expect(collider.params.width).toBe(10);
    expect(collider.params.height).toBe(1);
    expect(collider.params.depth).toBe(10);
    
    // Check physics (should be static)
    const physics = platform.getComponent(Physics)!;
    expect(physics.isStatic).toBe(true);
    
    // Check render component has mesh
    const render = platform.getComponent(Render)!;
    expect(render.mesh).toBeDefined();
  });
  
  test('should create a ramp', () => {
    const position = new THREE.Vector3(0, 5, 0);
    const rotation = new THREE.Vector3(0.2, 0, 0);
    const ramp = PlatformFactory.createRamp(world, position, 8, 2, 20, rotation);
    
    // Check components
    expect(ramp.hasComponent(Transform)).toBe(true);
    expect(ramp.hasComponent(Render)).toBe(true);
    expect(ramp.hasComponent(Collider)).toBe(true);
    expect(ramp.hasComponent(Surface)).toBe(true);
    expect(ramp.hasComponent(Physics)).toBe(true);
    expect(ramp.hasComponent(PlatformTag)).toBe(true);
    
    // Check transform rotation
    const transform = ramp.getComponent(Transform)!;
    expect(transform.rotation).toEqual(rotation);
    
    // Check surface properties
    const surface = ramp.getComponent(Surface)!;
    expect(surface.isRamp).toBe(true);
    expect(surface.rampAngle).toBe(rotation.x);
    expect(surface.slideFactor).toBeGreaterThan(0);
    
    // Physics should be static
    const physics = ramp.getComponent(Physics)!;
    expect(physics.isStatic).toBe(true);
  });
  
  test('should create main platform', () => {
    const platform = PlatformFactory.createMainPlatform(world);
    
    // Check components
    expect(platform.hasComponent(Transform)).toBe(true);
    expect(platform.hasComponent(Render)).toBe(true);
    expect(platform.hasComponent(Collider)).toBe(true);
    expect(platform.hasComponent(Surface)).toBe(true);
    expect(platform.hasComponent(Physics)).toBe(true);
    expect(platform.hasComponent(PlatformTag)).toBe(true);
    
    // Check transform (should be at origin)
    const transform = platform.getComponent(Transform)!;
    expect(transform.position.x).toBe(0);
    expect(transform.position.y).toBe(0);
    expect(transform.position.z).toBe(0);
    
    // Check collider size
    const collider = platform.getComponent(Collider)!;
    expect(collider.type).toBe('box');
    expect(collider.params.width).toBe(OBJECTS.PLATFORM_SIZE * 2);
    expect(collider.params.depth).toBe(OBJECTS.PLATFORM_SIZE * 2);
    
    // Check render component has mesh with texture
    const render = platform.getComponent(Render)!;
    expect(render.mesh).toBeDefined();
    expect(render.mesh.material.map).toBeDefined();
  });
  
  test('should create a jump platform', () => {
    const position = new THREE.Vector3(10, 2, 10);
    const platform = PlatformFactory.createJumpPlatform(world, position, 5, 0.5);
    
    // Check components
    expect(platform.hasComponent(Transform)).toBe(true);
    expect(platform.hasComponent(Render)).toBe(true);
    expect(platform.hasComponent(Collider)).toBe(true);
    expect(platform.hasComponent(Surface)).toBe(true);
    expect(platform.hasComponent(Physics)).toBe(true);
    expect(platform.hasComponent(PlatformTag)).toBe(true);
    
    // Check transform position
    const transform = platform.getComponent(Transform)!;
    expect(transform.position).toEqual(position);
    
    // Check surface properties
    const surface = platform.getComponent(Surface)!;
    expect(surface.isJumpable).toBe(true);
    expect(surface.friction).toBeLessThan(0.5); // Low friction for sliding
    
    // Check render (should have jump platform color)
    const render = platform.getComponent(Render)!;
    expect(render.mesh.material.color).toBe(COLORS.JUMP_PLATFORM);
  });
  
  test('should create boundaries', () => {
    const boundaries = PlatformFactory.createBoundaries(world, 50);
    
    // Should create 4 walls
    expect(boundaries.length).toBe(4);
    
    // Check components of first boundary
    const firstBoundary = boundaries[0];
    expect(firstBoundary.hasComponent(Transform)).toBe(true);
    expect(firstBoundary.hasComponent(Render)).toBe(true);
    expect(firstBoundary.hasComponent(Collider)).toBe(true);
    expect(firstBoundary.hasComponent(Surface)).toBe(true);
    expect(firstBoundary.hasComponent(Physics)).toBe(true);
    expect(firstBoundary.hasComponent(PlatformTag)).toBe(true);
    
    // All boundaries should be static
    for (const boundary of boundaries) {
      const physics = boundary.getComponent(Physics)!;
      expect(physics.isStatic).toBe(true);
    }
    
    // Check positions (should form a square)
    const positions = boundaries.map(b => b.getComponent(Transform)!.position);
    
    // Should have boundaries at opposite sides
    const xPositions = positions.map(p => p.x).sort();
    const zPositions = positions.map(p => p.z).sort();
    
    // The boundaries should be symmetrical around the origin
    expect(xPositions[0]).toBe(-50);
    expect(xPositions[3]).toBe(50);
    expect(zPositions[0]).toBe(-50);
    expect(zPositions[3]).toBe(50);
  });
});