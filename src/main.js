import * as THREE from 'three';
import { World } from './engine/ecs/World.js';
import { InputManager } from './engine/InputManager.js';
import { initializeRenderer, setupLights } from './engine/Renderer.js';
import { 
  InputSystem,
  PhysicsSystem,
  CollisionSystem,
  RenderSystem,
  CameraSystem,
  JumpSystem,
  DebugSystem
} from './systems/index.js';
import {
  MarbleFactory,
  PlatformFactory,
  ObstacleFactory
} from './factories/index.js';
import { OBJECTS } from './utils/Constants.js';

// Initialize the renderer, scene, and camera
const { renderer, scene, camera } = initializeRenderer();

// Setup lights
setupLights(scene);

// Create debug display
const debugDisplay = document.createElement('div');
debugDisplay.style.position = 'absolute';
debugDisplay.style.top = '10px';
debugDisplay.style.left = '10px';
debugDisplay.style.color = 'white';
debugDisplay.style.fontFamily = 'monospace';
debugDisplay.style.fontSize = '14px';
debugDisplay.style.backgroundColor = 'rgba(0,0,0,0.5)';
debugDisplay.style.padding = '10px';
debugDisplay.style.zIndex = '1000';
document.body.appendChild(debugDisplay);

// Initialize input manager
const inputManager = new InputManager();

// Initialize ECS world
const world = new World();

// Add systems in the order they should execute
world.addSystem(new InputSystem(world, inputManager));
world.addSystem(new JumpSystem(world));
world.addSystem(new PhysicsSystem(world));
world.addSystem(new CollisionSystem(world));
world.addSystem(new CameraSystem(world, camera));
world.addSystem(new RenderSystem(world, scene));
world.addSystem(new DebugSystem(world, debugDisplay));

// Create marble entity
const marble = MarbleFactory.create(
  world, 
  new THREE.Vector3(0, OBJECTS.MARBLE_RADIUS, 0)
);

// Create main platform
const platform = PlatformFactory.createMainPlatform(world, OBJECTS.PLATFORM_SIZE);

// Create platform boundaries
const boundaries = PlatformFactory.createBoundaries(world, OBJECTS.PLATFORM_SIZE);

// Create ramp
const ramp = ObstacleFactory.createRamp(
  world,
  new THREE.Vector3(-50, 0, 0),
  OBJECTS.RAMP_SIZE,
  OBJECTS.RAMP_HEIGHT,
  OBJECTS.RAMP_ANGLE
);

// Create zigzag walls
ObstacleFactory.createZigzagWall(
  world,
  new THREE.Vector3(10, 0, 0),
  5,
  12
);

// Create jump platforms
for (let i = 0; i < 4; i++) {
  const platformSize = 8 - i;
  const platformHeight = 1 + i * 2;
  
  PlatformFactory.createJumpPlatform(
    world,
    new THREE.Vector3(-20, platformHeight, -30 + i * 10),
    platformSize,
    0.5
  );
}

// Create ring to jump through
ObstacleFactory.createRing(
  world,
  new THREE.Vector3(30, OBJECTS.RING_RADIUS + 1, -30),
  OBJECTS.RING_RADIUS,
  OBJECTS.RING_THICKNESS
);

// Game loop
let lastTime = 0;

function animate(time) {
  // Calculate delta time in seconds
  const deltaTime = Math.min((time - lastTime) / 1000, 0.1); // Cap at 100ms to prevent large jumps
  lastTime = time;
  
  // Update all systems
  world.update(deltaTime);
  
  // Render the scene
  renderer.render(scene, camera);
  
  // Request next frame
  requestAnimationFrame(animate);
}

// Start the game loop
animate(0);