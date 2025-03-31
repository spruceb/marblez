import { Transform } from '../../../src/components/Transform';
import { Component } from '../../../src/engine/ecs/Component';
import * as THREE from 'three';

describe('Transform Component', () => {
  test('should extend Component', () => {
    const transform = new Transform();
    expect(transform).toBeInstanceOf(Component);
    expect(transform).toBeInstanceOf(Transform);
  });
  
  test('should initialize with default values', () => {
    const transform = new Transform();
    
    expect(transform.position).toBeInstanceOf(THREE.Vector3);
    expect(transform.rotation).toBeInstanceOf(THREE.Vector3);
    expect(transform.scale).toBeInstanceOf(THREE.Vector3);
    expect(transform.previousPosition).toBeInstanceOf(THREE.Vector3);
    
    expect(transform.position).toEqual(new THREE.Vector3(0, 0, 0));
    expect(transform.rotation).toEqual(new THREE.Vector3(0, 0, 0));
    expect(transform.scale).toEqual(new THREE.Vector3(1, 1, 1));
    expect(transform.previousPosition).toEqual(new THREE.Vector3(0, 0, 0));
  });
  
  test('should initialize with custom position', () => {
    const position = new THREE.Vector3(1, 2, 3);
    const transform = new Transform(position);
    
    expect(transform.position.x).toBe(1);
    expect(transform.position.y).toBe(2);
    expect(transform.position.z).toBe(3);
    
    // Should have cloned the position
    expect(transform.position).not.toBe(position);
    expect(transform.position).toEqual(position);
    
    // Previous position should match initial position
    expect(transform.previousPosition).toEqual(position);
  });
  
  test('should initialize with custom position, rotation, and scale', () => {
    const position = new THREE.Vector3(1, 2, 3);
    const rotation = new THREE.Vector3(0.1, 0.2, 0.3);
    const scale = new THREE.Vector3(2, 3, 4);
    
    const transform = new Transform(position, rotation, scale);
    
    expect(transform.position).toEqual(position);
    expect(transform.rotation).toEqual(rotation);
    expect(transform.scale).toEqual(scale);
    
    // Should have cloned all vectors
    expect(transform.position).not.toBe(position);
    expect(transform.rotation).not.toBe(rotation);
    expect(transform.scale).not.toBe(scale);
  });
  
  test('should save previous position', () => {
    const transform = new Transform(new THREE.Vector3(1, 2, 3));
    
    // Change position
    transform.position.set(4, 5, 6);
    
    // Previous position should still be the original
    expect(transform.previousPosition).toEqual(new THREE.Vector3(1, 2, 3));
    
    // Save the current position
    transform.savePreviousPosition();
    
    // Previous should now match current
    expect(transform.previousPosition).toEqual(new THREE.Vector3(4, 5, 6));
    
    // Verify it's a copy, not a reference
    transform.position.set(7, 8, 9);
    expect(transform.previousPosition).toEqual(new THREE.Vector3(4, 5, 6));
  });
});