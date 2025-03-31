# Testing Documentation for Marble Game

This document describes the testing approach for the Marble Game, including test philosophy, implementation details, and guidelines for writing new tests.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure and Organization](#test-structure-and-organization)
3. [Available Test Utilities](#available-test-utilities)
4. [Writing New Tests](#writing-new-tests)
5. [Running Tests](#running-tests)
6. [Mock Implementations](#mock-implementations)
7. [Performance Testing](#performance-testing)
8. [Current Test Coverage](#current-test-coverage)
9. [Future Test Improvements](#future-test-improvements)

## Testing Philosophy

The Marble Game uses a multi-layered testing approach that balances coverage with maintainability:

- **Unit Tests**: Verify individual components, systems, and classes in isolation
- **Integration Tests**: Test interactions between systems (e.g., Physics + Collision)
- **Simulation Tests**: Test complete game mechanics and scenarios
- **Performance Tests**: Ensure consistent performance as entity count grows

Our testing emphasizes:
- **Behavior-driven testing**: Focus on what the code should do, not implementation details
- **Realistic scenarios**: Test cases that match actual gameplay conditions
- **Performance awareness**: Identify potential bottlenecks before they affect gameplay

## Test Structure and Organization

The tests are organized by test type and the components they're testing:

```
test/
├── __mocks__/            # Mocks for external dependencies (THREE.js, InputManager)
├── unit/                 # Unit tests
│   ├── components/       # Tests for game components
│   ├── systems/          # Tests for game systems
│   ├── engine/           # Tests for ECS core
│   └── factories/        # Tests for entity factories
├── integration/          # Integration tests
│   └── systemInteractions/  # Tests for interactions between systems
├── simulation/           # Simulation tests
│   └── scenarios/        # Game scenario tests
├── performance/          # Performance tests
└── utils/                # Test utilities
```

## Available Test Utilities

The test suite includes several utilities to make tests easier to write:

### Test World

`testWorld.ts` provides utilities for creating test worlds with specific components:

```typescript
// Create a test world with physics and collision systems
const world = createTestWorld(['physics', 'collision']);

// Run a specified number of frames
const finalState = runFrames(world, 10, 0.016);

// Get entity state history
const history = recordEntityState(world, entityId, 10, 0.016);
```

### Benchmarking

`benchmark.ts` provides utilities for performance testing:

```typescript
const result = benchmark(
  'Physics system with 100 entities',
  () => physicsSystem.update(0.016),
  100
);

console.log(formatBenchmarkResult(result));
// Outputs: "Physics system with 100 entities: 0.042ms (23809.52 ops/sec)"
```

### Input Mocking

`InputManager.ts` mock implementation allows simulating keyboard input:

```typescript
const inputManager = new MockInputManager();
inputManager.simulateKeyDown('KeyW');
inputManager.update();
expect(inputManager.isKeyDown('KeyW')).toBe(true);
```

## Writing New Tests

When writing new tests, follow these guidelines:

### Unit Tests

Test each component and system in isolation:

```typescript
describe('Jump Component', () => {
  test('should request jump when triggered', () => {
    const jump = new Jump();
    jump.requestJump();
    expect(jump.jumpRequested).toBe(true);
  });
  
  test('should execute jump when on surface', () => {
    const jump = new Jump();
    jump.isOnSurface = true;
    jump.requestJump();
    const executed = jump.executeJumpIfRequested();
    expect(executed).toBe(true);
    expect(jump.isJumping).toBe(true);
  });
});
```

### System Tests

Focus on system behavior with controlled inputs:

```typescript
describe('PhysicsSystem', () => {
  let world: World;
  let physicsSystem: PhysicsSystem;
  
  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem(world);
  });
  
  test('should apply gravity to entities', () => {
    const entity = world.createEntity();
    const transform = new Transform();
    const physics = new Physics();
    physics.isStatic = false;
    
    entity.addComponent(transform);
    entity.addComponent(physics);
    
    physicsSystem.update(1.0);
    
    expect(physics.velocity.y).toBeLessThan(0);
  });
});
```

### Testing THREE.js Interactions

When testing components that interact with THREE.js:

```typescript
describe('RenderSystem', () => {
  test('should update mesh position from transform', () => {
    const entity = world.createEntity();
    const transform = new Transform();
    const render = new Render(new THREE.Mesh());
    
    transform.position.set(1, 2, 3);
    entity.addComponent(transform);
    entity.addComponent(render);
    
    renderSystem.update(0.016);
    
    expect(render.mesh.position.x).toBe(1);
    expect(render.mesh.position.y).toBe(2);
    expect(render.mesh.position.z).toBe(3);
  });
});
```

### Integration Tests

Test interactions between systems:

```typescript
describe('JumpPhysics Integration', () => {
  test('should apply jump force to physics', () => {
    const entity = world.createEntity();
    const jump = new Jump();
    const physics = new Physics();
    
    entity.addComponent(jump);
    entity.addComponent(physics);
    
    jump.requestJump();
    jump.isOnSurface = true;
    
    jumpSystem.update(0.016);
    
    expect(physics.velocity.y).toBeGreaterThan(0);
  });
});
```

### Performance Tests

Test system scaling with different entity counts:

```typescript
describe('CollisionSystem Performance', () => {
  test('should scale with number of entities', () => {
    const entityCounts = [10, 50, 100, 200];
    const results = [];
    
    for (const count of entityCounts) {
      // Setup entities
      const result = benchmark(`Collision with ${count} entities`, 
        () => collisionSystem.update(0.016),
        100
      );
      results.push(result);
      
      expect(result.averageTime).toBeLessThan(20);
    }
  });
});
```

## Running Tests

Run tests using npm scripts:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific tests
npm test -- -t "PhysicsSystem"
```

## Mock Implementations

The testing suite includes mocks for:

1. **THREE.js**: Simplified implementations of Vector3, Mesh, etc.
2. **InputManager**: Simulates keyboard input
3. **WebGL**: Canvas mock for render testing

These mocks allow testing game logic without real rendering or input devices.

## Performance Testing

Performance tests use the benchmark utility to:

1. Measure system performance with different entity counts
2. Test specific scenarios (high-velocity objects, many static objects)
3. Verify sublinear scaling as entity count increases

Performance tests include relaxed thresholds to avoid flakiness in different environments.

## Current Test Coverage

As of the latest run, test coverage is:

- **Components**: ~86% (exceeding 80% goal)
- **ECS core**: 80% (meeting 80% goal)
- **Factories**: ~96% (exceeding 70% goal)
- **Systems**: ~77% (exceeding 70% goal)
- **Utils**: ~94% (exceeding 80% goal)
- **Overall**: ~70% statements, ~68% branches, ~74% functions

## Future Test Improvements

Areas for future test enhancement:

1. **Visual Testing**: Implement screenshot comparison tests
2. **JumpPhysics Integration**: Improve reliability of the flaky integration test
3. **System Coverage**: Increase coverage of systems to reach 70% goal
4. **Input and Rendering**: Improve test coverage for InputManager and Renderer classes
5. **Simulation Tests**: Add more game scenario tests
6. **Cross-Browser Testing**: Add tests for different browser environments
7. **Memory Profiling**: Add tests for memory usage and leak detection

---

*This documentation will be updated as the testing strategy evolves with the game.*