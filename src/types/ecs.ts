/**
 * Core ECS interfaces for the Marble Game
 */

/**
 * Base interface for all components
 */
export interface IComponent {
  // Base component interface - serves as a marker interface
}

/**
 * Interface for entities which are containers for components
 */
export interface IEntity {
  id: number;
  components: Map<string, IComponent>;
  
  /**
   * Add a component to this entity
   * @param component The component to add
   * @returns This entity for method chaining
   */
  addComponent(component: IComponent): IEntity;
  
  /**
   * Remove a component from this entity
   * @param componentClass The class of the component to remove
   * @returns This entity for method chaining
   */
  removeComponent(componentClass: Function): IEntity;
  
  /**
   * Get a component from this entity
   * @param componentClass The class of the component to get
   * @returns The component, or undefined if not found
   */
  getComponent<T extends IComponent>(componentClass: new (...args: any[]) => T): T | undefined;
  
  /**
   * Check if this entity has a component
   * @param componentClass The class of the component to check for
   * @returns True if the entity has the component, false otherwise
   */
  hasComponent(componentClass: Function): boolean;
}

/**
 * Interface for systems that process entities with specific components
 */
export interface ISystem {
  world: IWorld;
  requiredComponents: Array<new (...args: any[]) => IComponent>;
  
  /**
   * Update the system for the current frame
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void;
  
  /**
   * Get all entities that have the required components for this system
   * @returns Array of entities with the required components
   */
  getEntities(): IEntity[];
}

/**
 * Interface for the world that manages entities and systems
 */
export interface IWorld {
  entities: Map<number, IEntity>;
  systems: ISystem[];
  nextEntityId: number;
  
  /**
   * Create a new entity in this world
   * @returns The newly created entity
   */
  createEntity(): IEntity;
  
  /**
   * Remove an entity from this world
   * @param entity The entity to remove
   */
  removeEntity(entity: IEntity): void;
  
  /**
   * Add a system to this world
   * @param system The system to add
   * @returns This world for method chaining
   */
  addSystem(system: ISystem): IWorld;
  
  /**
   * Update all systems in this world
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void;
  
  /**
   * Get all entities that have the specified components
   * @param componentClasses Array of component classes to check for
   * @returns Array of entities with all the specified components
   */
  getEntitiesWithComponents(componentClasses: Array<new (...args: any[]) => IComponent>): IEntity[];
}