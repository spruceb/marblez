/**
 * Math utility functions for the game.
 */

/**
 * Clamp a value between min and max
 * @param value The value to clamp
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param a Start value
 * @param b End value
 * @param t Interpolation factor (0-1)
 * @returns The interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Get a random number between min and max
 * @param min Minimum value (inclusive)
 * @param max Maximum value (exclusive)
 * @returns Random number between min and max
 */
export function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Get a random integer between min and max
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random integer between min and max
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export function radToDeg(radians: number): number {
  return radians * 180 / Math.PI;
}