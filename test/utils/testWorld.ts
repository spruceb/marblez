import { World } from '../../src/engine/ecs/World';
import { System } from '../../src/engine/ecs/System';
import { PhysicsSystem } from '../../src/systems/PhysicsSystem';
import { CollisionSystem } from '../../src/systems/CollisionSystem';
import { JumpSystem } from '../../src/systems/JumpSystem';
import { IEntity } from '../../src/types/ecs';

/**
 * Configuration for test world creation
 */
export interface TestWorldConfig {
  includeSystems?: {
    physics?: boolean;
    collision?: boolean;
    jump?: boolean;
  };
  customSystems?: System[];
}

/**
 * Create a test world with specified systems
 * @param config Configuration options
 * @returns Created world instance
 */
export function createTestWorld(config: TestWorldConfig = {}): World {
  const world = new World();
  
  // Default config
  const fullConfig = {
    includeSystems: {
      physics: true,
      collision: true,
      jump: true,
      ...config.includeSystems
    },
    customSystems: config.customSystems || []
  };
  
  // Add standard systems
  if (fullConfig.includeSystems.physics) {
    world.addSystem(new PhysicsSystem(world));
  }
  
  if (fullConfig.includeSystems.collision) {
    world.addSystem(new CollisionSystem(world));
  }
  
  if (fullConfig.includeSystems.jump) {
    world.addSystem(new JumpSystem(world));
  }
  
  // Add custom systems
  for (const system of fullConfig.customSystems) {
    world.addSystem(system);
  }
  
  return world;
}

/**
 * Run simulation for a specified number of frames
 * @param world The world to simulate
 * @param frameCount Number of frames to simulate
 * @param deltaTime Time step per frame (default: 1/60)
 */
export function runSimulation(
  world: World,
  frameCount: number,
  deltaTime: number = 1/60
): void {
  for (let i = 0; i < frameCount; i++) {
    world.update(deltaTime);
  }
}

/**
 * Record entity state at each frame during simulation
 * @param world The world to simulate
 * @param entity The entity to track
 * @param propertyGetter Function to extract property to track
 * @param frameCount Number of frames to simulate
 * @param deltaTime Time step per frame (default: 1/60)
 * @returns Array of property values at each frame
 */
export function recordEntityStateOverTime<T>(
  world: World,
  entity: IEntity,
  propertyGetter: (entity: IEntity) => T,
  frameCount: number,
  deltaTime: number = 1/60
): T[] {
  const values: T[] = [];
  
  for (let i = 0; i < frameCount; i++) {
    world.update(deltaTime);
    values.push(propertyGetter(entity));
  }
  
  return values;
}