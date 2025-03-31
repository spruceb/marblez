/**
 * Interface for key state tracking
 */
export interface KeyState {
  [key: string]: boolean;
}

/**
 * Manages keyboard input for the game
 */
export class InputManager {
  keys: KeyState;
  keysPressedThisFrame: Set<string>;
  keysReleasedThisFrame: Set<string>;
  
  /**
   * Create a new input manager
   */
  constructor() {
    this.keys = {};
    this.keysPressedThisFrame = new Set<string>();
    this.keysReleasedThisFrame = new Set<string>();
    
    // Setup event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  /**
   * Handle key down events
   * @param event The key down event
   */
  handleKeyDown(event: KeyboardEvent): void {
    // If key wasn't already down, add it to pressed this frame
    if (!this.keys[event.key]) {
      this.keysPressedThisFrame.add(event.key);
    }
    
    // Set key state to true
    this.keys[event.key] = true;
  }
  
  /**
   * Handle key up events
   * @param event The key up event
   */
  handleKeyUp(event: KeyboardEvent): void {
    // Set key state to false
    this.keys[event.key] = false;
    
    // Add to released this frame
    this.keysReleasedThisFrame.add(event.key);
  }
  
  /**
   * Check if a key is currently down
   * @param key The key to check
   * @returns True if the key is down, false otherwise
   */
  isKeyDown(key: string): boolean {
    return this.keys[key] === true;
  }
  
  /**
   * Check if a key was pressed this frame
   * @param key The key to check
   * @returns True if the key was pressed this frame, false otherwise
   */
  wasKeyPressed(key: string): boolean {
    return this.keysPressedThisFrame.has(key);
  }
  
  /**
   * Check if a key was released this frame
   * @param key The key to check
   * @returns True if the key was released this frame, false otherwise
   */
  wasKeyReleased(key: string): boolean {
    return this.keysReleasedThisFrame.has(key);
  }
  
  /**
   * Update the input manager for the current frame
   * Called once per frame to clear the pressed/released sets
   */
  update(): void {
    this.keysPressedThisFrame.clear();
    this.keysReleasedThisFrame.clear();
  }
}