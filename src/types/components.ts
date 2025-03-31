import * as THREE from 'three';
import { IComponent } from './ecs';

/**
 * Interface for the Transform component (position, rotation, scale)
 */
export interface ITransform extends IComponent {
  position: THREE.Vector3;
  rotation: THREE.Vector3;
  scale: THREE.Vector3;
  previousPosition: THREE.Vector3;
  
  /**
   * Save the current position as previous position
   */
  savePreviousPosition(): void;
}

/**
 * Interface for physics properties
 */
export interface IPhysics extends IComponent {
  velocity: THREE.Vector3;
  mass: number;
  gravity: number;
  friction: number;
  airFriction: number;
  bounceCoefficient: number;
  isOnGround: boolean;
  isStatic: boolean;
}

/**
 * Interface for visual representation
 */
export interface IRender extends IComponent {
  mesh: THREE.Mesh | THREE.Group;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  
  /**
   * Apply shadow settings to a mesh or group
   * @param object The object to apply settings to
   */
  applySettings(object: THREE.Object3D): void;
}

/**
 * Types of colliders supported by the system
 */
export type ColliderType = 'box' | 'sphere' | 'torus';

/**
 * Interface for collision detection
 */
export interface ICollider extends IComponent {
  type: ColliderType;
  params: Record<string, any>;
  isTrigger: boolean;
  bounce: number;
  debugMesh: THREE.Mesh | null;
  debugVisible: boolean;
  
  /**
   * Create a debug visualization mesh for this collider
   * @param scene The scene to add the debug mesh to
   */
  createDebugMesh(scene: THREE.Scene): void;
  
  /**
   * Show or hide the debug visualization
   * @param visible Whether the debug mesh should be visible
   * @param scene The scene containing the debug mesh
   */
  setDebugVisible(visible: boolean, scene: THREE.Scene): void;
}

/**
 * Interface for jump behavior
 */
export interface IJump extends IComponent {
  jumpPower: number;
  isJumping: boolean;
  isFalling: boolean;
  isOnSurface: boolean;
  jumpRequested: boolean;
  canJump: boolean;
  jumpCooldown: number;
  jumpCooldownTime: number;
  
  /**
   * Request a jump to be executed on the next physics update
   */
  requestJump(): void;
  
  /**
   * Execute the jump if one was requested
   * @returns True if a jump was executed, false otherwise
   */
  executeJumpIfRequested(): boolean;
  
  /**
   * Update jump cooldown timer
   * @param deltaTime Time in seconds since the last update
   */
  updateCooldown(deltaTime: number): void;
}

/**
 * Interface for player input and control
 */
export interface IPlayerControl extends IComponent {
  speed: number;
  airControlFactor: number;
  moveDirection: { x: number, z: number };
  jumpRequested: boolean;
  
  /**
   * Set the movement direction based on input
   * @param keys Object with key states
   * @param cameraAngle Current camera rotation angle
   */
  setMoveDirection(keys: Record<string, boolean>, cameraAngle: number): void;
}

/**
 * Interface for camera control
 */
export interface ICamera extends IComponent {
  offset: THREE.Vector3;
  rotationSpeed: number;
  angle: number;
  height: number;
  distance: number;
}

/**
 * Interface for surface properties
 */
export interface ISurface extends IComponent {
  friction: number;
  bounciness: number;
  isJumpable: boolean;
  isRamp: boolean;
  rampAngle: number;
  slideFactor: number;
}

/**
 * Tag component interfaces
 */
export interface IMarbleTag extends IComponent {}
export interface IPlatformTag extends IComponent {}
export interface IObstacleTag extends IComponent {}
export interface IRampTag extends IComponent {}
export interface IRingTag extends IComponent {}
export interface IWallTag extends IComponent {}
export interface IJumpPlatformTag extends IComponent {}