import { ISystem, IEntity, IComponent, IWorld } from '../../types/ecs';

/**
 * Base class for all systems in the ECS architecture.
 * Systems operate on entities that have specific components.
 */
export class System implements ISystem {
  world: IWorld;
  requiredComponents: Array<new (...args: any[]) => IComponent>;
  
  /**
   * Create a new system
   * @param world The world this system operates in
   */
  constructor(world: IWorld) {
    this.world = world;
    this.requiredComponents = [];
    
    // Ensure this class is not instantiated directly
    if (this.constructor === System) {
      throw new Error("System is an abstract class and cannot be instantiated directly");
    }
  }

  /**
   * Update the system for the current frame
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    throw new Error("update() must be implemented by derived classes");
  }

  /**
   * Get all entities that have the required components for this system
   * @returns Array of entities with the required components
   */
  getEntities(): IEntity[] {
    return this.world.getEntitiesWithComponents(this.requiredComponents);
  }
}