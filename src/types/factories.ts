import { IEntity, IWorld } from './ecs';
import * as THREE from 'three';

/**
 * Interface for the marble factory
 */
export interface IMarbleFactory {
  /**
   * Create a marble entity
   * @param world The world to create the entity in
   * @param position The initial position of the marble
   * @param radius The radius of the marble
   * @param color The color of the marble
   * @returns The created marble entity
   */
  createMarble(
    world: IWorld, 
    position: THREE.Vector3,
    radius: number,
    color: number
  ): IEntity;
}

/**
 * Interface for the platform factory
 */
export interface IPlatformFactory {
  /**
   * Create a platform entity
   * @param world The world to create the entity in
   * @param position The position of the platform
   * @param width The width of the platform
   * @param height The height of the platform
   * @param depth The depth of the platform
   * @param color The color of the platform
   * @returns The created platform entity
   */
  createPlatform(
    world: IWorld,
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    color: number
  ): IEntity;
  
  /**
   * Create a ramp entity
   * @param world The world to create the entity in
   * @param position The position of the ramp
   * @param width The width of the ramp
   * @param height The height of the ramp
   * @param depth The depth of the ramp
   * @param rotation The rotation of the ramp
   * @param color The color of the ramp
   * @param slideFactor The slide factor of the ramp (how slippery it is)
   * @returns The created ramp entity
   */
  createRamp(
    world: IWorld,
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    rotation: THREE.Vector3,
    color: number,
    slideFactor?: number
  ): IEntity;
}

/**
 * Interface for the obstacle factory
 */
export interface IObstacleFactory {
  /**
   * Create a box obstacle entity
   * @param world The world to create the entity in
   * @param position The position of the obstacle
   * @param width The width of the obstacle
   * @param height The height of the obstacle
   * @param depth The depth of the obstacle
   * @param color The color of the obstacle
   * @param isStatic Whether the obstacle is static or dynamic
   * @returns The created obstacle entity
   */
  createBoxObstacle(
    world: IWorld,
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    color: number,
    isStatic?: boolean
  ): IEntity;
  
  /**
   * Create a sphere obstacle entity
   * @param world The world to create the entity in
   * @param position The position of the obstacle
   * @param radius The radius of the obstacle
   * @param color The color of the obstacle
   * @param isStatic Whether the obstacle is static or dynamic
   * @returns The created obstacle entity
   */
  createSphereObstacle(
    world: IWorld,
    position: THREE.Vector3,
    radius: number,
    color: number,
    isStatic?: boolean
  ): IEntity;
  
  /**
   * Create a torus obstacle entity
   * @param world The world to create the entity in
   * @param position The position of the obstacle
   * @param radius The radius of the torus
   * @param tube The tube radius of the torus
   * @param rotation The rotation of the torus
   * @param color The color of the obstacle
   * @returns The created obstacle entity
   */
  createTorusObstacle(
    world: IWorld,
    position: THREE.Vector3,
    radius: number,
    tube: number,
    rotation: THREE.Vector3,
    color: number
  ): IEntity;
}