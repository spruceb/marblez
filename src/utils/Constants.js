/**
 * Game physics constants
 */
export const PHYSICS = {
  GRAVITY: 0.015,
  MARBLE_SPEED: 0.005,
  JUMP_POWER: 0.4,
  AIR_CONTROL_FACTOR: 0.3,
  GROUND_FRICTION: 0.97,
  AIR_FRICTION: 0.99,
  BOUNCE_COEFFICIENT: 0.3
};

/**
 * Game object constants
 */
export const OBJECTS = {
  MARBLE_RADIUS: 0.8,
  PLATFORM_SIZE: 100,
  RAMP_SIZE: 15,
  RAMP_HEIGHT: 5,
  RAMP_ANGLE: Math.PI * 0.08,
  WALL_HEIGHT: 2,
  WALL_THICKNESS: 1,
  RING_RADIUS: 5,
  RING_THICKNESS: 1
};

/**
 * Camera settings
 */
export const CAMERA = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 0, y: 15, z: 25 },
  ROTATION_SPEED: 0.05,
  LERP_FACTOR: 0.01
};

/**
 * Colors
 */
export const COLORS = {
  SKY: 0x87ceeb,
  MARBLE: 0x1E90FF,
  PLATFORM: 0x4CAF50,
  RAMP: 0xa63c06,
  WALL: 0x8B4513,
  RING: 0x00ffff,
  BOUNDARY: 0xff6666,
  JUMP_PLATFORM: 0xeeff00
};