import { IEntity, IComponent } from '../../types/ecs';

/**
 * Entity class for the ECS system.
 * Entities are simple containers for components.
 */
export class Entity implements IEntity {
  id: number;
  components: Map<string, IComponent>;

  /**
   * Create a new entity
   * @param id Unique identifier for this entity
   */
  constructor(id: number) {
    this.id = id;
    this.components = new Map();
  }

  /**
   * Add a component to this entity
   * @param component The component to add
   * @returns This entity for method chaining
   */
  addComponent(component: IComponent): Entity {
    this.components.set(component.constructor.name, component);
    return this;
  }

  /**
   * Remove a component from this entity
   * @param componentClass The class of the component to remove
   * @returns This entity for method chaining
   */
  removeComponent(componentClass: Function): Entity {
    this.components.delete(componentClass.name);
    return this;
  }

  /**
   * Get a component from this entity
   * @param componentClass The class of the component to get
   * @returns The component, or undefined if not found
   */
  getComponent<T extends IComponent>(componentClass: new (...args: any[]) => T): T | undefined {
    return this.components.get(componentClass.name) as T | undefined;
  }

  /**
   * Check if this entity has a component
   * @param componentClass The class of the component to check for
   * @returns True if the entity has the component, false otherwise
   */
  hasComponent(componentClass: Function): boolean {
    return this.components.has(componentClass.name);
  }
}