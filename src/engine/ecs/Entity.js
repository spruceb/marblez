/**
 * Entity class for the ECS system.
 * Entities are simple containers for components.
 */
export class Entity {
  /**
   * Create a new entity
   * @param {number} id - Unique identifier for this entity
   */
  constructor(id) {
    this.id = id;
    this.components = new Map();
  }

  /**
   * Add a component to this entity
   * @param {Component} component - The component to add
   * @returns {Entity} This entity for method chaining
   */
  addComponent(component) {
    this.components.set(component.constructor.name, component);
    return this;
  }

  /**
   * Remove a component from this entity
   * @param {Function} componentClass - The class of the component to remove
   * @returns {Entity} This entity for method chaining
   */
  removeComponent(componentClass) {
    this.components.delete(componentClass.name);
    return this;
  }

  /**
   * Get a component from this entity
   * @param {Function} componentClass - The class of the component to get
   * @returns {Component|undefined} The component, or undefined if not found
   */
  getComponent(componentClass) {
    return this.components.get(componentClass.name);
  }

  /**
   * Check if this entity has a component
   * @param {Function} componentClass - The class of the component to check for
   * @returns {boolean} True if the entity has the component, false otherwise
   */
  hasComponent(componentClass) {
    return this.components.has(componentClass.name);
  }
}