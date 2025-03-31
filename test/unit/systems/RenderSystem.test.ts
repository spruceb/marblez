import { RenderSystem } from '../../../src/systems/RenderSystem';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Render } from '../../../src/components/Render';
import { Physics } from '../../../src/components/Physics';
import { Collider } from '../../../src/components/Collider';
import { MarbleTag } from '../../../src/components/Tags';
import * as THREE from 'three';

describe('RenderSystem', () => {
  let world: World;
  let scene: THREE.Scene;
  let renderSystem: RenderSystem;
  
  beforeEach(() => {
    world = new World();
    scene = new THREE.Scene();
    renderSystem = new RenderSystem(world, scene);
  });
  
  test('should require Transform and Render components', () => {
    expect(renderSystem.requiredComponents).toContain(Transform);
    expect(renderSystem.requiredComponents).toContain(Render);
  });
  
  test('should update mesh position from transform', () => {
    // Create entity with transform and render components
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(5, 10, 15));
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    const render = new Render(mesh);
    
    entity.addComponent(transform);
    entity.addComponent(render);
    
    // Run render system
    renderSystem.update(1.0);
    
    // Check mesh position
    expect(mesh.position.x).toBe(5);
    expect(mesh.position.y).toBe(10);
    expect(mesh.position.z).toBe(15);
  });
  
  test('should update mesh rotation from transform for regular objects', () => {
    // Create entity with transform and render components
    const entity = world.createEntity();
    const transform = new Transform();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    const render = new Render(mesh);
    
    // Set rotation
    transform.rotation.set(0.1, 0.2, 0.3);
    
    entity.addComponent(transform);
    entity.addComponent(render);
    
    // Run render system
    renderSystem.update(1.0);
    
    // Note: In our THREE.js mock, rotation is an Euler object
    // In the real THREE.js, Mesh.rotation is an Euler object with x, y, z properties
    // but without a set method. The renderSystem would set the values directly.
    expect(mesh.rotation.x).toBe(transform.rotation.x);
    expect(mesh.rotation.y).toBe(transform.rotation.y);
    expect(mesh.rotation.z).toBe(transform.rotation.z);
  });
  
  test('should apply rolling rotation for marble entities', () => {
    // Create marble entity
    const entity = world.createEntity();
    const transform = new Transform();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshStandardMaterial()
    );
    const render = new Render(mesh);
    const physics = new Physics();
    
    // Set velocity for rolling
    physics.velocity.set(2, 0, 3);
    
    entity.addComponent(transform);
    entity.addComponent(render);
    entity.addComponent(physics);
    entity.addComponent(new MarbleTag());
    entity.addComponent(new Collider('sphere', { radius: 1 }));
    
    // Initial rotation
    mesh.rotation.x = 0;
    mesh.rotation.y = 0;
    mesh.rotation.z = 0;
    
    // Run render system
    renderSystem.update(1.0);
    
    // Check rolling rotation (X axis roll from Z velocity, Z axis roll from X velocity)
    expect(mesh.rotation.x).toBeGreaterThan(0); // Positive Z velocity causes X rotation
    expect(mesh.rotation.z).toBeLessThan(0);    // Positive X velocity causes negative Z rotation
  });
  
  test('should add mesh to scene if not already added', () => {
    // Create entity with transform and render
    const entity = world.createEntity();
    const transform = new Transform();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    const render = new Render(mesh);
    
    // Spy on scene add method
    const addSpy = jest.spyOn(scene, 'add');
    
    entity.addComponent(transform);
    entity.addComponent(render);
    
    // Run render system
    renderSystem.update(1.0);
    
    // Check if mesh was added to scene
    expect(addSpy).toHaveBeenCalledWith(mesh);
    
    // Reset spy
    addSpy.mockClear();
    
    // Run render system again
    renderSystem.update(1.0);
    
    // Mesh should not be added again if already in scene
    expect(addSpy).not.toHaveBeenCalled();
  });
  
  test('should not add mesh to scene if not visible', () => {
    // Create entity with transform and render
    const entity = world.createEntity();
    const transform = new Transform();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    const render = new Render(mesh);
    
    // Set visible to false
    render.visible = false;
    
    // Spy on scene add method
    const addSpy = jest.spyOn(scene, 'add');
    
    entity.addComponent(transform);
    entity.addComponent(render);
    
    // Run render system
    renderSystem.update(1.0);
    
    // Mesh should not be added to scene
    expect(addSpy).not.toHaveBeenCalled();
  });
});