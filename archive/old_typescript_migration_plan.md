# TypeScript Migration Plan for Marble Game

This document outlines a strategic plan for converting the Marble Game from JavaScript to TypeScript, enabling improved type safety, better tooling support, and enhanced code maintainability.

## Table of Contents

1. [Benefits of TypeScript](#benefits-of-typescript)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Migration Strategy](#migration-strategy)
5. [Testing Strategy](#testing-strategy)
6. [Phased Implementation Plan](#phased-implementation-plan)
7. [Type Definitions](#type-definitions)
8. [Advanced TypeScript Features](#advanced-typescript-features)
9. [Best Practices](#best-practices)
10. [Post-Migration Tasks](#post-migration-tasks)
11. [Fallback Planning](#fallback-planning)
12. [Timeline](#timeline)

## Benefits of TypeScript

Converting to TypeScript will provide several advantages:

1. **Type Safety**: Catch type-related errors at compile time rather than runtime
2. **Better Tooling**: Enhanced IDE support with autocompletion and inline documentation
3. **Improved Maintenance**: Types serve as documentation and make refactoring safer
4. **Modern JavaScript Features**: Access to latest JavaScript features with backward compatibility
5. **Stronger ECS Implementation**: TypeScript interfaces and generics are perfect for ECS patterns

## Prerequisites

Before beginning the migration, ensure the following prerequisites are met:

1. **Install TypeScript**:
   ```bash
   npm install --save-dev typescript
   ```

2. **Install Type Definitions for Dependencies**:
   ```bash
   npm install --save-dev @types/three
   ```

3. **Install ESLint TypeScript Support** (optional but recommended):
   ```bash
   npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

4. **Install ts-node for Development**:
   ```bash
   npm install --save-dev ts-node
   ```

## Project Setup

### 1. Create TypeScript Configuration

Create a `tsconfig.json` file in the project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["DOM", "ESNext"],
    "types": ["three"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 2. Update Package Scripts

Modify `package.json` to include TypeScript-specific scripts:

```json
"scripts": {
  "start": "vite",
  "build": "tsc && vite build",
  "type-check": "tsc --noEmit",
  "lint": "eslint src --ext .ts"
}
```

### 3. Configure Vite for TypeScript

Ensure Vite is set up to handle TypeScript files:

```javascript
// vite.config.js
export default {
  // Add this if not using the default Vite TypeScript configuration
  plugins: []
}
```

## Migration Strategy

We'll use a phased, incremental approach to migrate the project to TypeScript:

### Approach: Progressive Migration

1. **File-by-File Conversion**: Convert one file at a time, starting with the core files
2. **Relaxed Type Checking Initially**: Use `any` types where necessary, then gradually strengthen
3. **Maintain Working State**: Ensure the application is functional at each step
4. **Test After Each Module**: Verify functionality after converting each module

### File Extension Strategy

1. **Rename Files**: Change file extensions from `.js` to `.ts`
2. **Update Imports**: Ensure imports correctly reference the new TypeScript files
3. **Keep Interface Files**: Create separate `.d.ts` files for complex interfaces

## Testing Strategy

To ensure a smooth migration, we'll employ the following testing approach:

1. **Manual Testing**: Verify core gameplay after converting each system
2. **Type Checking**: Run `npm run type-check` after each file conversion
3. **Visual Verification**: Ensure all visuals render correctly
4. **Control Testing**: Confirm all player controls function as expected

## Phased Implementation Plan

### Phase 1: Core ECS Framework (1-2 days)

1. **Define Base Interfaces**:
   - Create `/src/types` directory for shared type definitions
   - Define interfaces for Entity, Component, System, and World

2. **Convert Core ECS Classes**:
   - Convert `Entity.js` to `Entity.ts`
   - Convert `Component.js` to `Component.ts`
   - Convert `System.js` to `System.ts`
   - Convert `World.js` to `World.ts`

3. **Create Type Definitions**:
   ```typescript
   // ecs.d.ts
   export interface IEntity {
     id: number;
     components: Map<string, IComponent>;
     addComponent(component: IComponent): IEntity;
     removeComponent(componentClass: Function): IEntity;
     getComponent<T extends IComponent>(componentClass: new (...args: any[]) => T): T | undefined;
     hasComponent(componentClass: Function): boolean;
   }

   export interface IComponent {
     // Base interface for components
   }

   export interface ISystem {
     world: IWorld;
     requiredComponents: Array<new (...args: any[]) => IComponent>;
     update(deltaTime: number): void;
     getEntities(): IEntity[];
   }

   export interface IWorld {
     entities: Map<number, IEntity>;
     systems: ISystem[];
     nextEntityId: number;
     createEntity(): IEntity;
     removeEntity(entity: IEntity): void;
     addSystem(system: ISystem): IWorld;
     update(deltaTime: number): void;
     getEntitiesWithComponents(componentClasses: Array<new (...args: any[]) => IComponent>): IEntity[];
   }
   ```

4. **Implement Core ECS Classes**:
   ```typescript
   // Example: Entity.ts
   import { IEntity, IComponent } from '../types/ecs';

   export class Entity implements IEntity {
     id: number;
     components: Map<string, IComponent>;

     constructor(id: number) {
       this.id = id;
       this.components = new Map();
     }

     addComponent(component: IComponent): Entity {
       this.components.set(component.constructor.name, component);
       return this;
     }

     // ... other methods
   }
   ```

### Phase 2: Components (2-3 days)

1. **Define Component Interfaces**:
   ```typescript
   // components.d.ts
   import * as THREE from 'three';
   import { IComponent } from './ecs';

   export interface ITransform extends IComponent {
     position: THREE.Vector3;
     rotation: THREE.Vector3;
     scale: THREE.Vector3;
     previousPosition: THREE.Vector3;
     savePreviousPosition(): void;
   }

   export interface IPhysics extends IComponent {
     velocity: THREE.Vector3;
     mass: number;
     gravity: number;
     friction: number;
     airFriction: number;
     bounceCoefficient: number;
     isOnGround: boolean;
     isStatic: boolean;
   }

   // ... other component interfaces
   ```

2. **Convert Component Classes**:
   - Convert `Transform.js` to `Transform.ts`
   - Convert `Physics.js` to `Physics.ts`
   - Convert `Render.js` to `Render.ts`
   - Convert `Collider.js` to `Collider.ts`
   - Convert `Jump.js` to `Jump.ts`
   - Convert `PlayerControl.js` to `PlayerControl.ts`
   - Convert `Camera.js` to `Camera.ts`
   - Convert `Surface.js` to `Surface.ts`
   - Convert `Tags.js` to `Tags.ts`

3. **Example Component Implementation**:
   ```typescript
   // Transform.ts
   import { Component } from '../engine/ecs/Component';
   import { ITransform } from '../types/components';
   import * as THREE from 'three';

   export class Transform extends Component implements ITransform {
     position: THREE.Vector3;
     rotation: THREE.Vector3;
     scale: THREE.Vector3;
     previousPosition: THREE.Vector3;

     constructor(
       position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
       rotation: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
       scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
     ) {
       super();
       this.position = position.clone();
       this.rotation = rotation.clone();
       this.scale = scale.clone();
       this.previousPosition = position.clone();
     }

     savePreviousPosition(): void {
       this.previousPosition.copy(this.position);
     }
   }
   ```

### Phase 3: Systems (2-3 days)

1. **Define System Interfaces**:
   ```typescript
   // systems.d.ts
   import { ISystem } from './ecs';
   import * as THREE from 'three';
   import { InputManager } from '../engine/InputManager';

   export interface IInputSystem extends ISystem {
     inputManager: InputManager;
   }

   export interface IPhysicsSystem extends ISystem {
     processPlayerMovement(entity: IEntity, transform: ITransform, physics: IPhysics, playerControl: IPlayerControl, deltaTime: number): void;
     processJumping(entity: IEntity, transform: ITransform, physics: IPhysics, jump: IJump, deltaTime: number): void;
   }

   // ... other system interfaces
   ```

2. **Convert System Classes**:
   - Convert `InputSystem.js` to `InputSystem.ts`
   - Convert `PhysicsSystem.js` to `PhysicsSystem.ts`
   - Convert `CollisionSystem.js` to `CollisionSystem.ts`
   - Convert `RenderSystem.js` to `RenderSystem.ts`
   - Convert `CameraSystem.js` to `CameraSystem.ts`
   - Convert `JumpSystem.js` to `JumpSystem.ts`
   - Convert `DebugSystem.js` to `DebugSystem.ts`

3. **Example System Implementation**:
   ```typescript
   // PhysicsSystem.ts
   import { System } from '../engine/ecs/System';
   import { IPhysicsSystem } from '../types/systems';
   import { IEntity } from '../types/ecs';
   import { Transform, Physics, Jump, PlayerControl } from '../components';
   import { ITransform, IPhysics, IJump, IPlayerControl } from '../types/components';
   import * as THREE from 'three';

   export class PhysicsSystem extends System implements IPhysicsSystem {
     constructor(world: IWorld) {
       super(world);
       this.requiredComponents = [Transform, Physics];
     }

     update(deltaTime: number): void {
       const entities = this.getEntities();
       
       for (const entity of entities) {
         const transform = entity.getComponent(Transform) as ITransform;
         const physics = entity.getComponent(Physics) as IPhysics;
         
         // Skip static entities
         if (physics.isStatic) continue;
         
         // Save previous position for collision resolution
         transform.savePreviousPosition();
         
         // Process player movement
         const playerControl = entity.getComponent(PlayerControl) as IPlayerControl | undefined;
         if (playerControl) {
           this.processPlayerMovement(entity, transform, physics, playerControl, deltaTime);
         }
         
         // Process jumping
         const jump = entity.getComponent(Jump) as IJump | undefined;
         if (jump) {
           this.processJumping(entity, transform, physics, jump, deltaTime);
         } else if (!physics.isOnGround) {
           // Apply gravity to non-jumping entities
           physics.velocity.y -= physics.gravity;
         }
         
         // ... rest of the system
       }
     }

     // Implement other required methods
   }
   ```

### Phase 4: Factories and Utilities (2 days)

1. **Define Factory Interfaces**:
   ```typescript
   // factories.d.ts
   import { IEntity, IWorld } from './ecs';
   import * as THREE from 'three';

   export interface IMarbleFactory {
     create(world: IWorld, position: THREE.Vector3): IEntity;
   }

   export interface IPlatformFactory {
     createMainPlatform(world: IWorld, size?: number): IEntity;
     createJumpPlatform(world: IWorld, position: THREE.Vector3, size?: number, height?: number): IEntity;
     createBoundaries(world: IWorld, size?: number): IEntity[];
   }

   // ... other factory interfaces
   ```

2. **Convert Factory Classes**:
   - Convert `MarbleFactory.js` to `MarbleFactory.ts`
   - Convert `PlatformFactory.js` to `PlatformFactory.ts`
   - Convert `ObstacleFactory.js` to `ObstacleFactory.ts`

3. **Convert Utility Files**:
   - Convert `Constants.js` to `Constants.ts`
   - Convert `MathUtils.js` to `MathUtils.ts`
   - Convert `TextureGenerator.js` to `TextureGenerator.ts`
   - Convert `Renderer.js` to `Renderer.ts`
   - Convert `InputManager.js` to `InputManager.ts`

4. **Example Factory Implementation**:
   ```typescript
   // MarbleFactory.ts
   import * as THREE from 'three';
   import { 
     Transform, 
     Physics, 
     Render, 
     Collider, 
     Jump, 
     PlayerControl, 
     Camera, 
     MarbleTag 
   } from '../components';
   import { OBJECTS, PHYSICS, CAMERA, COLORS } from '../utils/Constants';
   import { createMarbleTexture } from '../utils/TextureGenerator';
   import { IEntity, IWorld } from '../types/ecs';

   export class MarbleFactory {
     static create(world: IWorld, position: THREE.Vector3): IEntity {
       // Create marble mesh
       const marbleGeometry = new THREE.SphereGeometry(OBJECTS.MARBLE_RADIUS, 32, 32);
       const marbleMaterial = new THREE.MeshPhysicalMaterial({
         color: COLORS.MARBLE,
         roughness: 0.1,
         metalness: 0.3,
         transparent: true,
         opacity: 0.7,
         transmission: 0.5,
         clearcoat: 0.5,
         map: createMarbleTexture()
       });
       
       const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);
       marbleMesh.castShadow = true;
       marbleMesh.receiveShadow = true;
       
       // Create entity and add components
       const marble = world.createEntity()
         .addComponent(new Transform(position))
         .addComponent(new Physics(1, PHYSICS.GRAVITY))
         .addComponent(new Render(marbleMesh))
         .addComponent(new Collider('sphere', { radius: OBJECTS.MARBLE_RADIUS }))
         .addComponent(new Jump(PHYSICS.JUMP_POWER))
         .addComponent(new PlayerControl(PHYSICS.MARBLE_SPEED))
         .addComponent(new Camera(new THREE.Vector3(0, 15, 25), CAMERA.ROTATION_SPEED))
         .addComponent(new MarbleTag());
       
       return marble;
     }
   }
   ```

### Phase 5: Main Entry Point (1 day)

1. **Convert Main Entry Point**:
   - Convert `main.js` to `main.ts`
   - Update any imports to reference TypeScript files
   - Ensure type safety in the main game loop

2. **Example Main Implementation**:
   ```typescript
   // main.ts
   import * as THREE from 'three';
   import { World } from './engine/ecs/World';
   import { InputManager } from './engine/InputManager';
   import { initializeRenderer, setupLights } from './engine/Renderer';
   import { 
     InputSystem,
     PhysicsSystem,
     CollisionSystem,
     RenderSystem,
     CameraSystem,
     JumpSystem,
     DebugSystem
   } from './systems';
   import {
     MarbleFactory,
     PlatformFactory,
     ObstacleFactory
   } from './factories';
   import { OBJECTS } from './utils/Constants';
   import { IWorld } from './types/ecs';

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
   const world: IWorld = new World();

   // ... rest of the main file
   ```

### Phase 6: Testing and Refinement (2-3 days)

1. **Run Type Checking**:
   ```bash
   npm run type-check
   ```

2. **Fix Type Errors**:
   - Address any errors found during type checking
   - Strengthen types by removing any remaining `any` types
   - Add missing type declarations

3. **Test Gameplay**:
   - Ensure all aspects of the game function correctly
   - Verify collision detection works as expected
   - Test jumping and movement mechanics
   - Confirm camera controls function properly

4. **Optimize Types**:
   - Look for opportunities to use more specific types
   - Replace basic types with more descriptive ones
   - Add documentation comments for better IDE integration

## Type Definitions

Here are some additional type definitions that will be useful:

### Collision Types

```typescript
// collision.d.ts
import * as THREE from 'three';

export type ColliderType = 'box' | 'sphere' | 'torus';

export interface CollisionResult {
  collided: boolean;
  normal: THREE.Vector3;
  penetration: number;
}

export interface BoxColliderParams {
  width: number;
  height: number;
  depth: number;
}

export interface SphereColliderParams {
  radius: number;
}

export interface TorusColliderParams {
  radius: number;
  tube: number;
  innerRadius?: number;
  outerRadius?: number;
}

export type ColliderParams = BoxColliderParams | SphereColliderParams | TorusColliderParams;
```

### Utility Types

```typescript
// utils.d.ts
export interface KeyState {
  [key: string]: boolean;
}

export interface RendererSetup {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}
```

## Advanced TypeScript Features

Consider using these advanced TypeScript features:

### 1. Type Guards

```typescript
// Type guards to safely cast components
function isPhysicsComponent(component: IComponent): component is IPhysics {
  return component.constructor.name === 'Physics';
}

// Usage:
const component = entity.getComponent(Physics);
if (isPhysicsComponent(component)) {
  // TypeScript now knows component is IPhysics
  component.velocity.y += force;
}
```

### 2. Generic Components

```typescript
// Generic component getter
function getComponent<T extends IComponent>(
  entity: IEntity, 
  componentType: new (...args: any[]) => T
): T | undefined {
  return entity.getComponent(componentType) as T | undefined;
}

// Usage:
const physics = getComponent(entity, Physics);
if (physics) {
  physics.velocity.y += 1;
}
```

### 3. Enum Types

```typescript
// Use enums for clear categorization
export enum EntityType {
  Marble,
  Platform,
  Obstacle,
  Boundary
}

// Use as component property
export class EntityTypeComponent extends Component {
  type: EntityType;
  
  constructor(type: EntityType) {
    super();
    this.type = type;
  }
}
```

## Best Practices

1. **Use `strictNullChecks`**: Always check for null or undefined values
2. **Avoid `any` Type**: Use specific types or `unknown` if necessary
3. **Use Type Guards**: Create custom type guards for component casts
4. **Add Documentation Comments**: Use JSDoc-style comments for better IDE support
5. **Create Type Aliases**: Use type aliases for complex or repetitive types
6. **Use Readonly Properties**: Mark properties that shouldn't change as readonly
7. **Prefer Interfaces for API Boundaries**: Use interfaces for public APIs
8. **Use Enums for Constants**: Replace string constants with enums

## Post-Migration Tasks

1. **Update Documentation**: Update README.md and SYSTEM.md for TypeScript
2. **Add Type Safety Tests**: Verify type safety with dedicated tests
3. **Optimize Build Configuration**: Fine-tune the TypeScript compiler options
4. **Add Type Checking to CI/CD**: Ensure type checking in continuous integration

## Fallback Planning

If issues arise during migration:

1. **Incremental Adoption**: Use `allowJs: true` to mix TypeScript and JavaScript
2. **Relaxed Type Checking**: Temporarily disable strict checking for problematic files
3. **Hybrid Approach**: Keep core logic in TypeScript, leave edge cases in JavaScript

## Timeline

Based on the phases outlined above:

1. **Setup and Core Framework**: 1-2 days
2. **Components Migration**: 2-3 days
3. **Systems Migration**: 2-3 days
4. **Factories and Utilities**: 2 days
5. **Main Entry Point**: 1 day
6. **Testing and Refinement**: 2-3 days

**Total Estimated Time**: 10-14 days

---

This plan provides a structured approach to migrating the Marble Game from JavaScript to TypeScript, focusing on incremental adoption and maintaining a working application throughout the process. By following this plan, you'll be able to enhance the codebase with type safety while preserving all existing functionality.