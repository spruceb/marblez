import { World } from '../../src/engine/ecs/World';
import { CollisionSystem } from '../../src/systems/CollisionSystem';
import { Transform } from '../../src/components/Transform';
import { Physics } from '../../src/components/Physics';
import { Collider } from '../../src/components/Collider';
import { MarbleTag } from '../../src/components/Tags';
import { ObstacleFactory } from '../../src/factories/ObstacleFactory';
import * as THREE from 'three';
import { benchmark } from '../utils/benchmark';

describe('CollisionSystem Performance', () => {
  // Skip in CI environment to avoid flaky tests
  const testOrSkip = process.env.CI ? it.skip : it;
  
  function createTestWorld(obstacleCount: number): { world: World, system: CollisionSystem } {
    const world = new World();
    const system = new CollisionSystem(world);
    
    // Create a marble
    const marble = world.createEntity();
    marble.addComponent(new Transform(new THREE.Vector3(0, 1, 0)));
    marble.addComponent(new Physics());
    marble.addComponent(new Collider('sphere', { radius: 0.8 }));
    marble.addComponent(new MarbleTag());
    
    // Create multiple obstacles in a grid
    const factory = new ObstacleFactory();
    const gridSize = Math.ceil(Math.sqrt(obstacleCount));
    let count = 0;
    
    for (let x = 0; x < gridSize && count < obstacleCount; x++) {
      for (let z = 0; z < gridSize && count < obstacleCount; z++) {
        ObstacleFactory.createBoxObstacle(
          world,
          new THREE.Vector3(-50 + x * 5, 1, -50 + z * 5),
          1, 1, 1
        );
        count++;
      }
    }
    
    return { world, system };
  }
  
  testOrSkip('should handle different numbers of obstacles efficiently', () => {
    // Test with different obstacle counts
    const obstacleCounts = [10, 50, 100, 200];
    
    const results = obstacleCounts.map(count => {
      const { world, system } = createTestWorld(count);
      
      // Benchmark collision check
      return benchmark(
        `Collision system with ${count} obstacles`,
        () => system.update(0.016),
        100 // Run 100 iterations
      );
    });
    
    // Log results
    results.forEach(result => {
      console.log(`${result.name}: ${result.averageTime.toFixed(3)} ms (${result.operationsPerSecond.toFixed(2)} ops/sec)`);
    });
    
    // Check performance scaling
    // The time should grow less than linearly with the number of obstacles
    // This is a fairly arbitrary test and may need adjustment
    const baseline = results[0].averageTime / obstacleCounts[0];
    const worstRatio = Math.max(
      ...results.map((r, i) => r.averageTime / obstacleCounts[i] / baseline)
    );
    
    expect(worstRatio).toBeLessThan(5); // Should scale less than 5x worse than linearly
  }, 15000); // Allow up to 15 seconds for this test
});