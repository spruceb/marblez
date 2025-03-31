import { JumpSystem } from '../../../src/systems/JumpSystem';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import { Jump } from '../../../src/components/Jump';
import * as THREE from 'three';

describe('JumpSystem', () => {
  let world: World;
  let jumpSystem: JumpSystem;
  
  beforeEach(() => {
    world = new World();
    jumpSystem = new JumpSystem(world);
  });
  
  test('should require Transform, Physics, and Jump components', () => {
    expect(jumpSystem.requiredComponents).toContain(Transform);
    expect(jumpSystem.requiredComponents).toContain(Physics);
    expect(jumpSystem.requiredComponents).toContain(Jump);
  });
  
  test('should update jump states when landing', () => {
    // Create entity with jumping state
    const entity = world.createEntity();
    const physics = new Physics();
    const jump = new Jump();
    
    jump.isJumping = true;
    jump.isFalling = false;
    jump.isOnSurface = true; // Landing
    physics.velocity.y = -0.1;
    
    entity
      .addComponent(new Transform())
      .addComponent(physics)
      .addComponent(jump);
    
    // Update system
    jumpSystem.update(0.016);
    
    // Jump state should be reset
    expect(jump.isJumping).toBe(false);
    expect(jump.isFalling).toBe(false);
    expect(physics.velocity.y).toBe(0);
  });
  
  test('should transition from jumping to falling', () => {
    // Create entity in jumping state
    const entity = world.createEntity();
    const physics = new Physics();
    const jump = new Jump();
    
    jump.isJumping = true;
    jump.isFalling = false;
    jump.isOnSurface = false;
    physics.velocity.y = -0.1; // Moving downward
    
    entity
      .addComponent(new Transform())
      .addComponent(physics)
      .addComponent(jump);
    
    // Update system
    jumpSystem.update(0.016);
    
    // Should now be falling
    expect(jump.isJumping).toBe(false);
    expect(jump.isFalling).toBe(true);
  });
  
  test('should detect falling when leaving surface', () => {
    // Create entity on surface
    const entity = world.createEntity();
    const jump = new Jump();
    
    jump.isOnSurface = false; // Not on surface
    jump.isJumping = false;
    jump.isFalling = false;
    
    entity
      .addComponent(new Transform())
      .addComponent(new Physics())
      .addComponent(jump);
    
    // Update system
    jumpSystem.update(0.016);
    
    // Should be falling
    expect(jump.isFalling).toBe(true);
  });
  
  test('should not change state for entity on surface', () => {
    // Create entity on surface
    const entity = world.createEntity();
    const jump = new Jump();
    
    jump.isOnSurface = true;
    jump.isJumping = false;
    jump.isFalling = false;
    
    entity
      .addComponent(new Transform())
      .addComponent(new Physics())
      .addComponent(jump);
    
    // Update system
    jumpSystem.update(0.016);
    
    // States should not change
    expect(jump.isJumping).toBe(false);
    expect(jump.isFalling).toBe(false);
  });
});