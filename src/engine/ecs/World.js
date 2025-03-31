import { Entity } from './Entity.js';

/**
 * World class that manages all entities and systems.
 * This is the main container for the ECS architecture.
 */
export class World {
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
   * @returns {Entity} The newly created entity
   */
  createEntity() {
    const entity = new Entity(this.nextEntityId++);
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Remove an entity from this world
   * @param {Entity} entity - The entity to remove
   */
  removeEntity(entity) {
    this.entities.delete(entity.id);
  }

  /**
   * Add a system to this world
   * @param {System} system - The system to add
   * @returns {World} This world for method chaining
   */
  addSystem(system) {
    this.systems.push(system);
    return this;
  }

  /**
   * Update all systems in this world
   * @param {number} deltaTime - Time in seconds since the last update
   */
  update(deltaTime) {
    // Update each system in order
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }

  /**
   * Get all entities that have the specified components
   * @param {Function[]} componentClasses - Array of component classes to check for
   * @returns {Entity[]} Array of entities with all the specified components
   */
  getEntitiesWithComponents(componentClasses) {
    const result = [];
    
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