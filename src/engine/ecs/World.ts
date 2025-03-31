import { IWorld, IEntity, ISystem, IComponent } from '../../types/ecs';
import { Entity } from './Entity';

/**
 * World class that manages all entities and systems.
 * This is the main container for the ECS architecture.
 */
export class World implements IWorld {
  entities: Map<number, IEntity>;
  systems: ISystem[];
  nextEntityId: number;
  
  /**
   * Create a new ECS world
   */
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.nextEntityId = 1;
  }

  /**
   * Create a new entity in this world
   * @returns The newly created entity
   */
  createEntity(): IEntity {
    const entity = new Entity(this.nextEntityId++);
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Remove an entity from this world
   * @param entity The entity to remove
   */
  removeEntity(entity: IEntity): void {
    this.entities.delete(entity.id);
  }

  /**
   * Add a system to this world
   * @param system The system to add
   * @returns This world for method chaining
   */
  addSystem(system: ISystem): World {
    this.systems.push(system);
    return this;
  }

  /**
   * Update all systems in this world
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    // Update each system in order
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }

  /**
   * Get all entities that have the specified components
   * @param componentClasses Array of component classes to check for
   * @returns Array of entities with all the specified components
   */
  getEntitiesWithComponents(componentClasses: Array<new (...args: any[]) => IComponent>): IEntity[] {
    const result: IEntity[] = [];
    
    for (const entity of this.entities.values()) {
      let hasAllComponents = true;
      
      for (const componentClass of componentClasses) {
        if (!entity.hasComponent(componentClass)) {
          hasAllComponents = false;
          break;
        }
      }
      
      if (hasAllComponents) {
        result.push(entity);
      }
    }
    
    return result;
  }
}