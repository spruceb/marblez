import { ISystem, IEntity } from './ecs';
import { 
  ITransform, 
  IPhysics, 
  IRender, 
  ICollider, 
  IJump, 
  IPlayerControl, 
  ICamera 
} from './components';
import * as THREE from 'three';

/**
 * Interface for the input handling system
 */
export interface IInputSystem extends ISystem {
  inputManager: any; // Will define InputManager separately
}

/**
 * Interface for the physics system
 */
export interface IPhysicsSystem extends ISystem {
  /**
   * Process player movement from input
   */
  processPlayerMovement(
    entity: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    playerControl: IPlayerControl, 
    deltaTime: number
  ): void;
  
  /**
   * Process jumping behavior
   */
  processJumping(
    entity: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    jump: IJump, 
    deltaTime: number
  ): void;
}

/**
 * Interface for the collision detection system
 */
export interface ICollisionSystem extends ISystem {
  /**
   * Check for collisions with the main platform boundaries
   */
  checkBoundaryCollisions(
    marble: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    jump: IJump | undefined
  ): void;
  
  /**
   * Respawn the marble at the center
   */
  respawnMarble(
    marble: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    jump: IJump | undefined
  ): void;
  
  /**
   * Check for collision between two entities
   */
  checkCollision(
    transformA: ITransform, 
    colliderA: ICollider, 
    transformB: ITransform, 
    colliderB: ICollider
  ): { collided: boolean, normal: THREE.Vector3, penetration: number };
}

/**
 * Interface for the rendering system
 */
export interface IRenderSystem extends ISystem {
  scene: THREE.Scene;
  
  /**
   * Update marble rotation based on physics for rolling effect
   */
  updateMarbleRotation(
    entity: IEntity, 
    transform: ITransform, 
    render: IRender, 
    physics: IPhysics, 
    deltaTime: number
  ): void;
}

/**
 * Interface for the camera system
 */
export interface ICameraSystem extends ISystem {
  threeCamera: THREE.Camera;
  
  /**
   * Update camera position and rotation for a specific entity
   */
  updateCameraForEntity(entity: IEntity, deltaTime: number): void;
}

/**
 * Interface for the jump system
 */
export interface IJumpSystem extends ISystem {}

/**
 * Interface for the debug system
 */
export interface IDebugSystem extends ISystem {
  debugElement: HTMLElement;
  frameCount: number;
  lastTime: number;
  fps: number;
}