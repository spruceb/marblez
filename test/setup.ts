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
declare global {
  function createTestElement(id: string): HTMLElement;
}

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