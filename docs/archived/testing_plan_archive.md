# Archived Testing Plan for Marble Game

This document is an archive of the original testing plan that was implemented. Please refer to `TESTING.md` in the root directory for the most current testing documentation.

---
# Testing Plan for Marble Game

This document outlines a comprehensive testing strategy for the marble game's Entity Component System (ECS) architecture. The plan is designed to achieve solid test coverage while remaining extensible as the game evolves.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Tools and Setup](#testing-tools-and-setup)
3. [Test Coverage Goals](#test-coverage-goals)
4. [Test Types and Strategies](#test-types-and-strategies)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Continuous Integration](#continuous-integration)
7. [Example Tests](#example-tests)
8. [Mock Implementations](#mock-implementations)
9. [Performance Testing](#performance-testing)
10. [Visual Testing](#visual-testing)
11. [Future Extensions](#future-extensions)

## Testing Philosophy

Testing a game requires a multi-layered approach:

- **Core Logic Tests**: Unit tests for ECS framework, components, and systems
- **Integration Tests**: Verify interactions between systems
- **Simulation Tests**: Test gameplay mechanics and scenarios
- **Performance Tests**: Ensure consistent frame rates
- **Visual Tests**: Verify rendering output

For games, we must balance:
- **Test Depth**: Enough coverage to catch bugs
- **Test Performance**: Fast enough for regular development
- **Test Maintainability**: Easy to extend with new features

## Testing Tools and Setup

### Required Dependencies

```bash
# Install testing framework and dependencies
npm install --save-dev jest ts-jest @types/jest jest-environment-jsdom jest-canvas-mock jest-image-snapshot @types/three
```

### Jest Configuration

Create a `jest.config.js` file:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^three$': '<rootDir>/test/mocks/three.ts',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true
    }]
  },
};
```

### Add Test Scripts to package.json

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --runInBand"
}
```

### Test Directory Structure

```
test/
├── __mocks__/            # Mocks for external dependencies
│   └── three.ts          # Mock THREE.js objects
├── setup.ts              # Test setup and global utilities
├── utils/                # Test utilities and helpers
│   ├── testWorld.ts      # Utility to create test worlds
│   └── simulationUtils.ts  # Utilities for game simulation
├── unit/                 # Unit tests
│   ├── components/       # Tests for components
│   ├── systems/          # Tests for systems
│   └── engine/           # Tests for engine utilities
├── integration/          # Integration tests
│   └── systemInteractions/  # Tests for system interactions
├── simulation/           # Gameplay simulation tests
│   └── scenarios/        # Game scenario tests
└── performance/          # Performance tests
```

## Test Coverage Goals

Initial test coverage goals:

- **Core ECS Framework**: 90%+ coverage
- **Components**: 80%+ coverage
- **Systems**: 70%+ coverage
- **Factories**: 70%+ coverage
- **Utilities**: 80%+ coverage

Long-term test coverage goals:

- **Overall Coverage**: 80%+
- **Critical Game Logic**: 90%+

## Test Types and Strategies

### 1. Unit Tests for ECS Framework

Test the foundation of the game architecture:

- **Entity Tests**:
  - Creation and ID assignment
  - Adding/removing components
  - Querying for components

- **Component Tests**:
  - Basic initialization
  - Method functionality
  - State transitions

- **System Tests**:
  - Entity filtering
  - Component access
  - Update method execution

- **World Tests**:
  - Entity creation/removal
  - System registration
  - Entity querying by component

### 2. Component Tests

Test each component type thoroughly:

- **Transform Component**:
  - Position, rotation, scale initialization
  - Previous position tracking
  - Vector operations

- **Physics Component**:
  - Velocity and forces
  - Gravity application
  - Friction calculations

- **Collision Component**:
  - Collider types (sphere, box, torus)
  - Collision parameters
  - Trigger functionality

- **Other Components**:
  - Player controls
  - Camera behavior
  - Jump mechanics
  - Rendering properties

### 3. System Tests

Test system logic in isolation:

- **Input System**:
  - Key state processing
  - Player control mapping
  - Camera control input

- **Physics System**:
  - Velocity application
  - Gravity effects
  - Ground friction vs. air friction

- **Collision System**:
  - Collision detection algorithms
  - Collision response calculations
  - Boundary handling

- **Render System**:
  - Mesh position/rotation updates
  - Scene management
  - Visibility toggling

- **Camera System**:
  - Camera positioning
  - Orbital movement
  - Target following

- **Jump System**:
  - Jump state transitions
  - Jump power application
  - Ground detection

### 4. Integration Tests

Test interactions between systems:

- **Input → Physics → Render**:
  - Verify input correctly affects movement
  - Ensure movement translates to visual changes

- **Physics → Collision → Physics**:
  - Test collision responses affect physics correctly
  - Verify impulse application

- **Jump → Physics → Collision**:
  - Test jump mechanics interact with surfaces
  - Verify gravity affects jumps properly

### 5. Factory Tests

Test entity creation from factories:

- **Marble Factory**:
  - Component composition
  - Initial state configuration
  - Visual properties

- **Platform Factory**:
  - Various platform types
  - Surface properties
  - Collider setup

- **Obstacle Factory**:
  - Different obstacle geometries
  - Collision properties
  - Static/dynamic behavior

### 6. Simulation Tests

Test game mechanics through controlled simulations:

- **Basic Movement**:
  - Rolling across flat surfaces
  - Response to different input sequences

- **Physics Scenarios**:
  - Falling and bouncing behavior
  - Sliding down ramps
  - Rolling up inclines

- **Game Challenges**:
  - Navigating obstacle courses
  - Jumping between platforms
  - Passing through rings

### 7. Performance Tests

Ensure the game maintains performance:

- **Entity Scaling**:
  - Test with increasing entity counts
  - Measure frame rate stability

- **System Benchmarks**:
  - Measure performance of individual systems
  - Identify bottlenecks

- **Memory Usage**:
  - Track memory allocation during gameplay
  - Check for memory leaks

### 8. Visual Regression Tests

Test rendering output:

- **Screenshot Comparisons**:
  - Compare rendered frames with baselines
  - Check for visual regressions

- **Animation Tests**:
  - Verify smooth transitions
  - Check interpolation effects

## Implementation Roadmap

Phase 1: Core Framework Testing (Week 1)
- Set up testing environment
- Implement mocks for THREE.js
- Write tests for Entity, Component, System, and World classes

Phase 2: Component & Factory Testing (Week 2)
- Implement tests for all components
- Create tests for factory methods
- Ensure proper initialization and behavior

Phase 3: System & Integration Testing (Weeks 3-4)
- Develop tests for all game systems
- Create integration tests for system interactions
- Test game mechanics

Phase 4: Simulation & Performance Testing (Week 5)
- Implement game scenario tests
- Create performance benchmarks
- Set up visual regression testing

Phase 5: CI Integration & Coverage Completion (Week 6)
- Set up continuous integration
- Fill coverage gaps
- Document testing patterns for future extensions

## Continuous Integration

Set up CI/CD pipeline to:
- Run tests on every commit
- Generate coverage reports
- Perform performance benchmarks
- Run visual regression tests
- Block merges if tests fail

Recommended tools:
- GitHub Actions or GitLab CI
- Jest for test running
- CodeCov for coverage visualization
- Performance budgets for frame rate targets

## Example Tests

### Entity Test Example

```typescript
// test/unit/engine/Entity.test.ts
import { Entity } from '../../../src/engine/ecs/Entity';
import { Component } from '../../../src/engine/ecs/Component';
import { Transform } from '../../../src/components/Transform';

describe('Entity', () => {
  test('should create with correct ID', () => {
    const entity = new Entity(5);
    expect(entity.id).toBe(5);
  });

  test('should add and retrieve components', () => {
    const entity = new Entity(1);
    const transform = new Transform();
    
    entity.addComponent(transform);
    
    expect(entity.getComponent(Transform)).toBe(transform);
  });

  test('should remove components', () => {
    const entity = new Entity(1);
    const transform = new Transform();
    
    entity.addComponent(transform);
    entity.removeComponent(Transform);
    
    expect(entity.getComponent(Transform)).toBeUndefined();
  });

  test('should check if component exists', () => {
    const entity = new Entity(1);
    const transform = new Transform();
    
    entity.addComponent(transform);
    
    expect(entity.hasComponent(Transform)).toBe(true);
    expect(entity.hasComponent(Component)).toBe(false);
  });
});
```

### System Test Example

```typescript
// test/unit/systems/PhysicsSystem.test.ts
import { PhysicsSystem } from '../../../src/systems/PhysicsSystem';
import { World } from '../../../src/engine/ecs/World';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import * as THREE from 'three';

describe('PhysicsSystem', () => {
  let world: World;
  let physicsSystem: PhysicsSystem;
  
  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem(world);
  });
  
  test('should apply gravity to non-static entities', () => {
    // Create entity with physics
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(0, 10, 0));
    const physics = new Physics(1, 0.1); // Mass 1, gravity 0.1
    physics.isStatic = false;
    physics.isOnGround = false;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics for one frame
    physicsSystem.update(1.0); // 1 second
    
    // Expect gravity to have been applied
    expect(physics.velocity.y).toBe(-0.1);
    expect(transform.position.y).toBe(9.9);
  });
  
  test('should not apply gravity to static entities', () => {
    // Create static entity
    const entity = world.createEntity();
    const transform = new Transform(new THREE.Vector3(0, 10, 0));
    const physics = new Physics(1, 0.1);
    physics.isStatic = true;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics for one frame
    physicsSystem.update(1.0);
    
    // Expect no movement for static entity
    expect(transform.position.y).toBe(10);
  });
  
  test('should apply friction on ground', () => {
    // Create entity on ground
    const entity = world.createEntity();
    const transform = new Transform();
    const physics = new Physics();
    physics.velocity.set(10, 0, 0);
    physics.isOnGround = true;
    physics.friction = 0.9;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    // Run physics for one frame
    physicsSystem.update(1.0);
    
    // Expect friction to have slowed the entity
    expect(physics.velocity.x).toBe(9); // 10 * 0.9
  });
});
```

### Integration Test Example

```typescript
// test/integration/systemInteractions/CollisionResponse.test.ts
import { World } from '../../../src/engine/ecs/World';
import { PhysicsSystem } from '../../../src/systems/PhysicsSystem';
import { CollisionSystem } from '../../../src/systems/CollisionSystem';
import { MarbleFactory } from '../../../src/factories/MarbleFactory';
import { PlatformFactory } from '../../../src/factories/PlatformFactory';
import { Transform } from '../../../src/components/Transform';
import { Physics } from '../../../src/components/Physics';
import * as THREE from 'three';

describe('Collision Response Integration', () => {
  let world: World;
  let physicsSystem: PhysicsSystem;
  let collisionSystem: CollisionSystem;
  
  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem(world);
    collisionSystem = new CollisionSystem(world);
  });
  
  test('marble should bounce when colliding with platform', () => {
    // Create marble and platform
    const marble = MarbleFactory.create(world, new THREE.Vector3(0, 5, 0));
    PlatformFactory.createMainPlatform(world);
    
    // Get marble components
    const marblePhysics = marble.getComponent(Physics);
    const marbleTransform = marble.getComponent(Transform);
    
    // Set downward velocity
    marblePhysics.velocity.y = -10;
    marblePhysics.bounceCoefficient = 0.5;
    
    // Run simulation for a few frames
    for (let i = 0; i < 10; i++) {
      physicsSystem.update(0.016);
      collisionSystem.update(0.016);
    }
    
    // Marble should have bounced (positive y velocity)
    expect(marblePhysics.velocity.y).toBeGreaterThan(0);
    
    // Marble should be above the ground
    expect(marbleTransform.position.y).toBeGreaterThan(0.7);
  });
});
```

## Mock Implementations

Key mocks needed for testing:

### THREE.js Mock (Basic Version)

```typescript
// test/mocks/three.ts
export class Vector3 {
  x: number;
  y: number;
  z: number;
  
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  
  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  
  equals(v: Vector3) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }
  
  distanceTo(v: Vector3) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (length > 0) {
      this.x /= length;
      this.y /= length;
      this.z /= length;
    }
    return this;
  }
  
  subVectors(a: Vector3, b: Vector3) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }
  
  toArray() {
    return [this.x, this.y, this.z];
  }
}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

export class Euler {
  x: number;
  y: number;
  z: number;
  
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

export class Matrix4 {
  elements: number[];
  
  constructor() {
    this.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
  
  makeRotationFromEuler(euler: Euler) {
    // Simplified mock implementation
    return this;
  }
  
  invert() {
    // Simplified mock implementation
    return this;
  }
  
  clone() {
    const m = new Matrix4();
    m.elements = [...this.elements];
    return m;
  }
}

export class Vector2 {
  x: number;
  y: number;
  
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  
  normalize() {
    const length = this.length();
    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }
    return this;
  }
  
  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }
}

export const DoubleSide = 0;
export const RepeatWrapping = 1000;

export class MeshStandardMaterial {
  color: number;
  roughness: number;
  metalness: number;
  
  constructor(params: any = {}) {
    this.color = params.color || 0xffffff;
    this.roughness = params.roughness || 0.5;
    this.metalness = params.metalness || 0.5;
  }
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {
  transmission: number;
  clearcoat: number;
  
  constructor(params: any = {}) {
    super(params);
    this.transmission = params.transmission || 0;
    this.clearcoat = params.clearcoat || 0;
  }
}

export class Mesh {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  castShadow: boolean;
  receiveShadow: boolean;
  geometry: any;
  material: any;
  parent: any;
  
  constructor(geometry: any, material: any) {
    this.geometry = geometry;
    this.material = material;
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.castShadow = false;
    this.receiveShadow = false;
    this.parent = null;
  }
}

export class Object3D {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  parent: any;
  
  constructor() {
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.parent = null;
  }
  
  add(object: any) {
    object.parent = this;
  }
  
  remove(object: any) {
    if (object.parent === this) {
      object.parent = null;
    }
  }
  
  lookAt(position: Vector3) {
    // Simplified implementation
  }
}

export class Scene extends Object3D {
  constructor() {
    super();
  }
}

export class Camera extends Object3D {
  constructor() {
    super();
  }
}

export class PerspectiveCamera extends Camera {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
}

export class WebGLRenderer {
  domElement: HTMLCanvasElement;
  
  constructor(params: any = {}) {
    this.domElement = document.createElement('canvas');
  }
  
  setSize(width: number, height: number) {}
  
  render(scene: Scene, camera: Camera) {}
}

// Simple geometries
export class BoxGeometry {
  parameters: {
    width: number;
    height: number;
    depth: number;
  };
  
  constructor(width = 1, height = 1, depth = 1) {
    this.parameters = { width, height, depth };
  }
}

export class SphereGeometry {
  parameters: {
    radius: number;
  };
  
  constructor(radius = 1) {
    this.parameters = { radius };
  }
}

export class TorusGeometry {
  parameters: {
    radius: number;
    tube: number;
  };
  
  constructor(radius = 1, tube = 0.4) {
    this.parameters = { radius, tube };
  }
}

export class PlaneGeometry {
  parameters: {
    width: number;
    height: number;
  };
  
  constructor(width = 1, height = 1) {
    this.parameters = { width, height };
  }
}

export class CanvasTexture {
  wrapS: number;
  wrapT: number;
  repeat: Vector2;
  
  constructor(canvas: HTMLCanvasElement) {
    this.wrapS = 0;
    this.wrapT = 0;
    this.repeat = new Vector2(1, 1);
  }
}

export class Color {
  r: number;
  g: number;
  b: number;
  
  constructor(color?: number) {
    this.r = 1;
    this.g = 1;
    this.b = 1;
  }
}
```

### Test Setup File

```typescript
// test/setup.ts
import 'jest-canvas-mock';

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 0);
};

// Mock cancelAnimationFrame
global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

// Mock performance.now()
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  } as Performance;
}

// Helper to create test elements
global.createTestElement = (id: string) => {
  const element = document.createElement('div');
  element.id = id;
  document.body.appendChild(element);
  return element;
};

// Clean up after each test
afterEach(() => {
  document.body.innerHTML = '';
});
```

## Performance Testing

### Example Performance Test

```typescript
// test/performance/entityScaling.test.ts
import { World } from '../../src/engine/ecs/World';
import { PhysicsSystem } from '../../src/systems/PhysicsSystem';
import { ObstacleFactory } from '../../src/factories/ObstacleFactory';
import * as THREE from 'three';

describe('Entity Scaling Performance', () => {
  // Skip in CI environment to avoid flaky tests
  const testOrSkip = process.env.CI ? it.skip : it;
  
  testOrSkip('should maintain performance with 1000 entities', () => {
    const world = new World();
    const physicsSystem = new PhysicsSystem(world);
    
    // Create many entities
    for (let i = 0; i < 1000; i++) {
      ObstacleFactory.createBoxObstacle(
        world,
        new THREE.Vector3(Math.random() * 100 - 50, 1, Math.random() * 100 - 50),
        1, 1, 1
      );
    }
    
    // Measure execution time
    const start = performance.now();
    
    // Run 60 frames
    for (let i = 0; i < 60; i++) {
      physicsSystem.update(1/60);
    }
    
    const duration = performance.now() - start;
    
    // Average time per frame should be less than 16ms (60fps)
    const avgFrameTime = duration / 60;
    expect(avgFrameTime).toBeLessThan(16);
  });
});
```

### Performance Benchmarking Utility

```typescript
// test/utils/benchmark.ts
export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
}

export const benchmark = (
  name: string,
  fn: () => void,
  iterations = 1000
): BenchmarkResult => {
  // Warm up
  for (let i = 0; i < 5; i++) {
    fn();
  }
  
  // Measure
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const totalTime = performance.now() - start;
  const averageTime = totalTime / iterations;
  const operationsPerSecond = 1000 / averageTime;
  
  return {
    name,
    iterations,
    totalTime,
    averageTime,
    operationsPerSecond
  };
};
```

## Visual Testing

### Example Visual Test

```typescript
// test/visual/renderOutput.test.ts
import { jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { initializeRenderer } from '../../src/engine/Renderer';
import { World } from '../../src/engine/ecs/World';
import { MarbleFactory } from '../../src/factories/MarbleFactory';
import { PlatformFactory } from '../../src/factories/PlatformFactory';
import { RenderSystem } from '../../src/systems/RenderSystem';

// Add snapshot matcher
expect.extend({ toMatchImageSnapshot });

describe('Render Output', () => {
  // Skip in CI environment unless configured for visual testing
  const testOrSkip = process.env.CI && !process.env.VISUAL_TESTING ? it.skip : it;
  
  testOrSkip('should match the expected snapshot', async () => {
    // Mock canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    
    // Setup minimal renderer
    const { renderer, scene, camera } = initializeRenderer();
    
    // Set up world
    const world = new World();
    const renderSystem = new RenderSystem(world, scene);
    
    // Add objects
    MarbleFactory.create(world);
    PlatformFactory.createMainPlatform(world);
    
    // Render frame
    renderSystem.update(0);
    renderer.render(scene, camera);
    
    // Get image data
    const imageData = canvas.toDataURL();
    
    // Compare with baseline
    expect(imageData).toMatchImageSnapshot();
  });
});
```

## Future Extensions

As the game evolves, extend the testing strategy:

1. **New Features**: Create test templates for new components and systems
2. **Test Automation**: Develop AI-driven gameplay testing
3. **User Testing**: Integrate user behavior simulation
4. **Cross-Browser Testing**: Add tests for multiple browser environments
5. **Advanced Performance**: Add memory profiling and WebGL performance tests
6. **Extended Visual Testing**: Add animation tests and graphic quality verification

Remember that game testing is an iterative process. Start with core functionality and expand testing as the game grows.

---

**Note**: This testing plan will evolve with the game. Regular reviews of test coverage and effectiveness should be performed to ensure the tests continue to provide value as the game develops.