# Marble Game System Architecture

This document provides a comprehensive overview of the system architecture, design principles, and extension guidelines for the Marble Game.

## Table of Contents

1. [Entity Component System Overview](#entity-component-system-overview)
2. [Core ECS Implementation](#core-ecs-implementation)
3. [Component Design](#component-design)
4. [System Design](#system-design)
5. [Game Loop and Execution Order](#game-loop-and-execution-order)
6. [Entity Factory Pattern](#entity-factory-pattern)
7. [Physics Implementation](#physics-implementation)
8. [Collision Detection](#collision-detection)
9. [Input Handling](#input-handling)
10. [Rendering Approach](#rendering-approach)
11. [Extension Guidelines](#extension-guidelines)
12. [Performance Considerations](#performance-considerations)
13. [Troubleshooting](#troubleshooting)

## Entity Component System Overview

Our game uses the Entity Component System (ECS) architecture, a pattern that focuses on composition over inheritance. This architecture is particularly well-suited for games because it:

- **Separates data (components) from behavior (systems)**, making the code easier to reason about
- **Enables fine-grained control** over which entities are processed by which systems
- **Supports flexible entity composition** without deep inheritance hierarchies
- **Facilitates modularity** and extension without modifying existing code
- **Can optimize performance** by processing similar components together

### Key Concepts

- **Entities** are simple containers (essentially just IDs) that aggregate components
- **Components** are pure data containers with no behavior or methods
- **Systems** contain all game logic and operate on entities with specific component combinations

## Core ECS Implementation

Our ECS framework consists of four core classes:

### Entity

```javascript
// Entity.js
export class Entity {
  constructor(id) {
    this.id = id;
    this.components = new Map();
  }

  addComponent(component) { ... }
  removeComponent(componentClass) { ... }
  getComponent(componentClass) { ... }
  hasComponent(componentClass) { ... }
}
```

Entities are essentially containers for components, identified by a unique ID. They provide methods to add, remove, and query components.

### Component

```javascript
// Component.js
export class Component {
  constructor() {
    // Abstract class check
    if (this.constructor === Component) {
      throw new Error("Component is an abstract class");
    }
  }
}
```

The Component base class serves primarily as a marker interface. All component classes derive from it, containing only data fields with no behavior.

### System

```javascript
// System.js
export class System {
  constructor(world) {
    this.world = world;
    this.requiredComponents = [];
    // Abstract class check
    if (this.constructor === System) {
      throw new Error("System is an abstract class");
    }
  }

  update(deltaTime) { ... }
  getEntities() { ... }
}
```

Systems implement game logic by operating on entities that have specific components. Each system specifies which components it requires and provides an update method that runs each frame.

### World

```javascript
// World.js
export class World {
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.nextEntityId = 1;
  }

  createEntity() { ... }
  removeEntity(entity) { ... }
  addSystem(system) { ... }
  update(deltaTime) { ... }
  getEntitiesWithComponents(componentClasses) { ... }
}
```

The World manages all entities and systems, serving as the central coordinator of the ECS architecture. It provides methods to create and remove entities, add systems, and query entities based on their components.

## Component Design

Components are designed to be pure data containers. Each component represents a specific aspect of an entity:

### Core Components

1. **Transform**: Position, rotation, and scale in 3D space
   ```javascript
   // Core positional data
   this.position = new THREE.Vector3();
   this.rotation = new THREE.Vector3();
   this.scale = new THREE.Vector3(1, 1, 1);
   ```

2. **Physics**: Velocity, mass, and physics properties
   ```javascript
   // Physics properties
   this.velocity = new THREE.Vector3();
   this.mass = 1;
   this.gravity = 0.015;
   this.friction = 0.97;
   this.isOnGround = false;
   ```

3. **Render**: Visual representation using Three.js meshes
   ```javascript
   // Visual representation
   this.mesh = mesh;
   this.visible = true;
   this.castShadow = true;
   this.receiveShadow = true;
   ```

4. **Collider**: Collision detection shapes and properties
   ```javascript
   // Collision data
   this.type = 'box'; // or 'sphere', 'torus', etc.
   this.params = { width: 1, height: 1, depth: 1 }; // shape-specific parameters
   this.bounce = 0.3; // bounciness factor
   ```

### Specialized Components

1. **Jump**: Jumping state and behavior
   ```javascript
   // Jump state
   this.jumpPower = 0.4;
   this.isJumping = false;
   this.isFalling = false;
   this.isOnSurface = true;
   ```

2. **PlayerControl**: Input handling for player-controlled entities
   ```javascript
   // Control properties
   this.speed = 0.005;
   this.airControlFactor = 0.3;
   this.moveDirection = { x: 0, z: 0 };
   ```

3. **Camera**: Camera positioning and behavior
   ```javascript
   // Camera properties
   this.offset = new THREE.Vector3(0, 15, 25);
   this.rotationSpeed = 0.05;
   this.angle = 0;
   this.height = 15;
   this.distance = 25;
   ```

4. **Surface**: Surface properties for platforms and obstacles
   ```javascript
   // Surface properties
   this.friction = 0.97;
   this.bounciness = 0.3;
   this.isJumpable = true;
   this.isRamp = false;
   ```

### Tag Components

We use tag components to categorize entities:

```javascript
// Tags.js
export class MarbleTag extends Component {}
export class PlatformTag extends Component {}
export class ObstacleTag extends Component {}
export class RampTag extends Component {}
export class RingTag extends Component {}
export class WallTag extends Component {}
export class JumpPlatformTag extends Component {}
```

These have no data but serve to identify entity types, enabling systems to select entities by type.

### Component Design Principles

1. **Single Responsibility**: Each component should represent a single aspect of an entity
2. **Data-Only**: Components should contain only data, no behavior or methods
3. **Minimal Coupling**: Components should not reference other components or entities
4. **Complete State**: Components should contain all data needed for their aspect

## System Design

Systems implement all game behavior by operating on entities with specific components:

### Core Systems

1. **InputSystem**: Processes player input and updates relevant components
   ```javascript
   // Required components: PlayerControl
   // Main responsibilities:
   // - Map keyboard input to player movement direction
   // - Handle camera rotation input
   // - Process jump requests
   ```

2. **PhysicsSystem**: Updates entity positions based on physics
   ```javascript
   // Required components: Transform, Physics
   // Main responsibilities:
   // - Apply gravity to entities not on ground
   // - Update positions based on velocity
   // - Apply friction to moving entities
   ```

3. **CollisionSystem**: Detects and resolves collisions
   ```javascript
   // Required components: Transform, Collider
   // Main responsibilities:
   // - Check for collisions between entities
   // - Resolve collisions with appropriate responses
   // - Update physics state based on collisions
   ```

4. **RenderSystem**: Updates mesh positions and rotations for rendering
   ```javascript
   // Required components: Transform, Render
   // Main responsibilities:
   // - Update mesh positions and rotations to match entity transforms
   // - Add/remove meshes from scene as needed
   // - Handle special rendering behaviors (e.g., marble rolling)
   ```

### Specialized Systems

1. **JumpSystem**: Handles jumping state transitions
   ```javascript
   // Required components: Transform, Physics, Jump
   // Main responsibilities:
   // - Manage jumping state transitions
   // - Apply jumping force when requested
   // - Handle landing detection
   ```

2. **CameraSystem**: Updates camera position and orientation
   ```javascript
   // Required components: Transform, Camera
   // Main responsibilities:
   // - Position camera based on target entity
   // - Handle camera rotation based on input
   // - Keep camera looking at target
   ```

3. **DebugSystem**: Updates debug display information
   ```javascript
   // Required components: Various, depending on what's being debugged
   // Main responsibilities:
   // - Display entity state information
   // - Show performance metrics
   // - Visualize physics and collision data
   ```

### System Design Principles

1. **Single Responsibility**: Each system should focus on one aspect of game behavior
2. **Component-Based Filtering**: Systems should operate only on entities with specific components
3. **No Entity Creation**: Systems should not create or destroy entities (use factories instead)
4. **Stateless Processing**: Systems should not maintain state between frames when possible
5. **Order Independence**: Systems should be designed to run in any order when possible (though some dependencies exist)

## Game Loop and Execution Order

Our game loop is a standard animation loop that updates all systems each frame:

```javascript
// main.js
function animate(time) {
  // Calculate delta time
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  
  // Update all systems
  world.update(deltaTime);
  
  // Render the scene
  renderer.render(scene, camera);
  
  // Request next frame
  requestAnimationFrame(animate);
}
```

Systems are executed in a specific order to ensure correct behavior:

1. **InputSystem**: Processes input first to capture player intent
2. **JumpSystem**: Updates jumping state based on input and current state
3. **PhysicsSystem**: Updates positions based on physical forces
4. **CollisionSystem**: Detects and resolves collisions after movement
5. **CameraSystem**: Updates camera position based on updated entity positions
6. **RenderSystem**: Updates visual representation based on final positions
7. **DebugSystem**: Updates debug display with final state for the frame

This order ensures that:
- Input is processed before physics so that player actions affect movement immediately
- Physics is applied before collision detection to ensure collisions are detected from the new positions
- Camera and rendering happen after all position updates to reflect the final state

## Entity Factory Pattern

We use factory classes to create entities with consistent component configurations:

```javascript
// MarbleFactory.js
export class MarbleFactory {
  static create(world, position) {
    // Create mesh...
    // Create entity and add components...
    return marble;
  }
}

// PlatformFactory.js
export class PlatformFactory {
  static createMainPlatform(world, size) { ... }
  static createJumpPlatform(world, position, size, height) { ... }
  static createBoundaries(world, size) { ... }
}

// ObstacleFactory.js
export class ObstacleFactory {
  static createRamp(world, position, width, height, angle) { ... }
  static createWall(world, position, width, height, depth) { ... }
  static createRing(world, position, radius, tubeRadius) { ... }
  static createZigzagWall(world, startPosition, segmentCount, segmentLength) { ... }
}
```

Factory methods handle:
- Creating the appropriate Three.js meshes
- Creating the entity
- Adding the necessary components with appropriate properties
- Returning the fully configured entity

This pattern ensures entities are created consistently and centralizes entity creation logic.

## Physics Implementation

Our physics implementation is relatively simple but effective:

### Gravity and Forces

```javascript
// In PhysicsSystem.js
if (!physics.isOnGround) {
  physics.velocity.y -= physics.gravity;
}
```

### Movement and Friction

```javascript
// Apply velocity to position
transform.position.x += physics.velocity.x;
transform.position.y += physics.velocity.y;
transform.position.z += physics.velocity.z;

// Apply friction
if (physics.isOnGround) {
  physics.velocity.x *= physics.friction;
  physics.velocity.z *= physics.friction;
} else {
  physics.velocity.x *= physics.airFriction;
  physics.velocity.z *= physics.airFriction;
}
```

### Key Physics Principles

1. **Simplified Forces**: We use direct velocity modifications rather than acceleration
2. **Surface Detection**: Entities can be on the ground or in the air, affecting friction and control
3. **Independent Axes**: X, Y, and Z velocities are handled independently
4. **Discrete Time Steps**: Physics updates at a fixed rate per frame

## Collision Detection

Our collision system handles various collision shapes:

### Collision Types

1. **Sphere-Box**: For marble collision with box-shaped obstacles
2. **Sphere-Sphere**: For potential marble-to-marble collision
3. **Sphere-Torus**: For the marble passing through ring obstacles

### Collision Response

```javascript
// Calculate dot product of velocity and normal
const dotProduct = relativeVelocity.dot(normal);

// Only resolve if objects are moving toward each other
if (dotProduct < 0) {
  // Apply impulse
  const impulse = -(1 + bounceFactor) * dotProduct;
  marblePhysics.velocity.x += impulse * normal.x;
  marblePhysics.velocity.y += impulse * normal.y;
  marblePhysics.velocity.z += impulse * normal.z;
  
  // Resolve penetration
  marbleTransform.position.x += normal.x * penetration;
  marbleTransform.position.y += normal.y * penetration;
  marbleTransform.position.z += normal.z * penetration;
}
```

### Special Collision Behaviors

- **Surface Detection**: Collisions with upward normals set the `isOnSurface` flag
- **Bouncing**: Collision response includes a bounce coefficient
- **Ramp Sliding**: Ramps apply a sliding force based on their angle

## Input Handling

Input is managed by a dedicated InputManager class:

```javascript
// InputManager.js
export class InputManager {
  constructor() {
    this.keys = {};
    this.keysPressedThisFrame = new Set();
    this.keysReleasedThisFrame = new Set();
    
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  // Methods for checking key states...
}
```

The InputSystem then uses this to update entity components:

```javascript
// In InputSystem.js
// Set movement direction based on keys and camera angle
playerControl.setMoveDirection(this.inputManager.keys, cameraAngle);

// Handle jump requests
if (jump && this.inputManager.isKeyDown(' ')) {
  jump.requestJump();
}
```

## Rendering Approach

Our rendering approach is straightforward but effective:

1. **Three.js Integration**: We use Three.js for 3D rendering
2. **Component-Based**: The Render component links entities to Three.js meshes
3. **Transform Synchronization**: The RenderSystem updates mesh positions to match entity transforms
4. **Special Effects**: Special rendering behaviors are implemented in the RenderSystem (e.g., marble rotation)

## Extension Guidelines

When extending the game with new features, follow these guidelines:

### Adding New Entity Types

1. **Define Components**: Determine what components your entity needs
2. **Create Factory**: Create a factory method to construct your entity
3. **Instantiate in Main**: Add the entity creation to the main.js file

Example:
```javascript
// Create a new factory method
export class PowerUpFactory {
  static createSpeedBoost(world, position) {
    // Create mesh...
    // Create entity with appropriate components...
    return powerUp;
  }
}

// In main.js
const speedBoost = PowerUpFactory.createSpeedBoost(world, new THREE.Vector3(10, 1, 10));
```

### Adding New Components

1. **Create Component Class**: Define a new class extending Component
2. **Add Data Fields**: Include all necessary data fields
3. **Update Existing Systems**: Modify systems to handle the new component if needed

Example:
```javascript
// PowerUp.js
export class PowerUp extends Component {
  constructor(type, duration, strength) {
    super();
    this.type = type;
    this.duration = duration;
    this.strength = strength;
    this.active = false;
    this.timeRemaining = 0;
  }
}
```

### Adding New Systems

1. **Create System Class**: Define a new class extending System
2. **Specify Required Components**: List the components your system needs
3. **Implement Update Method**: Add logic to process entities
4. **Add to World**: Register your system in the main.js file

Example:
```javascript
// PowerUpSystem.js
export class PowerUpSystem extends System {
  constructor(world) {
    super(world);
    this.requiredComponents = [PowerUp, Transform];
  }
  
  update(deltaTime) {
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const powerUp = entity.getComponent(PowerUp);
      
      // Process power-up logic...
    }
  }
}

// In main.js
world.addSystem(new PowerUpSystem(world));
```

### Adding Game Features

When adding larger features, follow this process:

1. **Define Components**: Create components to represent the feature's data
2. **Implement Systems**: Create systems to implement the feature's behavior
3. **Create Factories**: Define factory methods to create required entities
4. **Integrate with Existing Systems**: Update existing systems if needed
5. **Add UI Elements**: Create any necessary UI components
6. **Update Constants**: Add any required constants to Constants.js

## Performance Considerations

### Common Optimization Techniques

1. **Component Pooling**: Reuse component instances instead of creating new ones
   ```javascript
   // Example component pool
   const transformPool = [];
   
   function getTransform() {
     if (transformPool.length > 0) {
       return transformPool.pop();
     }
     return new Transform();
   }
   
   function returnTransform(transform) {
     transform.position.set(0, 0, 0);
     transform.rotation.set(0, 0, 0);
     transform.scale.set(1, 1, 1);
     transformPool.push(transform);
   }
   ```

2. **System Filtering**: Skip unnecessary entity processing
   ```javascript
   // Example optimization for inactive entities
   if (!entity.active) continue;
   ```

3. **Batched Processing**: Process similar entities together
   ```javascript
   // Group entities by type for more efficient processing
   const marbles = entities.filter(e => e.hasComponent(MarbleTag));
   const platforms = entities.filter(e => e.hasComponent(PlatformTag));
   ```

4. **Spatial Partitioning**: Use spatial data structures for collision detection
   ```javascript
   // Simple grid-based spatial partitioning
   const grid = new Map();
   const cellSize = 10;
   
   function getGridCell(position) {
     const x = Math.floor(position.x / cellSize);
     const z = Math.floor(position.z / cellSize);
     return `${x},${z}`;
   }
   
   // Add entities to grid
   for (const entity of entities) {
     const cell = getGridCell(entity.getComponent(Transform).position);
     if (!grid.has(cell)) grid.set(cell, []);
     grid.get(cell).push(entity);
   }
   
   // Check only nearby entities
   const nearbyEntities = grid.get(getGridCell(position)) || [];
   ```

### Profiling Tools

1. **FPS Counter**: Monitor frame rate to detect performance issues
2. **Entity Count**: Track the number of entities to detect potential overload
3. **System Timing**: Measure how long each system takes to update

## Troubleshooting

### Common Issues and Solutions

1. **Collision Detection Problems**
   - Check collider shapes and parameters
   - Verify collision normal calculation
   - Ensure entities aren't penetrating each other initially

2. **Physics Anomalies**
   - Check for extremely high velocities (add velocity capping)
   - Verify friction and gravity values
   - Look for accumulated floating-point errors

3. **Input Handling Issues**
   - Check for conflicting key bindings
   - Verify input state is being reset correctly
   - Ensure input is being processed in the correct order

4. **Rendering Glitches**
   - Check Three.js scene hierarchy
   - Verify transform synchronization
   - Look for z-fighting or incorrect depth settings

### Debugging Techniques

1. **State Visualization**: Display entity state on screen
   ```javascript
   // Already implemented in DebugSystem
   debugElement.innerHTML = `
     isOnSurface: ${jump.isOnSurface} <br>
     isJumping: ${jump.isJumping} <br>
     isFalling: ${jump.isFalling} <br>
     ...
   `;
   ```

2. **Console Logging**: Add strategic console logs
   ```javascript
   console.log("Collision detected:", 
     "entity:", entity.id, 
     "normal:", normal,
     "velocity:", velocity);
   ```

3. **Visual Debugging**: Add helper meshes to visualize physics
   ```javascript
   // Create a helper arrow to show velocity
   const arrowHelper = new THREE.ArrowHelper(
     velocity.clone().normalize(),
     position,
     velocity.length() * 2,
     0xff0000
   );
   scene.add(arrowHelper);
   ```

4. **Frame-by-Frame Analysis**: Add ability to step through frames
   ```javascript
   let paused = false;
   let step = false;
   
   window.addEventListener('keydown', (e) => {
     if (e.key === 'p') paused = !paused;
     if (e.key === 'n') step = true;
   });
   
   function animate(time) {
     if (!paused || step) {
       // Update world...
       step = false;
     }
     requestAnimationFrame(animate);
   }
   ```

---

This documentation should help developers understand the current architecture, principles, and how to extend the game with new features. By following these guidelines, the codebase should remain well-organized and maintainable as it grows.