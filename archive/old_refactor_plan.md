# Marble Game Refactoring Plan: Entity Component System Approach

## Current Issues

1. **Monolithic Structure:** The entire game is contained in a single `main.js` file that has grown to almost 900 lines of code.
2. **Poor Separation of Concerns:** Game logic, rendering, input handling, and physics are all intermixed.
3. **Difficult Maintenance:** Adding new features is becoming challenging due to the tightly coupled code.
4. **Limited Extensibility:** The current structure doesn't facilitate easy addition of new game elements.
5. **Context Management:** Working with the large file is causing context limitations in AI assistance.

## Refactoring Goals

1. **Modular Design:** Split the code into logical, self-contained modules using an ECS architecture.
2. **Improved Readability:** Make the codebase easier to understand and navigate.
3. **Enhanced Maintainability:** Simplify the process of fixing bugs and adding features.
4. **Scalability:** Create a structure that supports the planned future expansions.
5. **Performance Optimization:** Ensure the game runs efficiently with a proper architecture.

## Selected Approach: Entity Component System (ECS)

After evaluating different architectural patterns, we've selected the Entity Component System (ECS) approach for our refactoring effort. ECS provides a clean separation of data and behavior that will make our game more maintainable and extensible.

### Why ECS Is Right for This Project

1. **Composition Over Inheritance:** ECS allows us to build game objects (like obstacles) by combining simple components rather than through complex inheritance hierarchies.
2. **Clear Separation of Concerns:** Systems contain focused logic that operates on specific component combinations, making code easier to understand and debug.
3. **Extensibility:** Adding new game features simply means adding new components and systems without modifying existing code.
4. **Performance Potential:** As the game grows, ECS's data-oriented approach will allow for better memory layout and potential performance optimizations.
5. **Future-Proofing:** The architecture scales well for more complex features we plan to add (power-ups, multiple levels, etc.).

## Implementation Plan

### 1. File Structure

```
game-test/
├── index.html
├── package.json
├── src/
│   ├── main.js              # Entry point, engine initialization
│   ├── engine/
│   │   ├── ecs/
│   │   │   ├── Entity.js        # Entity management
│   │   │   ├── Component.js     # Component base functionality
│   │   │   ├── System.js        # System base class
│   │   │   └── World.js         # Main ECS container
│   │   ├── Renderer.js      # Three.js renderer setup
│   │   └── InputManager.js  # Handle keyboard and other input
│   ├── components/
│   │   ├── Transform.js     # Position, rotation, scale
│   │   ├── Physics.js       # Velocity, mass, forces
│   │   ├── Render.js        # Visual representation
│   │   ├── Collider.js      # Collision shapes and properties
│   │   ├── PlayerControl.js # Player input and control
│   │   ├── Surface.js       # Surface properties
│   │   ├── Jump.js          # Jump state and mechanics
│   │   └── Camera.js        # Camera follow properties
│   ├── systems/
│   │   ├── RenderSystem.js      # Handles rendering
│   │   ├── InputSystem.js       # Processes input
│   │   ├── PhysicsSystem.js     # Updates positions and physics
│   │   ├── CollisionSystem.js   # Detects and resolves collisions
│   │   ├── CameraSystem.js      # Controls camera movement
│   │   ├── JumpSystem.js        # Handles jumping logic
│   │   └── DebugSystem.js       # Displays debug information
│   ├── factories/
│   │   ├── EntityFactory.js     # General entity creation helpers
│   │   ├── MarbleFactory.js     # Creates player marble
│   │   ├── PlatformFactory.js   # Creates platforms
│   │   └── ObstacleFactory.js   # Creates various obstacles
│   ├── utils/
│   │   ├── TextureGenerator.js  # Canvas-based texture creation
│   │   ├── MathUtils.js         # Math helper functions
│   │   └── Constants.js         # Game constants and configuration
│   └── levels/
│       ├── LevelLoader.js       # Loads level definitions
│       └── Level1.js            # Initial level definition
└── assets/                      # Future asset directory
```

### 2. Core ECS Implementation

#### Entity

Entities are simple identifiers with component collections:

```javascript
// Entity.js
export class Entity {
  constructor(id) {
    this.id = id;
    this.components = new Map();
  }

  addComponent(component) {
    this.components.set(component.constructor.name, component);
    return this;
  }

  removeComponent(componentClass) {
    this.components.delete(componentClass.name);
    return this;
  }

  getComponent(componentClass) {
    return this.components.get(componentClass.name);
  }

  hasComponent(componentClass) {
    return this.components.has(componentClass.name);
  }
}
```

#### Component

Components are pure data containers:

```javascript
// Component.js - Base class for type checking
export class Component {
  constructor() {
    if (this.constructor === Component) {
      throw new Error("Component is an abstract class and cannot be instantiated directly");
    }
  }
}

// Example Component: Transform.js
import { Component } from '../engine/ecs/Component';
import { Vector3 } from 'three';

export class Transform extends Component {
  constructor(position = new Vector3(), rotation = new Vector3(), scale = new Vector3(1, 1, 1)) {
    super();
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
}
```

#### System

Systems process entities with specific component combinations:

```javascript
// System.js
export class System {
  constructor(world) {
    this.world = world;
    this.requiredComponents = [];
    
    if (this.constructor === System) {
      throw new Error("System is an abstract class and cannot be instantiated directly");
    }
  }

  update(deltaTime) {
    // Override in derived classes
  }

  getEntities() {
    return this.world.getEntitiesWithComponents(this.requiredComponents);
  }
}

// Example System: PhysicsSystem.js
import { System } from '../engine/ecs/System';
import { Transform } from '../components/Transform';
import { Physics } from '../components/Physics';

export class PhysicsSystem extends System {
  constructor(world) {
    super(world);
    this.requiredComponents = [Transform, Physics];
  }

  update(deltaTime) {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      const physics = entity.getComponent(Physics);
      
      // Apply gravity
      physics.velocity.y -= physics.gravity * deltaTime;
      
      // Update position based on velocity
      transform.position.x += physics.velocity.x * deltaTime;
      transform.position.y += physics.velocity.y * deltaTime;
      transform.position.z += physics.velocity.z * deltaTime;
      
      // Apply friction
      if (physics.isOnGround) {
        physics.velocity.x *= physics.friction;
        physics.velocity.z *= physics.friction;
      } else {
        physics.velocity.x *= physics.airFriction;
        physics.velocity.z *= physics.airFriction;
      }
    }
  }
}
```

#### World

The World manages entities and systems:

```javascript
// World.js
export class World {
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.nextEntityId = 1;
  }

  createEntity() {
    const entity = new Entity(this.nextEntityId++);
    this.entities.set(entity.id, entity);
    return entity;
  }

  removeEntity(entity) {
    this.entities.delete(entity.id);
  }

  addSystem(system) {
    this.systems.push(system);
    return this;
  }

  update(deltaTime) {
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }

  getEntitiesWithComponents(componentClasses) {
    const result = [];
    
    for (const entity of this.entities.values()) {
      let hasAllComponents = true;
      
      for (const componentClass of componentClasses) {
        if (!entity.hasComponent(componentClass)) {
          hasAllComponents = false;
          break;
        }
      }
      
      if (hasAllComponents) {
        result.push(entity);
      }
    }
    
    return result;
  }
}
```

### 3. Key Components for the Marble Game

1. **Transform Component**: Position, rotation, and scale
   ```javascript
   // Already shown above
   ```

2. **Physics Component**: Velocity, mass, and physics properties
   ```javascript
   export class Physics extends Component {
     constructor(mass = 1, gravity = 0.015) {
       super();
       this.velocity = new Vector3(0, 0, 0);
       this.mass = mass;
       this.gravity = gravity;
       this.friction = 0.97;
       this.airFriction = 0.99;
       this.isOnGround = true;
     }
   }
   ```

3. **Render Component**: Visual representation with Three.js
   ```javascript
   export class Render extends Component {
     constructor(mesh) {
       super();
       this.mesh = mesh;
       this.visible = true;
     }
   }
   ```

4. **Collider Component**: Collision detection properties
   ```javascript
   export class Collider extends Component {
     constructor(type, params = {}) {
       super();
       this.type = type; // "sphere", "box", "torus"
       this.params = params; // radius, width/height/depth, etc.
       this.isTrigger = false; // Does it just detect or also block?
       this.bounce = 0.3; // Bounciness factor
     }
   }
   ```

5. **Jump Component**: Jumping state and properties
   ```javascript
   export class Jump extends Component {
     constructor(jumpPower = 0.4) {
       super();
       this.jumpPower = jumpPower;
       this.isJumping = false;
       this.isFalling = false;
       this.isOnSurface = true;
     }
   }
   ```

6. **PlayerControl Component**: Player input mapping
   ```javascript
   export class PlayerControl extends Component {
     constructor(speed = 0.005) {
       super();
       this.speed = speed;
       this.airControlFactor = 0.3;
       this.keys = {};
     }
   }
   ```

7. **Camera Component**: Camera properties
   ```javascript
   export class Camera extends Component {
     constructor(offset = new Vector3(0, 15, 25), rotationSpeed = 0.05) {
       super();
       this.offset = offset;
       this.rotationSpeed = rotationSpeed;
       this.angle = 0;
       this.lerpFactor = 0.01;
     }
   }
   ```

8. **Surface Component**: For platforms and obstacles
   ```javascript
   export class Surface extends Component {
     constructor(friction = 0.97) {
       super();
       this.friction = friction;
       this.isJumpable = true;
       this.isRamp = false;
       this.rampAngle = 0;
     }
   }
   ```

9. **Tag Components**: Simple markers for categorization
   ```javascript
   export class MarbleTag extends Component {}
   export class PlatformTag extends Component {}
   export class ObstacleTag extends Component {}
   export class RampTag extends Component {}
   export class RingTag extends Component {}
   ```

### 4. Key Systems for the Marble Game

1. **Input System**: Processes player input
   ```javascript
   export class InputSystem extends System {
     constructor(world) {
       super(world);
       this.requiredComponents = [PlayerControl];
       
       // Set up event listeners
       window.addEventListener('keydown', this.handleKeyDown.bind(this));
       window.addEventListener('keyup', this.handleKeyUp.bind(this));
     }
     
     handleKeyDown(e) {
       const entities = this.getEntities();
       for (const entity of entities) {
         const control = entity.getComponent(PlayerControl);
         control.keys[e.key] = true;
       }
     }
     
     handleKeyUp(e) {
       const entities = this.getEntities();
       for (const entity of entities) {
         const control = entity.getComponent(PlayerControl);
         control.keys[e.key] = false;
       }
     }
     
     update(deltaTime) {
       // Nothing to do in update, input is handled by event listeners
     }
   }
   ```

2. **Jump System**: Handles jumping logic
   ```javascript
   export class JumpSystem extends System {
     constructor(world) {
       super(world);
       this.requiredComponents = [Jump, Transform, Physics, PlayerControl];
     }
     
     update(deltaTime) {
       const entities = this.getEntities();
       
       for (const entity of entities) {
         const jump = entity.getComponent(Jump);
         const transform = entity.getComponent(Transform);
         const physics = entity.getComponent(Physics);
         const control = entity.getComponent(PlayerControl);
         
         // Handle jump input
         if (control.keys[' '] && jump.isOnSurface && !jump.isJumping) {
           console.log('JUMPING!');
           jump.isJumping = true;
           jump.isOnSurface = false;
           physics.velocity.y = jump.jumpPower;
           transform.position.y += 0.05; // Small boost to prevent immediate ground detection
         }
         
         // Handle jump states
         if (jump.isJumping && physics.velocity.y < 0) {
           jump.isJumping = false;
           jump.isFalling = true;
         }
       }
     }
   }
   ```

3. **Physics System**: Updates positions based on velocities
   ```javascript
   // Already shown above
   ```

4. **Collision System**: Detects and resolves collisions
   ```javascript
   export class CollisionSystem extends System {
     constructor(world) {
       super(world);
       this.requiredComponents = [Transform, Collider];
     }
     
     update(deltaTime) {
       const entities = this.getEntities();
       
       // Store marble entities (usually just one) for collision checking
       const marbles = this.world.getEntitiesWithComponents([MarbleTag, Transform, Collider, Physics, Jump]);
       
       // For each marble, check collisions with all other entities
       for (const marble of marbles) {
         const marbleTransform = marble.getComponent(Transform);
         const marbleCollider = marble.getComponent(Collider);
         const marblePhysics = marble.getComponent(Physics);
         const marbleJump = marble.getComponent(Jump);
         
         // Store previous position for collision resolution
         const prevPosition = marbleTransform.position.clone();
         
         // Reset surface detection - will be set to true if any collision detected
         marbleJump.isOnSurface = false;
         
         // Check collision with each entity
         for (const entity of entities) {
           // Skip collision with self
           if (entity.id === marble.id) continue;
           
           const entityTransform = entity.getComponent(Transform);
           const entityCollider = entity.getComponent(Collider);
           
           // Check collision based on collider types
           if (this.checkCollision(marbleTransform, marbleCollider, entityTransform, entityCollider)) {
             // Handle collision response
             this.resolveCollision(
               marble, marbleTransform, marbleCollider, marblePhysics, marbleJump,
               entity, entityTransform, entityCollider, prevPosition
             );
           }
         }
         
         // Check main platform collision
         this.checkPlatformCollision(marble, marbleTransform, marblePhysics, marbleJump);
       }
     }
     
     checkCollision(transformA, colliderA, transformB, colliderB) {
       // Collision detection logic based on collider types
       // (sphere-box, sphere-sphere, sphere-torus, etc.)
       // ...
     }
     
     resolveCollision(marbleEntity, marbleTransform, marbleCollider, marblePhysics, marbleJump,
                     otherEntity, otherTransform, otherCollider, prevPosition) {
       // Collision resolution logic
       // ...
     }
     
     checkPlatformCollision(marbleEntity, marbleTransform, marblePhysics, marbleJump) {
       // Main platform collision logic
       // ...
     }
   }
   ```

5. **Render System**: Updates meshes for rendering
   ```javascript
   export class RenderSystem extends System {
     constructor(world, scene) {
       super(world);
       this.requiredComponents = [Transform, Render];
       this.scene = scene;
     }
     
     update(deltaTime) {
       const entities = this.getEntities();
       
       for (const entity of entities) {
         const transform = entity.getComponent(Transform);
         const render = entity.getComponent(Render);
         
         if (render.visible) {
           // Update mesh position and rotation
           render.mesh.position.copy(transform.position);
           render.mesh.rotation.copy(transform.rotation);
           
           // Add to scene if not already added
           if (render.mesh.parent !== this.scene) {
             this.scene.add(render.mesh);
           }
         }
       }
     }
   }
   ```

6. **Camera System**: Updates camera position
   ```javascript
   export class CameraSystem extends System {
     constructor(world, camera) {
       super(world);
       this.requiredComponents = [Transform, Camera, MarbleTag];
       this.camera = camera;
     }
     
     update(deltaTime) {
       const entities = this.getEntities();
       
       // Should only be one entity with Camera + MarbleTag
       for (const entity of entities) {
         const transform = entity.getComponent(Transform);
         const cameraComponent = entity.getComponent(Camera);
         const playerControl = entity.getComponent(PlayerControl);
         
         // Update camera angle based on input
         if (playerControl.keys['q']) {
           cameraComponent.angle -= cameraComponent.rotationSpeed;
         }
         if (playerControl.keys['e']) {
           cameraComponent.angle += cameraComponent.rotationSpeed;
         }
         
         // Calculate camera position in orbit around marble
         const offsetX = Math.sin(cameraComponent.angle) * cameraComponent.offset.z;
         const offsetZ = Math.cos(cameraComponent.angle) * cameraComponent.offset.z;
         
         // Update camera position
         this.camera.position.x = transform.position.x + offsetX;
         this.camera.position.y = transform.position.y + cameraComponent.offset.y;
         this.camera.position.z = transform.position.z + offsetZ;
         
         // Look at marble
         this.camera.lookAt(transform.position);
       }
     }
   }
   ```

7. **Debug System**: Updates debug display
   ```javascript
   export class DebugSystem extends System {
     constructor(world, debugElement) {
       super(world);
       this.requiredComponents = [Physics, Jump, MarbleTag];
       this.debugElement = debugElement;
     }
     
     update(deltaTime) {
       const entities = this.getEntities();
       
       // Only one marble entity expected
       for (const entity of entities) {
         const transform = entity.getComponent(Transform);
         const physics = entity.getComponent(Physics);
         const jump = entity.getComponent(Jump);
         
         // Update debug info
         this.debugElement.innerHTML = `
           isOnSurface: ${jump.isOnSurface} <br>
           isJumping: ${jump.isJumping} <br>
           isFalling: ${jump.isFalling} <br>
           Position: ${transform.position.x.toFixed(2)}, ${transform.position.y.toFixed(2)}, ${transform.position.z.toFixed(2)} <br>
           Velocity: ${physics.velocity.x.toFixed(2)}, ${physics.velocity.y.toFixed(2)}, ${physics.velocity.z.toFixed(2)}
         `;
       }
     }
   }
   ```

### 5. Entity Factories

Entity factories will help create complex entities with appropriate components:

1. **Marble Factory**
   ```javascript
   export class MarbleFactory {
     static create(world, position) {
       // Create marble mesh
       const marbleGeometry = new THREE.SphereGeometry(MARBLE_RADIUS, 32, 32);
       const marbleMaterial = createMarbleMaterial(); // Custom function to create material
       const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);
       marbleMesh.castShadow = true;
       marbleMesh.receiveShadow = true;
       
       // Create entity and add components
       const marble = world.createEntity()
         .addComponent(new Transform(position))
         .addComponent(new Physics(1, GRAVITY))
         .addComponent(new Render(marbleMesh))
         .addComponent(new Collider('sphere', { radius: MARBLE_RADIUS }))
         .addComponent(new Jump(JUMP_POWER))
         .addComponent(new PlayerControl(MARBLE_SPEED))
         .addComponent(new Camera(new Vector3(0, 15, 25), 0.05))
         .addComponent(new MarbleTag());
       
       return marble;
     }
   }
   ```

2. **Platform Factory**
   ```javascript
   export class PlatformFactory {
     static createMainPlatform(world, size) {
       // Create platform mesh
       const geometry = new THREE.PlaneGeometry(size * 2, size * 2, 32, 32);
       const material = createGrassMaterial(); // Custom function for material
       const mesh = new THREE.Mesh(geometry, material);
       mesh.rotation.x = -Math.PI / 2;
       mesh.receiveShadow = true;
       
       // Create entity and add components
       const platform = world.createEntity()
         .addComponent(new Transform(new Vector3(0, 0, 0)))
         .addComponent(new Render(mesh))
         .addComponent(new Collider('box', { width: size * 2, height: 0.1, depth: size * 2 }))
         .addComponent(new Surface())
         .addComponent(new PlatformTag());
       
       return platform;
     }
     
     static createJumpPlatform(world, position, size) {
       // Create jump platform mesh and entity
       // ...
     }
   }
   ```

3. **Obstacle Factory**
   ```javascript
   export class ObstacleFactory {
     static createRamp(world, position, size, height, angle) {
       // Create ramp mesh and entity
       // ...
     }
     
     static createWall(world, position, width, height, depth) {
       // Create wall mesh and entity
       // ...
     }
     
     static createRing(world, position, radius, thickness) {
       // Create ring mesh and entity
       // ...
     }
   }
   ```

### 6. Main Game Loop

The main entry point will initialize the ECS world and systems:

```javascript
// main.js
import * as THREE from 'three';
import { World } from './engine/ecs/World';
import { RenderSystem } from './systems/RenderSystem';
import { InputSystem } from './systems/InputSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { JumpSystem } from './systems/JumpSystem';
import { CameraSystem } from './systems/CameraSystem';
import { DebugSystem } from './systems/DebugSystem';
import { MarbleFactory } from './factories/MarbleFactory';
import { PlatformFactory } from './factories/PlatformFactory';
import { ObstacleFactory } from './factories/ObstacleFactory';

// Initialize Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  powerPreference: "high-performance" 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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

// Initialize ECS world
const world = new World();

// Add systems
world.addSystem(new InputSystem(world));
world.addSystem(new JumpSystem(world));
world.addSystem(new PhysicsSystem(world));
world.addSystem(new CollisionSystem(world));
world.addSystem(new CameraSystem(world, camera));
world.addSystem(new RenderSystem(world, scene));
world.addSystem(new DebugSystem(world, debugDisplay));

// Create entities
const PLATFORM_SIZE = 100;
const marble = MarbleFactory.create(world, new THREE.Vector3(0, 0.8, 0));
const platform = PlatformFactory.createMainPlatform(world, PLATFORM_SIZE);

// Create obstacles
const ramp = ObstacleFactory.createRamp(world, new THREE.Vector3(-50, 0, 0), 15, 5, Math.PI * 0.08);
// Create other obstacles (walls, jump platforms, ring)...

// Game loop
let lastTime = 0;
function animate(time) {
  const deltaTime = (time - lastTime) / 1000; // Convert to seconds
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
```

## Migration Strategy

To minimize risk and ensure a smooth transition to the ECS architecture, we'll follow this step-by-step migration plan with detailed time estimates:

### Phase 1: Setup Project Structure and Core ECS (2-3 days)
1. Create directory structure (2 hours)
2. Implement base ECS classes (8-10 hours)
   - Entity class with component management
   - Component base class
   - System base class
   - World manager class
3. Setup Three.js initialization (3-4 hours)
   - Scene, renderer, and camera setup
   - Basic lighting configuration
   - Window resize handling
4. Create utility and helper functions (3-4 hours)
   - Vector and math utilities
   - Constants and configuration
   - Debug helpers

### Phase 2: Basic Marble Movement (2-3 days)
1. Implement core components (6-8 hours)
   - Transform component
   - Physics component
   - Render component
2. Create fundamental systems (6-8 hours)
   - PhysicsSystem for basic movement
   - RenderSystem for visualization
3. Implement input handling (4-5 hours)
   - InputSystem
   - PlayerControl component
   - Keyboard event management
4. Create basic entities (4-6 hours)
   - MarbleFactory
   - Simple ground platform
5. Establish game loop with simple marble movement (3-4 hours)
   - Main animation loop
   - System execution order
   - Basic physics simulation

### Phase 3: Jumping and Collision (3-4 days)
1. Implement jumping mechanics (6-8 hours)
   - Jump component
   - JumpSystem
   - State management (grounded, jumping, falling)
2. Create collision components (4-6 hours)
   - Collider component with different types
   - Collision detection helpers
3. Implement CollisionSystem (8-10 hours)
   - Detection algorithms for different shapes
   - Collision response physics
   - Resolution and bounce mechanics
4. Handle ground detection (4-6 hours)
   - Surface detection logic
   - Ground friction and response
5. Add camera follow functionality (4-5 hours)
   - Camera component
   - CameraSystem
   - Orbital movement and rotation

### Phase 4: Platforms and Obstacles (3-5 days)
1. Implement obstacle-specific components (4-6 hours)
   - Surface component
   - Tag components for different obstacle types
2. Create factory classes (6-8 hours)
   - PlatformFactory for various platforms
   - ObstacleFactory for obstacles
   - Material and mesh generation
3. Implement specialized collider types (8-10 hours)
   - Box colliders
   - Sphere colliders
   - Torus/ring colliders
   - Ramp colliders with special physics
4. Add all obstacle types (8-10 hours)
   - Ramps with sliding mechanics
   - Walls and barriers
   - Jump platforms
   - Rings to jump through
5. Finalize collision response physics (6-8 hours)
   - Fine-tune bounce coefficients
   - Improve friction model
   - Add specialized collision responses

### Phase 5: Polishing and Optimization (2-3 days)
1. Implement DebugSystem (3-4 hours)
   - Visual state display
   - Performance monitoring
   - Debug controls
2. Add texture generation utilities (4-6 hours)
   - Canvas-based texture creation
   - Material configuration
   - Visual enhancements
3. Fine-tune physics parameters (4-6 hours)
   - Adjust gravity, friction, bounce
   - Balance movement speed and controls
   - Improve jump feel and response
4. Optimize performance (4-6 hours)
   - Profiling and bottleneck identification
   - System execution optimization
   - Component data layout improvements
5. Add visual enhancements (4-5 hours)
   - Improved lighting
   - Visual effects
   - Polish and finishing touches

## Total Estimated Time
- **Phase 1**: 2-3 days (16-21 hours)
- **Phase 2**: 2-3 days (23-31 hours)
- **Phase 3**: 3-4 days (26-35 hours)
- **Phase 4**: 3-5 days (32-42 hours)
- **Phase 5**: 2-3 days (19-27 hours)

**Total**: 12-18 days (116-156 hours) of development time

This estimate assumes focused development time and familiarity with JavaScript, Three.js, and game development concepts. The actual time may vary based on the complexity of implementations and unforeseen challenges. We've built in some buffer time to account for debugging and refinement at each phase.

## Future Extension Points

The ECS architecture provides clear extension points for future features:

1. **Power-ups**: Create PowerUp components and systems
   ```javascript
   export class PowerUp extends Component {
     constructor(type, duration) {
       super();
       this.type = type; // "speed", "jump", "gravity", etc.
       this.duration = duration;
       this.active = false;
       this.timeRemaining = 0;
     }
   }
   
   export class PowerUpSystem extends System {
     update(deltaTime) {
       // Process active power-ups
     }
   }
   ```

2. **Level System**: Create level components and loading system
   ```javascript
   export class Level extends Component {
     constructor(levelData) {
       super();
       this.data = levelData;
       this.completed = false;
       this.timeLimit = levelData.timeLimit;
       this.timeRemaining = this.timeLimit;
     }
   }
   
   export class LevelSystem extends System {
     update(deltaTime) {
       // Handle level completion, timing, etc.
     }
   }
   ```

3. **Particles and Effects**: Add particle system
   ```javascript
   export class ParticleEmitter extends Component {
     constructor(type, rate, lifetime) {
       super();
       this.type = type;
       this.rate = rate;
       this.lifetime = lifetime;
     }
   }
   
   export class ParticleSystem extends System {
     update(deltaTime) {
       // Create and update particles
     }
   }
   ```

4. **Multiplayer**: Add network components
   ```javascript
   export class NetworkIdentity extends Component {
     constructor(playerId) {
       super();
       this.playerId = playerId;
       this.isLocal = false;
     }
   }
   
   export class NetworkSystem extends System {
     update(deltaTime) {
       // Sync entity states over network
     }
   }
   ```

## Benefits of the ECS Approach

1. **Clear Organization**: Each piece of functionality is isolated in specific components and systems.
2. **Easier Debugging**: When something goes wrong, it's clear which system is responsible.
3. **Efficient Iteration**: New features can be added by creating new components and systems without modifying existing code.
4. **Better Performance**: ECS architecture allows for cache-friendly data layouts and efficient processing.
5. **Maintainable Codebase**: Smaller, focused modules are easier to understand and modify.

## Conclusion

Refactoring our marble game to use an Entity Component System architecture will transform it from a monolithic script into a well-organized, extensible codebase. The ECS pattern provides a clear separation of data (components) and behavior (systems) that will make the code more maintainable and easier to expand with new features.

The migration strategy outlined above allows us to incrementally implement the ECS architecture while maintaining a working game throughout the process. Each phase builds on the previous one, gradually introducing more sophisticated functionality.

With this architecture in place, we'll be well-positioned to add the planned features and enhancements to the game in a structured and maintainable way.