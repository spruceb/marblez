import { CameraSystem } from '../../../src/systems/CameraSystem';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Camera } from '../../../src/components/Camera';
import { MarbleTag } from '../../../src/components/Tags';
import { MockInputManager } from '../../__mocks__/InputManager';
import { InputSystem } from '../../../src/systems/InputSystem';
import * as THREE from 'three';

describe('CameraSystem', () => {
  let world: World;
  let threeCamera: THREE.Camera;
  let cameraSystem: CameraSystem;
  
  beforeEach(() => {
    world = new World();
    threeCamera = new THREE.PerspectiveCamera();
    cameraSystem = new CameraSystem(world, threeCamera);
  });
  
  test('should require Transform and Camera components', () => {
    expect(cameraSystem.requiredComponents).toContain(Transform);
    expect(cameraSystem.requiredComponents).toContain(Camera);
  });
  
  test('should update camera position based on entity', () => {
    // Create entity with transform and camera
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(10, 5, 15));
    const cameraComponent = new Camera();
    
    // Set camera parameters
    cameraComponent.distance = 20;
    cameraComponent.height = 10;
    cameraComponent.angle = 0; // Camera directly behind
    
    entity.addComponent(transform);
    entity.addComponent(cameraComponent);
    
    // Run camera system
    cameraSystem.update(1.0);
    
    // Check camera position (should be behind entity)
    expect(threeCamera.position.x).toBe(10);  // Same X as entity
    expect(threeCamera.position.y).toBe(15);  // Entity y + height
    expect(threeCamera.position.z).toBe(35);  // Entity z + distance
  });
  
  test('should orbit camera based on angle', () => {
    // Create entity with transform and camera
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(0, 0, 0));
    const cameraComponent = new Camera();
    
    // Set camera parameters
    cameraComponent.distance = 10;
    cameraComponent.height = 5;
    cameraComponent.angle = Math.PI / 2; // 90 degrees to the right
    
    entity.addComponent(transform);
    entity.addComponent(cameraComponent);
    
    // Run camera system
    cameraSystem.update(1.0);
    
    // Check camera position (should be to the right)
    expect(threeCamera.position.x).toBeCloseTo(10); // distance * sin(90°)
    expect(threeCamera.position.y).toBe(5);         // height
    expect(threeCamera.position.z).toBeCloseTo(0);  // distance * cos(90°)
  });
  
  test('should prioritize entities with MarbleTag', () => {
    // Create regular camera entity
    const regularEntity = world.createEntity();
    const regularTransform = new Transform(new THREE.Vector3(5, 5, 5));
    const regularCamera = new Camera();
    regularCamera.distance = 10;
    
    regularEntity.addComponent(regularTransform);
    regularEntity.addComponent(regularCamera);
    
    // Create marble entity
    const marbleEntity = world.createEntity();
    const marbleTransform = new Transform(new THREE.Vector3(20, 0, 20));
    const marbleCamera = new Camera();
    marbleCamera.distance = 15;
    
    marbleEntity.addComponent(marbleTransform);
    marbleEntity.addComponent(marbleCamera);
    marbleEntity.addComponent(new MarbleTag());
    
    // Run camera system
    cameraSystem.update(1.0);
    
    // Camera should follow marble entity, not regular entity
    expect(threeCamera.position.x).toBe(20);                  // Same X as marble
    expect(threeCamera.position.y).toBe(marbleCamera.height); // Marble height
    expect(threeCamera.position.z).toBe(35);                  // Marble z + distance
  });
  
  test('should update camera angle based on input', () => {
    // Create marble with camera component
    const entity = world.createEntity();
    const transform = new Transform();
    const cameraComponent = new Camera();
    
    // Set rotation speed
    cameraComponent.rotationSpeed = 0.1;
    cameraComponent.angle = 0;
    
    entity.addComponent(transform);
    entity.addComponent(cameraComponent);
    entity.addComponent(new MarbleTag());
    
    // Add input system with mock input manager
    const inputManager = new MockInputManager();
    const inputSystem = new InputSystem(world, inputManager as any);
    world.addSystem(inputSystem);
    
    // Simulate 'e' key press (rotate right)
    inputManager.simulateKeyDown('e');
    
    // Run camera system
    cameraSystem.update(1.0);
    
    // Camera angle should be updated
    expect(cameraComponent.angle).toBeCloseTo(0.1); // Initial + rotationSpeed
    
    // Test 'q' key (rotate left)
    inputManager.simulateKeyUp('e');
    inputManager.simulateKeyDown('q');
    
    // Run camera system again
    cameraSystem.update(1.0);
    
    // Angle should decrease
    expect(cameraComponent.angle).toBeCloseTo(0); // 0.1 - 0.1
  });
});