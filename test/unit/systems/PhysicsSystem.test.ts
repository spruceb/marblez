import { PhysicsSystem } from '../../../src/systems/PhysicsSystem';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import { Jump } from '../../../src/components/Jump';
import { PlayerControl } from '../../../src/components/PlayerControl';
import * as THREE from 'three';

describe('PhysicsSystem', () => {
  let world: World;
  let physicsSystem: PhysicsSystem;
  
  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem(world);
  });
  
  test('should require Transform and Physics components', () => {
    expect(physicsSystem.requiredComponents).toContain(Transform);
    expect(physicsSystem.requiredComponents).toContain(Physics);
  });
  
  test('should apply gravity to non-static entities', () => {
    // Create entity with physics
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(0, 10, 0));
    const physics = new Physics(1, 0.1); // Mass 1, gravity 0.1
    physics.isStatic = false;
    physics.isOnGround = false;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics for one frame
    physicsSystem.update(1.0); // 1 second
    
    // Expect gravity to have been applied
    expect(physics.velocity.y).toBe(-0.1);
    expect(transform.position.y).toBe(9.9);
  });
  
  test('should not apply gravity to static entities', () => {
    // Create static entity
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(0, 10, 0));
    const physics = new Physics(1, 0.1);
    physics.isStatic = true;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics for one frame
    physicsSystem.update(1.0);
    
    // Expect no movement for static entity
    expect(transform.position.y).toBe(10);
    expect(physics.velocity.y).toBe(0);
  });
  
  test('should apply friction on ground', () => {
    // Create entity on ground
    const entity = world.createEntity();
    const transform = new Transform();
    const physics = new Physics();
    physics.velocity.set(10, 0, 0);
    physics.isOnGround = true;
    physics.friction = 0.9;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics for one frame
    physicsSystem.update(1.0);
    
    // Expect friction to have slowed the entity
    expect(physics.velocity.x).toBe(9); // 10 * 0.9
  });
  
  test('should apply air friction when not on ground', () => {
    // Create entity in air
    const entity = world.createEntity();
    const transform = new Transform();
    const physics = new Physics();
    physics.velocity.set(10, 0, 0);
    physics.isOnGround = false;
    physics.friction = 0.9; // Ground friction
    physics.airFriction = 0.95; // Air friction
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics for one frame
    physicsSystem.update(1.0);
    
    // Expect air friction to have been applied
    expect(physics.velocity.x).toBe(9.5); // 10 * 0.95
  });
  
  test('should save previous position', () => {
    // Create entity
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(1, 2, 3));
    const physics = new Physics();
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics
    physicsSystem.update(1.0);
    
    // Previous position should be saved
    expect(transform.previousPosition).toEqual(new THREE.Vector3(1, 2, 3));
  });
  
  test('should apply velocity to position', () => {
    // Create entity with velocity
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(0, 0, 0));
    const physics = new Physics();
    physics.velocity.set(1, 2, 3);
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics
    physicsSystem.update(1.0);
    
    // Position should be updated by velocity
    expect(transform.position.x).toBe(1);
    expect(transform.position.y).toBeCloseTo(2, 1);
    expect(transform.position.z).toBe(3);
  });
  
  test('should process player movement', () => {
    // Create player entity
    const entity = world.createEntity();
    const transform = new Transform();
    const physics = new Physics();
    const playerControl = new PlayerControl(0.05);
    
    // Set move direction
    playerControl.moveDirection.x = 1;
    playerControl.moveDirection.z = 0;
    physics.isOnGround = true;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    entity.addComponent(playerControl);
    
    // Run physics
    physicsSystem.update(1.0);
    
    // Velocity should be affected by player movement
    expect(physics.velocity.x).toBeGreaterThan(0);
  });
  
  test('should process jumping', () => {
    // Create jumping entity
    const entity = world.createEntity();
    const transform = new Transform();
    const physics = new Physics();
    const jump = new Jump(0.5);
    
    // Setup for jump
    jump.jumpRequested = true;
    jump.isOnSurface = true;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    entity.addComponent(jump);
    
    // Run physics
    physicsSystem.update(1.0);
    
    // Jump should have been executed
    expect(physics.velocity.y).toBeCloseTo(0.5, 1); // Jump power
    expect(jump.isJumping).toBe(true);
  });
});