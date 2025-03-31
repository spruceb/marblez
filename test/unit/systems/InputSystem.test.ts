import { InputSystem } from '../../../src/systems/InputSystem';
import { World } from '../../../src/engine/ecs/World';
import { PlayerControl } from '../../../src/components/PlayerControl';
import { Jump } from '../../../src/components/Jump';
import { Camera } from '../../../src/components/Camera';
import { MockInputManager } from '../../__mocks__/InputManager';
import * as THREE from 'three';

describe('InputSystem', () => {
  let world: World;
  let inputManager: MockInputManager;
  let inputSystem: InputSystem;
  
  beforeEach(() => {
    world = new World();
    inputManager = new MockInputManager();
    inputSystem = new InputSystem(world, inputManager as any);
  });
  
  test('should require PlayerControl component', () => {
    expect(inputSystem.requiredComponents).toContain(PlayerControl);
  });
  
  test('should update player movement direction based on keyboard input', () => {
    // Create player entity with control
    const player = world.createEntity();
    const playerControl = new PlayerControl(0.05);
    player.addComponent(playerControl);
    
    // Simulate key down
    inputManager.simulateKeyDown('w');
    
    // Run input system
    inputSystem.update(1.0);
    
    // Forward movement should be applied
    expect(playerControl.moveDirection.z).toBe(-1);
    expect(playerControl.moveDirection.x).toBe(0);
    
    // Test another direction
    inputManager.simulateKeyUp('w');
    inputManager.simulateKeyDown('a');
    
    // Update again
    inputSystem.update(1.0);
    
    // Left movement should be applied
    expect(playerControl.moveDirection.x).toBe(-1);
    expect(playerControl.moveDirection.z).toBe(0);
  });
  
  test('should handle diagonal movement', () => {
    // Create player entity
    const player = world.createEntity();
    const playerControl = new PlayerControl(0.05);
    player.addComponent(playerControl);
    
    // Simulate diagonal movement (forward-right)
    inputManager.simulateKeyDown('w');
    inputManager.simulateKeyDown('d');
    
    // Run input system
    inputSystem.update(1.0);
    
    // Direction should be normalized
    const expectedLength = Math.sqrt(playerControl.moveDirection.x ** 2 + playerControl.moveDirection.z ** 2);
    expect(expectedLength).toBeCloseTo(1.0);
    expect(playerControl.moveDirection.x).toBeCloseTo(1 / Math.sqrt(2));
    expect(playerControl.moveDirection.z).toBeCloseTo(-1 / Math.sqrt(2));
  });
  
  test('should process jump requests', () => {
    // Create player with jump component
    const player = world.createEntity();
    const playerControl = new PlayerControl();
    const jump = new Jump();
    
    // Set jump parameters
    jump.isOnSurface = true;
    jump.canJump = true;
    jump.jumpCooldown = 0;
    
    // Mock the requestJump method
    jump.requestJump = jest.fn();
    
    player.addComponent(playerControl);
    player.addComponent(jump);
    
    // Simulate space key for jump
    inputManager.simulateKeyDown(' ');
    
    // Run input system
    inputSystem.update(1.0);
    
    // Check if requestJump was called
    expect(jump.requestJump).toHaveBeenCalled();
  });
  
  test('should handle camera movement with the correct angle', () => {
    // Create player with camera
    const player = world.createEntity();
    const playerControl = new PlayerControl();
    const camera = new Camera();
    camera.angle = Math.PI / 4; // 45 degrees
    
    player.addComponent(playerControl);
    player.addComponent(camera);
    
    // Simulate forward movement
    inputManager.simulateKeyDown('w');
    
    // Run input system
    inputSystem.update(1.0);
    
    // Direction should be rotated by camera angle
    // Note: The rotation formula is actually:
    // x' = cos(θ) * x + sin(θ) * z
    // z' = cos(θ) * z - sin(θ) * x
    // For initial (0,-1) vector, this gives different results than simple sin/cos
    const sin = Math.sin(Math.PI / 4);
    const cos = Math.cos(Math.PI / 4);
    const originalX = 0; // No horizontal movement
    const originalZ = -1; // Forward movement
    const expectedX = cos * originalX + sin * originalZ;
    const expectedZ = cos * originalZ - sin * originalX;
    
    expect(playerControl.moveDirection.x).toBeCloseTo(expectedX);
    expect(playerControl.moveDirection.z).toBeCloseTo(expectedZ);
  });
  
  test('should clear input events after update', () => {
    // Press and release keys
    inputManager.simulateKeyDown('w');
    inputManager.simulateKeyUp('a');
    
    // Verify keys are in pressed/released sets
    expect(inputManager.keysPressedThisFrame.size).toBe(1);
    expect(inputManager.keysReleasedThisFrame.size).toBe(1);
    
    // Run update
    inputSystem.update(1.0);
    
    // Key states should be preserved but events cleared
    expect(inputManager.keys['w']).toBe(true);
    expect(inputManager.keys['a']).toBe(false);
    expect(inputManager.keysPressedThisFrame.size).toBe(0);
    expect(inputManager.keysReleasedThisFrame.size).toBe(0);
  });
});