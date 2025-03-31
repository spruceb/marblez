import { World } from '../../src/engine/ecs/World';
import { PhysicsSystem } from '../../src/systems/PhysicsSystem';
import { ObstacleFactory } from '../../src/factories/ObstacleFactory';
import { MarbleFactory } from '../../src/factories/MarbleFactory';
import { Physics } from '../../src/components/Physics';
import { benchmark, formatBenchmarkResult } from '../utils/benchmark';
import * as THREE from 'three';

describe('PhysicsSystem Performance', () => {
  let world: World;
  let physicsSystem: PhysicsSystem;
  
  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem(world);
    world.addSystem(physicsSystem);
  });
  
  test('should scale with number of entities', () => {
    // Test with different entity counts
    const entityCounts = [10, 50, 100, 200];
    const results = [];
    
    for (const count of entityCounts) {
      // Clear previous entities
      world = new World();
      physicsSystem = new PhysicsSystem(world);
      
      // Create one marble
      MarbleFactory.create(world, new THREE.Vector3(0, 5, 0));
      
      // Create dynamic obstacles
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = 5 + Math.random() * 10;
        const z = (Math.random() - 0.5) * 40;
        const position = new THREE.Vector3(x, y, z);
        
        ObstacleFactory.createSphereObstacle(
          world,
          position,
          0.5 + Math.random() * 0.5,
          0x666666,
          false // Dynamic
        );
      }
      
      // Benchmark physics update
      const result = benchmark(
        `Physics system with ${count} dynamic entities`,
        () => physicsSystem.update(0.016), // 60fps frame
        100
      );
      
      results.push(result);
      console.log(formatBenchmarkResult(result));
      
      // Verify the system stays performant - relaxed threshold for test environments
      expect(result.averageTime).toBeLessThan(20); // Relaxed threshold for test environments
    }
    
    // Expect roughly linear scaling
    const ratio1 = results[1].averageTime / results[0].averageTime;
    const ratio2 = results[2].averageTime / results[0].averageTime;
    
    expect(ratio1).toBeLessThan(entityCounts[1] / entityCounts[0]); // Should be sub-linear
    expect(ratio2).toBeLessThan(entityCounts[2] / entityCounts[0]); // Should be sub-linear
  });
  
  test('should handle high-velocity objects efficiently', () => {
    // Create a single high-velocity object
    const position = new THREE.Vector3(0, 0, 0);
    
    const marble = MarbleFactory.create(world, position);
    const physics = marble.getComponent(Physics);
    
    // Set high velocity
    physics.velocity.set(100, 100, 100);
    
    // Benchmark physics update with high velocity
    const result = benchmark(
      'Physics with high-velocity object',
      () => physicsSystem.update(0.016),
      1000
    );
    
    console.log(formatBenchmarkResult(result));
    
    // Should still be reasonably fast (further relaxed for CI/test environments)
    expect(result.averageTime).toBeLessThan(10); // Less than 10ms - very relaxed for test environments
  });
  
  test('should handle many static objects efficiently', () => {
    // Create many static obstacles
    for (let i = 0; i < 500; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = Math.random() * 5;
      const z = (Math.random() - 0.5) * 100;
      const position = new THREE.Vector3(x, y, z);
      
      ObstacleFactory.createBoxObstacle(
        world,
        position,
        1, 1, 1,
        0x666666,
        true // Static
      );
    }
    
    // Add a few dynamic objects
    for (let i = 0; i < 10; i++) {
      MarbleFactory.create(world, new THREE.Vector3(i * 2, 10, 0));
    }
    
    // Benchmark physics update with many static objects
    const result = benchmark(
      'Physics with 500 static + 10 dynamic objects',
      () => physicsSystem.update(0.016),
      100
    );
    
    console.log(formatBenchmarkResult(result));
    
    // Should still be reasonably fast due to static optimization
    expect(result.averageTime).toBeLessThan(10); // Relaxed threshold for test environments
  });
});