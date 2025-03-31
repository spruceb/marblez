import { MarbleFactory } from '../../../src/factories/MarbleFactory';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import { Render } from '../../../src/components/Render';
import { Collider } from '../../../src/components/Collider';
import { Jump } from '../../../src/components/Jump';
import { PlayerControl } from '../../../src/components/PlayerControl';
import { Camera } from '../../../src/components/Camera';
import { MarbleTag } from '../../../src/components/Tags';
import * as THREE from 'three';
import { OBJECTS } from '../../../src/utils/Constants';

describe('MarbleFactory', () => {
  let world: World;
  
  beforeEach(() => {
    world = new World();
  });
  
  test('should create marble with default parameters', () => {
    const marble = MarbleFactory.create(world);
    
    // Check entity creation
    expect(marble).toBeDefined();
    expect(marble.id).toBe(1);
    
    // Check components
    expect(marble.hasComponent(Transform)).toBe(true);
    expect(marble.hasComponent(Physics)).toBe(true);
    expect(marble.hasComponent(Render)).toBe(true);
    expect(marble.hasComponent(Collider)).toBe(true);
    expect(marble.hasComponent(Jump)).toBe(true);
    expect(marble.hasComponent(PlayerControl)).toBe(true);
    expect(marble.hasComponent(Camera)).toBe(true);
    expect(marble.hasComponent(MarbleTag)).toBe(true);
    
    // Check component configurations
    const transform = marble.getComponent(Transform)!;
    expect(transform.position.y).toBe(OBJECTS.MARBLE_RADIUS);
    
    const collider = marble.getComponent(Collider)!;
    expect(collider.type).toBe('sphere');
    expect(collider.params.radius).toBe(OBJECTS.MARBLE_RADIUS);
    
    const render = marble.getComponent(Render)!;
    expect(render.mesh).toBeDefined();
    expect(render.visible).toBe(true);
  });
  
  test('should create marble at specified position', () => {
    const position = new THREE.Vector3(10, 5, -10);
    const marble = MarbleFactory.create(world, position);
    
    const transform = marble.getComponent(Transform)!;
    expect(transform.position.x).toBe(10);
    expect(transform.position.y).toBe(5);
    expect(transform.position.z).toBe(-10);
  });
  
  test('should create marble with custom radius and color', () => {
    const position = new THREE.Vector3(0, 2, 0);
    const radius = 2;
    const color = 0xFF0000; // Red
    
    const marble = MarbleFactory.create(world, position, radius, color);
    
    const collider = marble.getComponent(Collider)!;
    expect(collider.params.radius).toBe(2);
    
    const render = marble.getComponent(Render)!;
    const material = render.mesh.material as THREE.MeshPhysicalMaterial;
    expect(material.color).toBe(color);
  });
});