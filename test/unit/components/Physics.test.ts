import { Physics } from '../../../src/components/Physics';
import { Component } from '../../../src/engine/ecs/Component';
import * as THREE from 'three';
import { PHYSICS } from '../../../src/utils/Constants';

describe('Physics Component', () => {
  test('should extend Component', () => {
    const physics = new Physics();
    expect(physics).toBeInstanceOf(Component);
    expect(physics).toBeInstanceOf(Physics);
  });
  
  test('should initialize with default values', () => {
    const physics = new Physics();
    
    expect(physics.velocity).toBeInstanceOf(THREE.Vector3);
    expect(physics.velocity).toEqual(new THREE.Vector3(0, 0, 0));
    
    expect(physics.mass).toBe(1);
    expect(physics.gravity).toBe(PHYSICS.GRAVITY);
    expect(physics.friction).toBe(PHYSICS.GROUND_FRICTION);
    expect(physics.airFriction).toBe(PHYSICS.AIR_FRICTION);
    expect(physics.bounceCoefficient).toBe(PHYSICS.BOUNCE_COEFFICIENT);
    
    expect(physics.isOnGround).toBe(false);
    expect(physics.isStatic).toBe(false);
  });
  
  test('should initialize with custom mass and gravity', () => {
    const physics = new Physics(2, 0.05);
    
    expect(physics.mass).toBe(2);
    expect(physics.gravity).toBe(0.05);
    
    // Other properties should still be default
    expect(physics.velocity).toEqual(new THREE.Vector3(0, 0, 0));
    expect(physics.friction).toBe(PHYSICS.GROUND_FRICTION);
  });
  
  test('should allow setting velocity', () => {
    const physics = new Physics();
    
    physics.velocity.set(1, 2, 3);
    
    expect(physics.velocity.x).toBe(1);
    expect(physics.velocity.y).toBe(2);
    expect(physics.velocity.z).toBe(3);
  });
  
  test('should toggle isOnGround state', () => {
    const physics = new Physics();
    expect(physics.isOnGround).toBe(false);
    
    physics.isOnGround = true;
    expect(physics.isOnGround).toBe(true);
  });
  
  test('should toggle isStatic state', () => {
    const physics = new Physics();
    expect(physics.isStatic).toBe(false);
    
    physics.isStatic = true;
    expect(physics.isStatic).toBe(true);
  });
});