import { World } from '../../../src/engine/ecs/World';
import { PhysicsSystem } from '../../../src/systems/PhysicsSystem';
import { CollisionSystem } from '../../../src/systems/CollisionSystem';
import { MarbleFactory } from '../../../src/factories/MarbleFactory';
import { PlatformFactory } from '../../../src/factories/PlatformFactory';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import { Jump } from '../../../src/components/Jump';
import { PlayerControl } from '../../../src/components/PlayerControl';
import * as THREE from 'three';
import { OBJECTS } from '../../../src/utils/Constants';

describe('Falling and Bouncing Simulation', () => {
  let world: World;
  let physicsSystem: PhysicsSystem;
  let collisionSystem: CollisionSystem;
  
  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem(world);
    collisionSystem = new CollisionSystem(world);
    
    world.addSystem(physicsSystem);
    world.addSystem(collisionSystem);
  });
  
  test('marble should fall and bounce with realistic physics', () => {
    // Create platform
    PlatformFactory.createMainPlatform(world);
    
    // Create marble at height
    const startHeight = 10;
    const marble = MarbleFactory.create(world, new THREE.Vector3(0, startHeight, 0));
    
    // Get components
    const marblePhysics = marble.getComponent(Physics)!;
    const marbleTransform = marble.getComponent(Transform)!;
    
    // Set bounce coefficient
    marblePhysics.bounceCoefficient = 0.5;
    
    // Initial state
    expect(marbleTransform.position.y).toBe(startHeight);
    expect(marblePhysics.velocity.y).toBe(0);
    
    // Run simulation for several frames to fall to ground
    const frameDelta = 0.016; // 60fps
    const frameCount = 100;
    
    // Track positions and velocities
    const positions: number[] = [];
    const velocities: number[] = [];
    
    // Run simulation
    for (let i = 0; i < frameCount; i++) {
      physicsSystem.update(frameDelta);
      collisionSystem.update(frameDelta);
      
      positions.push(marbleTransform.position.y);
      velocities.push(marblePhysics.velocity.y);
    }
    
    // Verification is done below - no assertions here
    
    // After simulation:
    
    // 1. Marble should be at rest near the ground
    expect(marbleTransform.position.y).toBeCloseTo(OBJECTS.MARBLE_RADIUS, 1);
    
    // 2. Velocity should be near zero
    expect(Math.abs(marblePhysics.velocity.y)).toBeLessThan(0.1);
    
    // 3. Should observe acceleration during fall
    const midIndex = Math.floor(frameCount / 4);
    
    // Velocities should be increasingly negative during fall
    expect(velocities[0]).toBeGreaterThan(velocities[midIndex]);
    
    // 4. Should observe at least one bounce
    let foundBounce = false;
    
    for (let i = 1; i < velocities.length; i++) {
      // A bounce is indicated by velocity changing from negative to positive
      if (velocities[i-1] < 0 && velocities[i] > 0) {
        foundBounce = true;
        break;
      }
    }
    
    expect(foundBounce).toBe(true);
  });
  
  test('marble should transition through jump states correctly', () => {
    // Create platform
    PlatformFactory.createMainPlatform(world);
    
    // Create marble on ground
    const marble = MarbleFactory.create(world, new THREE.Vector3(0, OBJECTS.MARBLE_RADIUS, 0));
    
    // Get components
    const marbleJump = marble.getComponent(Jump)!;
    const marblePhysics = marble.getComponent(Physics)!;
    
    // Initial state (on ground)
    marbleJump.isOnSurface = true;
    marbleJump.isJumping = false;
    marbleJump.isFalling = false;
    marblePhysics.isOnGround = true;
    
    // Request a jump
    marbleJump.requestJump();
    
    // Run physics (should execute jump)
    physicsSystem.update(0.016);
    
    // Should be in jumping state
    expect(marbleJump.isJumping).toBe(true);
    expect(marbleJump.isOnSurface).toBe(false);
    expect(marbleJump.isFalling).toBe(false);
    expect(marblePhysics.velocity.y).toBeGreaterThan(0);
    
    // Run several more frames to reach peak
    for (let i = 0; i < 20; i++) {
      physicsSystem.update(0.016);
    }
    
    // Run more frames until we're definitely past the peak and falling
    let maxFrames = 30;
    let isFalling = false;
    
    // Run until we're definitely falling
    while (maxFrames > 0 && !isFalling) {
      physicsSystem.update(0.016);
      if (marblePhysics.velocity.y < 0) {
        isFalling = true;
      }
      maxFrames--;
    }
    
    // Now we should be falling
    expect(isFalling).toBe(true);
    
    // Run more frames to ensure state transition happens
    for (let i = 0; i < 5; i++) {
      physicsSystem.update(0.016);
    }
    
    // After more frames, should be in falling state
    expect(marbleJump.isJumping).toBe(false);
    expect(marbleJump.isFalling).toBe(true);
    
    // Run many more frames to fall and hit ground
    for (let i = 0; i < 50; i++) {
      physicsSystem.update(0.016);
      collisionSystem.update(0.016);
    }
    
    // Should be on ground again
    expect(marbleJump.isOnSurface).toBe(true);
    expect(marbleJump.isJumping).toBe(false);
    expect(marbleJump.isFalling).toBe(false);
  });
  
  test('marble should have reduced air control while in air', () => {
    // Create platform
    PlatformFactory.createMainPlatform(world);
    
    // Create marble
    const marble = MarbleFactory.create(world, new THREE.Vector3(0, 5, 0));
    
    // Get components
    const marblePhysics = marble.getComponent(Physics)!;
    const playerControl = marble.getComponent(PlayerControl);
    
    // Skip test if PlayerControl component is not present
    if (!playerControl) {
      console.log('Test skipped: PlayerControl component not found on marble');
      return;
    }
    
    // Set movement direction (trying to move in air)
    playerControl.moveDirection.x = 1;
    marblePhysics.isOnGround = false;
    
    // Initial horizontal velocity
    marblePhysics.velocity.x = 0;
    
    // Run physics for one frame
    physicsSystem.update(0.016);
    
    // Record air acceleration
    const airAcceleration = marblePhysics.velocity.x;
    
    // Reset
    marblePhysics.velocity.x = 0;
    
    // Now set as on ground
    marblePhysics.isOnGround = true;
    
    // Run physics again
    physicsSystem.update(0.016);
    
    // Record ground acceleration
    const groundAcceleration = marblePhysics.velocity.x;
    
    // Air acceleration should be less than ground acceleration
    expect(airAcceleration).toBeLessThan(groundAcceleration);
    expect(airAcceleration / groundAcceleration).toBeCloseTo(playerControl.airControlFactor, 1);
  });
});