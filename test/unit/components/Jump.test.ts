import { Jump } from '../../../src/components/Jump';
import { Component } from '../../../src/engine/ecs/Component';
import { PHYSICS } from '../../../src/utils/Constants';

describe('Jump Component', () => {
  test('should extend Component', () => {
    const jump = new Jump();
    expect(jump).toBeInstanceOf(Component);
    expect(jump).toBeInstanceOf(Jump);
  });
  
  test('should initialize with default values', () => {
    const jump = new Jump();
    
    expect(jump.jumpPower).toBe(PHYSICS.JUMP_POWER);
    expect(jump.isOnSurface).toBe(true);
    expect(jump.isJumping).toBe(false);
    expect(jump.isFalling).toBe(false);
    expect(jump.jumpRequested).toBe(false);
    expect(jump.jumpCooldown).toBe(0);
    expect(jump.jumpCooldownTime).toBe(0.2);
  });
  
  test('should initialize with custom jump power', () => {
    const jump = new Jump(0.8);
    expect(jump.jumpPower).toBe(0.8);
  });
  
  test('should request jump', () => {
    const jump = new Jump();
    
    // Initial state
    expect(jump.jumpRequested).toBe(false);
    
    // Request jump
    jump.requestJump();
    
    expect(jump.jumpRequested).toBe(true);
  });
  
  test('should not execute jump if not requested', () => {
    const jump = new Jump();
    
    // Jump not requested
    const executed = jump.executeJumpIfRequested();
    
    expect(executed).toBe(false);
    expect(jump.isJumping).toBe(false);
  });
  
  test('should not execute jump if not on surface', () => {
    const jump = new Jump();
    
    // Request jump
    jump.requestJump();
    
    // Set not on surface
    jump.isOnSurface = false;
    
    // Try to execute
    const executed = jump.executeJumpIfRequested();
    
    expect(executed).toBe(false);
    expect(jump.isJumping).toBe(false);
    expect(jump.jumpRequested).toBe(true); // Request should persist
  });
  
  test('should not execute jump during cooldown', () => {
    const jump = new Jump();
    
    // Request jump
    jump.requestJump();
    
    // Set cooldown
    jump.jumpCooldown = 0.05;
    
    // Try to execute
    const executed = jump.executeJumpIfRequested();
    
    expect(executed).toBe(false);
    expect(jump.isJumping).toBe(false);
    expect(jump.jumpRequested).toBe(true); // Request should persist
  });
  
  test('should execute jump when conditions are met', () => {
    const jump = new Jump();
    
    // Request jump
    jump.requestJump();
    
    // All conditions are met by default
    const executed = jump.executeJumpIfRequested();
    
    expect(executed).toBe(true);
    expect(jump.isJumping).toBe(true);
    expect(jump.jumpRequested).toBe(false); // Request should be cleared
    expect(jump.jumpCooldown).toBe(jump.jumpCooldownTime); // Cooldown should be set
  });
  
  test('should update cooldown', () => {
    const jump = new Jump();
    
    // Set cooldown
    jump.jumpCooldown = 0.1;
    
    // Update with deltaTime
    jump.updateCooldown(0.05);
    
    expect(jump.jumpCooldown).toBe(0.05);
    
    // Update again
    jump.updateCooldown(0.03);
    
    expect(jump.jumpCooldown).toBeCloseTo(0.02, 5);
    
    // Update past zero
    jump.updateCooldown(0.05);
    
    expect(jump.jumpCooldown).toBe(0);
  });
});