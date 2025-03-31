import { System } from '../../../src/engine/ecs/System';
import { World } from '../../../src/engine/ecs/World';
import { Entity } from '../../../src/engine/ecs/Entity';
import { Component } from '../../../src/engine/ecs/Component';

// Test components
class ComponentA extends Component {}
class ComponentB extends Component {}
class ComponentC extends Component {}

// Test system implementation
class TestSystem extends System {
  updateCalled: boolean = false;
  lastDeltaTime: number = 0;
  
  constructor(world: World) {
    super(world);
    this.requiredComponents = [ComponentA, ComponentB];
  }
  
  update(deltaTime: number): void {
    this.updateCalled = true;
    this.lastDeltaTime = deltaTime;
  }
}

describe('System', () => {
  test('should not be instantiated directly', () => {
    const world = new World();
    expect(() => new System(world)).toThrow('System is an abstract class');
  });
  
  test('should be initialized with world reference', () => {
    const world = new World();
    const system = new TestSystem(world);
    
    expect(system.world).toBe(world);
  });
  
  test('should have empty required components by default', () => {
    const world = new World();
    const system = new TestSystem(world);
    
    // Override in constructor, so it should have our components
    expect(system.requiredComponents).toEqual([ComponentA, ComponentB]);
  });
  
  test('should get entities with required components', () => {
    // Create a world with entities
    const world = new World();
    
    // Entity with components A and B
    const entity1 = new Entity(1);
    entity1.addComponent(new ComponentA());
    entity1.addComponent(new ComponentB());
    world.entities.set(entity1.id, entity1);
    
    // Entity with only component A
    const entity2 = new Entity(2);
    entity2.addComponent(new ComponentA());
    world.entities.set(entity2.id, entity2);
    
    // Entity with components A, B, and C
    const entity3 = new Entity(3);
    entity3.addComponent(new ComponentA());
    entity3.addComponent(new ComponentB());
    entity3.addComponent(new ComponentC());
    world.entities.set(entity3.id, entity3);
    
    // Set up system
    const system = new TestSystem(world);
    
    // Get entities that match the system's required components
    const matchingEntities = system.getEntities();
    
    // Should return entities 1 and 3, which have both A and B
    expect(matchingEntities).toHaveLength(2);
    expect(matchingEntities).toContain(entity1);
    expect(matchingEntities).not.toContain(entity2);
    expect(matchingEntities).toContain(entity3);
  });
  
  test('should track update calls', () => {
    const world = new World();
    const system = new TestSystem(world);
    
    // Call update
    system.update(0.016);
    
    // Check that update was called
    expect(system.updateCalled).toBe(true);
    expect(system.lastDeltaTime).toBe(0.016);
  });
});