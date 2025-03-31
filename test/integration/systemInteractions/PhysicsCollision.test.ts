import { World } from '../../../src/engine/ecs/World';
import { PhysicsSystem } from '../../../src/systems/PhysicsSystem';
import { CollisionSystem } from '../../../src/systems/CollisionSystem';
import { Entity } from '../../../src/engine/ecs/Entity';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import { Collider } from '../../../src/components/Collider';
import { Jump } from '../../../src/components/Jump';
import { MarbleTag } from '../../../src/components/Tags';
import * as THREE from 'three';
import { OBJECTS } from '../../../src/utils/Constants';

describe('Physics and Collision Integration', () => {
  let world: World;
  let physicsSystem: PhysicsSystem;
  let collisionSystem: CollisionSystem;
  
  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem(world);
    collisionSystem = new CollisionSystem(world);
  });
  
  test('should handle floor collision with gravity', () => {
    // Create ground
    const ground = world.createEntity();
    ground.addComponent(new Transform(new THREE.Vector3(0, 0, 0)));
    ground.addComponent(new Physics(0, 0)); // Static object
    ground.getComponent(Physics)!.isStatic = true;
    ground.addComponent(new Collider('box', {
      width: OBJECTS.PLATFORM_SIZE * 2,
      height: 0.1,
      depth: OBJECTS.PLATFORM_SIZE * 2
    }));
    
    // Create falling marble
    const marble = world.createEntity();
    marble.addComponent(new Transform(new THREE.Vector3(0, 10, 0)));
    marble.addComponent(new Physics(1, 0.1)); // With gravity
    marble.addComponent(new Collider('sphere', { radius: OBJECTS.MARBLE_RADIUS }));
    marble.addComponent(new Jump());
    marble.addComponent(new MarbleTag());
    
    // Run simulation for multiple frames
    for (let i = 0; i < 50; i++) {
      physicsSystem.update(0.1);
      collisionSystem.update(0.1);
    }
    
    // Marble should have fallen and stopped at the ground level
    const marbleTransform = marble.getComponent(Transform)!;
    const marblePhysics = marble.getComponent(Physics)!;
    const marbleJump = marble.getComponent(Jump)!;
    
    // Marble should have settled at the ground level
    expect(marbleTransform.position.y).toBeCloseTo(OBJECTS.MARBLE_RADIUS, 1); // Should be at radius height
    expect(Math.abs(marblePhysics.velocity.y)).toBeLessThan(0.1); // Velocity should be near zero
  });
  
  test('should bounce when colliding with ground', () => {
    // Create ground
    const ground = world.createEntity();
    ground.addComponent(new Transform(new THREE.Vector3(0, 0, 0)));
    ground.addComponent(new Physics(0, 0)); // Static object
    ground.getComponent(Physics)!.isStatic = true;
    ground.addComponent(new Collider('box', {
      width: OBJECTS.PLATFORM_SIZE * 2,
      height: 0.1,
      depth: OBJECTS.PLATFORM_SIZE * 2
    }));
    
    // Create marble with high downward velocity
    const marble = world.createEntity();
    marble.addComponent(new Transform(new THREE.Vector3(0, 5, 0)));
    const marblePhysics = new Physics(1, 0.1);
    marblePhysics.velocity.y = -10; // Fast downward velocity
    marblePhysics.bounceCoefficient = 0.5; // Bounce 50%
    marble.addComponent(marblePhysics);
    marble.addComponent(new Collider('sphere', { radius: OBJECTS.MARBLE_RADIUS }));
    marble.addComponent(new Jump());
    marble.addComponent(new MarbleTag());
    
    // Run a single update to capture the bounce
    physicsSystem.update(0.016);
    collisionSystem.update(0.016);
    
    // After collision, vertical velocity should be positive (bouncing up)
    expect(marblePhysics.velocity.y).toBeGreaterThan(0);
    // Specifically, it should be 50% of the impact velocity
    expect(marblePhysics.velocity.y).toBeCloseTo(5, 0);
  });
});