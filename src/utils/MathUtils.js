/**
 * Math utility functions for the game.
 */

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} The interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Get a random number between min and max
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number between min and max
 */
export function random(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Get a random integer between min and max
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 */
export function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
  return radians * 180 / Math.PI;
}