import { Entity } from '../../../src/engine/ecs/Entity';
import { Component } from '../../../src/engine/ecs/Component';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import * as THREE from 'three';

// Create a simple test component
class TestComponent extends Component {
  testProperty: string;
  
  constructor(value: string = 'test') {
    super();
    this.testProperty = value;
  }
}

describe('Entity', () => {
  test('should be created with correct ID', () => {
    const entity = new Entity(5);
    expect(entity.id).toBe(5);
  });
  
  test('should initialize with empty components map', () => {
    const entity = new Entity(1);
    expect(entity.components).toBeInstanceOf(Map);
    expect(entity.components.size).toBe(0);
  });
  
  test('should add component correctly', () => {
    const entity = new Entity(1);
    const component = new TestComponent();
    
    const result = entity.addComponent(component);
    
    expect(result).toBe(entity); // Should return itself for chaining
    expect(entity.components.get('TestComponent')).toBe(component);
    expect(entity.components.size).toBe(1);
  });
  
  test('should add multiple components', () => {
    const entity = new Entity(1);
    const comp1 = new TestComponent('one');
    const comp2 = new Transform();
    const comp3 = new Physics();
    
    entity.addComponent(comp1).addComponent(comp2).addComponent(comp3);
    
    expect(entity.components.size).toBe(3);
    expect(entity.components.get('TestComponent')).toBe(comp1);
    expect(entity.components.get('Transform')).toBe(comp2);
    expect(entity.components.get('Physics')).toBe(comp3);
  });
  
  test('should replace component if adding with same type', () => {
    const entity = new Entity(1);
    const comp1 = new TestComponent('one');
    const comp2 = new TestComponent('two');
    
    entity.addComponent(comp1);
    entity.addComponent(comp2);
    
    expect(entity.components.size).toBe(1);
    expect(entity.components.get('TestComponent')).toBe(comp2);
    expect(entity.components.get('TestComponent')).not.toBe(comp1);
  });
  
  test('should get component by type', () => {
    const entity = new Entity(1);
    const transform = new Transform(new THREE.Vector3(1, 2, 3));
    
    entity.addComponent(transform);
    
    const retrievedTransform = entity.getComponent(Transform);
    expect(retrievedTransform).toBe(transform);
    expect(retrievedTransform?.position.x).toBe(1);
    expect(retrievedTransform?.position.y).toBe(2);
    expect(retrievedTransform?.position.z).toBe(3);
  });
  
  test('should return undefined when getting non-existent component', () => {
    const entity = new Entity(1);
    entity.addComponent(new TestComponent());
    
    const transform = entity.getComponent(Transform);
    
    expect(transform).toBeUndefined();
  });
  
  test('should check if component exists correctly', () => {
    const entity = new Entity(1);
    entity.addComponent(new TestComponent());
    
    expect(entity.hasComponent(TestComponent)).toBe(true);
    expect(entity.hasComponent(Transform)).toBe(false);
  });
  
  test('should remove component correctly', () => {
    const entity = new Entity(1);
    entity.addComponent(new TestComponent());
    entity.addComponent(new Transform());
    
    const result = entity.removeComponent(TestComponent);
    
    expect(result).toBe(entity); // Should return itself for chaining
    expect(entity.components.size).toBe(1);
    expect(entity.hasComponent(TestComponent)).toBe(false);
    expect(entity.hasComponent(Transform)).toBe(true);
  });
  
  test('should do nothing when removing non-existent component', () => {
    const entity = new Entity(1);
    entity.addComponent(new Transform());
    
    entity.removeComponent(TestComponent);
    
    expect(entity.components.size).toBe(1);
    expect(entity.hasComponent(Transform)).toBe(true);
  });
});