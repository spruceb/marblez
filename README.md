# Marble Game with Entity Component System

A 3D marble rolling game built with Three.js and implemented using an Entity Component System (ECS) architecture.

## Overview

This project is a simple 3D game where the player controls a marble that can roll around a platform, jump over obstacles, and navigate through various challenges. The game demonstrates physics simulation, collision detection, and 3D rendering using Three.js.

## Project Structure

The project is organized using an Entity Component System architecture:

```
game-test/
├── index.html                 # Main HTML entry point
├── archive/                   # Archive of old planning files
├── src/
│   ├── main.js                # Main entry point for the game
│   ├── engine/                # Core ECS engine
│   │   ├── ecs/               # ECS implementation
│   │   │   ├── Entity.js      # Entity class
│   │   │   ├── Component.js   # Component base class
│   │   │   ├── System.js      # System base class
│   │   │   └── World.js       # World manager class
│   │   ├── Renderer.js        # Three.js renderer setup
│   │   └── InputManager.js    # Input handling
│   ├── components/            # Game components
│   │   ├── Transform.js       # Position, rotation, scale
│   │   ├── Physics.js         # Velocity, forces
│   │   ├── Render.js          # Visual representation
│   │   ├── Collider.js        # Collision shapes
│   │   ├── Jump.js            # Jumping behavior
│   │   ├── PlayerControl.js   # Player input control
│   │   ├── Camera.js          # Camera behavior
│   │   ├── Surface.js         # Surface properties
│   │   └── Tags.js            # Entity tag components
│   ├── systems/               # Game systems
│   │   ├── InputSystem.js     # Processes input
│   │   ├── PhysicsSystem.js   # Updates physics
│   │   ├── CollisionSystem.js # Handles collisions
│   │   ├── RenderSystem.js    # Renders entities
│   │   ├── CameraSystem.js    # Controls camera
│   │   ├── JumpSystem.js      # Handles jumping
│   │   └── DebugSystem.js     # Debugging display
│   ├── factories/             # Entity factories
│   │   ├── MarbleFactory.js   # Creates the player marble
│   │   ├── PlatformFactory.js # Creates platforms
│   │   └── ObstacleFactory.js # Creates obstacles
│   └── utils/                 # Utilities
│       ├── Constants.js       # Game constants
│       ├── MathUtils.js       # Math helper functions
│       └── TextureGenerator.js # Texture creation utilities
└── node_modules/              # Dependencies
```

## Controls

- **WASD or Arrow Keys**: Move the marble
- **Q/E or Left/Right Arrows** (when not moving): Rotate camera
- **Spacebar**: Jump when on a surface

## Game Features

- 3D environment with lighting and shadows
- Physics simulation with gravity, friction, and bouncing
- Various obstacles including ramps, walls, platforms, and rings
- Collision detection and response
- Third-person camera that follows the marble
- Procedurally generated textures

## Implementation Details

The game uses an Entity Component System architecture:

- **Entities** are simple containers for components
- **Components** hold pure data with no behavior
- **Systems** process entities with specific components

This architecture provides good separation of concerns, making the code more maintainable and extensible.

## Running the Game

To run the game:

```bash
npm install
npm run start
```

The game should open in your web browser.

## Future Enhancements

Potential future enhancements include:

- Power-ups with special effects
- Multiple levels
- Score tracking
- Particle effects
- Sound effects and music
- Mobile controls