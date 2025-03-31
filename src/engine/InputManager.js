/**
 * Manages keyboard input for the game
 */
export class InputManager {
  /**
   * Create a new input manager
   */
  constructor() {
    this.keys = {};
    this.keysPressedThisFrame = new Set();
    this.keysReleasedThisFrame = new Set();
    
    // Setup event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  /**
   * Handle key down events
   * @param {KeyboardEvent} event - The key down event
   */
  handleKeyDown(event) {
    // If key wasn't already down, add it to pressed this frame
    if (!this.keys[event.key]) {
      this.keysPressedThisFrame.add(event.key);
    }
    
    // Set key state to true
    this.keys[event.key] = true;
  }
  
  /**
   * Handle key up events
   * @param {KeyboardEvent} event - The key up event
   */
  handleKeyUp(event) {
    // Set key state to false
    this.keys[event.key] = false;
    
    // Add to released this frame
    this.keysReleasedThisFrame.add(event.key);
  }
  
  /**
   * Check if a key is currently down
   * @param {string} key - The key to check
   * @returns {boolean} True if the key is down, false otherwise
   */
  isKeyDown(key) {
    return this.keys[key] === true;
  }
  
  /**
   * Check if a key was pressed this frame
   * @param {string} key - The key to check
   * @returns {boolean} True if the key was pressed this frame, false otherwise
   */
  wasKeyPressed(key) {
    return this.keysPressedThisFrame.has(key);
  }
  
  /**
   * Check if a key was released this frame
   * @param {string} key - The key to check
   * @returns {boolean} True if the key was released this frame, false otherwise
   */
  wasKeyReleased(key) {
    return this.keysReleasedThisFrame.has(key);
  }
  
  /**
   * Update the input manager for the current frame
   * Called once per frame to clear the pressed/released sets
   */
  update() {
    this.keysPressedThisFrame.clear();
    this.keysReleasedThisFrame.clear();
  }
}