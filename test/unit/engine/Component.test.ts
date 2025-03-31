import { Component } from '../../../src/engine/ecs/Component';

// Test subclass of Component
class TestComponent extends Component {
  value: number;
  
  constructor(value: number = 0) {
    super();
    this.value = value;
  }
}

describe('Component', () => {
  test('should be instantiated', () => {
    const component = new TestComponent();
    expect(component).toBeInstanceOf(Component);
    expect(component).toBeInstanceOf(TestComponent);
  });
  
  test('should store subclass properties', () => {
    const component = new TestComponent(42);
    expect(component.value).toBe(42);
  });
  
  test('should have constructor name matching class name', () => {
    const component = new TestComponent();
    expect(component.constructor.name).toBe('TestComponent');
  });
  
  test('should maintain instance properties when extending', () => {
    // Extend TestComponent further
    class ExtendedComponent extends TestComponent {
      extra: string;
      
      constructor(value: number = 0, extra: string = 'default') {
        super(value);
        this.extra = extra;
      }
    }
    
    const component = new ExtendedComponent(10, 'test');
    expect(component).toBeInstanceOf(Component);
    expect(component).toBeInstanceOf(TestComponent);
    expect(component).toBeInstanceOf(ExtendedComponent);
    expect(component.value).toBe(10);
    expect(component.extra).toBe('test');
  });
});