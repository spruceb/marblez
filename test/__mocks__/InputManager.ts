import { KeyState } from '../../src/engine/InputManager';

/**
 * Mock implementation of InputManager for testing
 */
export class MockInputManager {
  keys: KeyState;
  keysPressedThisFrame: Set<string>;
  keysReleasedThisFrame: Set<string>;
  
  constructor() {
    this.keys = {};
    this.keysPressedThisFrame = new Set<string>();
    this.keysReleasedThisFrame = new Set<string>();
  }
  
  /**
   * Simulate pressing a key
   * @param key The key to press
   */
  simulateKeyDown(key: string): void {
    if (!this.keys[key]) {
      this.keysPressedThisFrame.add(key);
    }
    
    this.keys[key] = true;
  }
  
  /**
   * Simulate releasing a key
   * @param key The key to release
   */
  simulateKeyUp(key: string): void {
    this.keys[key] = false;
    this.keysReleasedThisFrame.add(key);
  }
  
  /**
   * Check if a key is currently down
   * @param key The key to check
   */
  isKeyDown(key: string): boolean {
    return this.keys[key] === true;
  }
  
  /**
   * Check if a key was pressed this frame
   * @param key The key to check
   */
  wasKeyPressed(key: string): boolean {
    return this.keysPressedThisFrame.has(key);
  }
  
  /**
   * Check if a key was released this frame
   * @param key The key to check
   */
  wasKeyReleased(key: string): boolean {
    return this.keysReleasedThisFrame.has(key);
  }
  
  /**
   * Update the input manager for the current frame
   */
  update(): void {
    this.keysPressedThisFrame.clear();
    this.keysReleasedThisFrame.clear();
  }
}