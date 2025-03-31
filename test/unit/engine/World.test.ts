import { World } from '../../../src/engine/ecs/World';
import { Entity } from '../../../src/engine/ecs/Entity';
import { System } from '../../../src/engine/ecs/System';
import { Component } from '../../../src/engine/ecs/Component';

// Test components
class ComponentA extends Component {}
class ComponentB extends Component {}

// Test system implementation
class TestSystem extends System {
  updateCalled: boolean = false;
  lastDeltaTime: number = 0;
  
  constructor(world: World) {
    super(world);
    this.requiredComponents = [ComponentA];
  }
  
  update(deltaTime: number): void {
    this.updateCalled = true;
    this.lastDeltaTime = deltaTime;
  }
}

describe('World', () => {
  test('should initialize with empty entities and systems', () => {
    const world = new World();
    
    expect(world.entities).toBeInstanceOf(Map);
    expect(world.entities.size).toBe(0);
    expect(world.systems).toEqual([]);
    expect(world.nextEntityId).toBe(1);
  });
  
  test('should create entity with incremented ID', () => {
    const world = new World();
    
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();
    const entity3 = world.createEntity();
    
    expect(entity1.id).toBe(1);
    expect(entity2.id).toBe(2);
    expect(entity3.id).toBe(3);
    expect(world.nextEntityId).toBe(4);
    expect(world.entities.size).toBe(3);
  });
  
  test('should remove entity correctly', () => {
    const world = new World();
    
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();
    
    world.removeEntity(entity1);
    
    expect(world.entities.size).toBe(1);
    expect(world.entities.has(entity1.id)).toBe(false);
    expect(world.entities.has(entity2.id)).toBe(true);
  });
  
  test('should add system correctly', () => {
    const world = new World();
    const system = new TestSystem(world);
    
    const result = world.addSystem(system);
    
    expect(result).toBe(world); // For chaining
    expect(world.systems).toHaveLength(1);
    expect(world.systems[0]).toBe(system);
  });
  
  test('should update all systems', () => {
    const world = new World();
    const system1 = new TestSystem(world);
    const system2 = new TestSystem(world);
    
    world.addSystem(system1);
    world.addSystem(system2);
    
    world.update(0.016);
    
    expect(system1.updateCalled).toBe(true);
    expect(system1.lastDeltaTime).toBe(0.016);
    expect(system2.updateCalled).toBe(true);
    expect(system2.lastDeltaTime).toBe(0.016);
  });
  
  test('should get entities with components', () => {
    const world = new World();
    
    // Entity with component A
    const entity1 = world.createEntity();
    entity1.addComponent(new ComponentA());
    
    // Entity with component B
    const entity2 = world.createEntity();
    entity2.addComponent(new ComponentB());
    
    // Entity with both components A and B
    const entity3 = world.createEntity();
    entity3.addComponent(new ComponentA());
    entity3.addComponent(new ComponentB());
    
    // Test getting entities with component A
    const entitiesWithA = world.getEntitiesWithComponents([ComponentA]);
    expect(entitiesWithA).toHaveLength(2);
    expect(entitiesWithA).toContain(entity1);
    expect(entitiesWithA).not.toContain(entity2);
    expect(entitiesWithA).toContain(entity3);
    
    // Test getting entities with component B
    const entitiesWithB = world.getEntitiesWithComponents([ComponentB]);
    expect(entitiesWithB).toHaveLength(2);
    expect(entitiesWithB).not.toContain(entity1);
    expect(entitiesWithB).toContain(entity2);
    expect(entitiesWithB).toContain(entity3);
    
    // Test getting entities with both components
    const entitiesWithAB = world.getEntitiesWithComponents([ComponentA, ComponentB]);
    expect(entitiesWithAB).toHaveLength(1);
    expect(entitiesWithAB).not.toContain(entity1);
    expect(entitiesWithAB).not.toContain(entity2);
    expect(entitiesWithAB).toContain(entity3);
  });
});