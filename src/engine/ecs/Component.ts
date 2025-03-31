import { IComponent } from '../../types/ecs';

/**
 * Base class for all components in the ECS system.
 * Components are pure data containers with no behavior.
 */
export class Component implements IComponent {
  /**
   * Create a new component
   */
  constructor() {
    // Ensure this class is not instantiated directly
    if (this.constructor === Component) {
      throw new Error("Component is an abstract class and cannot be instantiated directly");
    }
  }
}