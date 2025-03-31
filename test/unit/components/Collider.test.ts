import { Collider } from '../../../src/components/Collider';
import { Component } from '../../../src/engine/ecs/Component';

describe('Collider Component', () => {
  test('should extend Component', () => {
    const collider = new Collider('box', { width: 1, height: 1, depth: 1 });
    expect(collider).toBeInstanceOf(Component);
    expect(collider).toBeInstanceOf(Collider);
  });
  
  test('should initialize box collider', () => {
    const boxParams = { width: 2, height: 3, depth: 4 };
    const collider = new Collider('box', boxParams);
    
    expect(collider.type).toBe('box');
    expect(collider.params).toEqual(boxParams);
    expect(collider.isTrigger).toBe(false);
  });
  
  test('should initialize sphere collider', () => {
    const sphereParams = { radius: 2 };
    const collider = new Collider('sphere', sphereParams);
    
    expect(collider.type).toBe('sphere');
    expect(collider.params).toEqual(sphereParams);
    expect(collider.isTrigger).toBe(false);
  });
  
  test('should initialize torus collider', () => {
    const torusParams = { radius: 5, tube: 1 };
    const collider = new Collider('torus', torusParams);
    
    expect(collider.type).toBe('torus');
    expect(collider.params).toEqual(torusParams);
    expect(collider.isTrigger).toBe(false);
  });
  
  test('should set trigger flag', () => {
    const collider = new Collider('box', { width: 1, height: 1, depth: 1 }, true);
    expect(collider.isTrigger).toBe(true);
  });
  
  test('should store extra params for complex colliders', () => {
    const torusParams = { 
      radius: 5, 
      tube: 1,
      innerRadius: 3,
      outerRadius: 7
    };
    
    const collider = new Collider('torus', torusParams);
    
    expect(collider.params).toEqual(torusParams);
    expect(collider.params.innerRadius).toBe(3);
    expect(collider.params.outerRadius).toBe(7);
  });
});