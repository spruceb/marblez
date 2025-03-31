import { System } from '../engine/ecs/System';
import { Transform, Physics, Collider, Jump, Surface, MarbleTag } from '../components';
import { IEntity, IWorld } from '../types/ecs';
import { ICollisionSystem } from '../types/systems';
import { 
  ITransform, 
  IPhysics, 
  ICollider, 
  IJump, 
  ISurface 
} from '../types/components';
import * as THREE from 'three';
import { OBJECTS } from '../utils/Constants';

/**
 * Interface for collision detection result
 */
interface CollisionResult {
  collided: boolean;
  normal: THREE.Vector3;
  penetration: number;
}

/**
 * System that handles collision detection and response
 */
export class CollisionSystem extends System implements ICollisionSystem {
  /**
   * Create a new collision system
   * @param world The world this system operates in
   */
  constructor(world: IWorld) {
    super(world);
    this.requiredComponents = [Transform, Collider];
  }
  
  /**
   * Update collision detection and response
   * @param deltaTime Time in seconds since the last update
   */
  update(deltaTime: number): void {
    // Get all entities with colliders
    const entities = this.getEntities();
    
    // Find all marble entities (typically just one, but could support multiplayer)
    const marbles = this.world.getEntitiesWithComponents([MarbleTag, Transform, Collider, Physics]);
    
    // For each marble, check collisions with all other entities
    for (const marble of marbles) {
      const marbleTransform = marble.getComponent(Transform) as ITransform;
      const marbleCollider = marble.getComponent(Collider) as ICollider;
      const marblePhysics = marble.getComponent(Physics) as IPhysics;
      const marbleJump = marble.getComponent(Jump) as IJump | undefined;
      
      // Reset surface detection - will be set to true if any collision detected
      if (marbleJump) {
        marbleJump.isOnSurface = false;
      }
      
      marblePhysics.isOnGround = false;
      
      // Check collision with main platform boundaries
      this.checkBoundaryCollisions(marble, marbleTransform, marblePhysics, marbleJump);
      
      // Check collision with each entity
      for (const entity of entities) {
        // Skip collision with self
        if (entity.id === marble.id) continue;
        
        const entityTransform = entity.getComponent(Transform) as ITransform;
        const entityCollider = entity.getComponent(Collider) as ICollider;
        
        // Skip if either entity doesn't have required components
        if (!entityTransform || !entityCollider) continue;
        
        // Check collision based on collider types
        const collision = this.checkCollision(
          marbleTransform, marbleCollider,
          entityTransform, entityCollider
        );
        
        if (collision.collided) {
          const entitySurface = entity.getComponent(Surface) as ISurface | undefined;
          const entityPhysics = entity.getComponent(Physics) as IPhysics | undefined;
          
          this.resolveCollision(
            marble, marbleTransform, marbleCollider, marblePhysics, marbleJump,
            entity, entityTransform, entityCollider, entitySurface, entityPhysics,
            collision
          );
        }
      }
    }
  }
  
  /**
   * Check if the marble has fallen off the main platform
   * @param marble The marble entity
   * @param transform The marble's transform component
   * @param physics The marble's physics component
   * @param jump The marble's jump component
   */
  checkBoundaryCollisions(
    marble: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    jump: IJump | undefined
  ): void {
    // Check if we're within the main platform boundaries
    const platformSize = OBJECTS.PLATFORM_SIZE;
    
    if (Math.abs(transform.position.x) <= platformSize && 
        Math.abs(transform.position.z) <= platformSize) {
      
      // We're above the main platform (horizontally)
      // Check vertical collision with the ground (accounting for the floor at y=0)
      if (transform.position.y <= OBJECTS.MARBLE_RADIUS + 0.1) {
        // We're touching or below the ground level
        
        // Only reset jumping state if we're moving downward
        if (physics.velocity.y <= 0) {
          if (jump) {
            jump.isOnSurface = true;
            jump.isJumping = false;
            jump.isFalling = false;
          }
          
          physics.isOnGround = true;
          
          // Apply small bounce when hitting the ground
          if (physics.velocity.y < -0.05) {
            physics.velocity.y = -physics.velocity.y * physics.bounceCoefficient;
          } else {
            physics.velocity.y = 0;
          }
          
          // Set position exactly on ground to prevent clipping
          transform.position.y = OBJECTS.MARBLE_RADIUS;
          
          // Log that we're on the ground for debugging
          console.log("On main platform ground", transform.position.y.toFixed(2));
        }
      }
    } else if (transform.position.y < -20) {
      // We've fallen off the platform - respawn
      this.respawnMarble(marble, transform, physics, jump);
    }
  }
  
  /**
   * Respawn the marble at the center
   * @param marble The marble entity
   * @param transform The marble's transform component
   * @param physics The marble's physics component
   * @param jump The marble's jump component
   */
  respawnMarble(
    marble: IEntity, 
    transform: ITransform, 
    physics: IPhysics, 
    jump: IJump | undefined
  ): void {
    transform.position.set(0, OBJECTS.MARBLE_RADIUS, 0);
    physics.velocity.set(0, 0, 0);
    
    if (jump) {
      jump.isJumping = false;
      jump.isFalling = false;
      jump.isOnSurface = true;
    }
    
    physics.isOnGround = true;
    
    console.log("RESPAWNED - marble fell off the platform");
  }
  
  /**
   * Check for collision between two entities
   * @param transformA First entity's transform
   * @param colliderA First entity's collider
   * @param transformB Second entity's transform
   * @param colliderB Second entity's collider
   * @returns Collision result with collided flag and collision details
   */
  checkCollision(
    transformA: ITransform, 
    colliderA: ICollider, 
    transformB: ITransform, 
    colliderB: ICollider
  ): CollisionResult {
    const result: CollisionResult = {
      collided: false,
      normal: new THREE.Vector3(0, 0, 0),
      penetration: 0
    };
    
    // Sphere-Box collision
    if (colliderA.type === 'sphere' && colliderB.type === 'box') {
      return this.checkSphereBoxCollision(
        transformA.position, colliderA.params.radius,
        transformB.position, transformB.rotation,
        colliderB.params.width, colliderB.params.height, colliderB.params.depth
      );
    }
    // Box-Sphere collision (reversed)
    else if (colliderA.type === 'box' && colliderB.type === 'sphere') {
      return this.checkSphereBoxCollision(
        transformB.position, colliderB.params.radius,
        transformA.position, transformA.rotation,
        colliderA.params.width, colliderA.params.height, colliderA.params.depth
      );
    }
    // Sphere-Sphere collision
    else if (colliderA.type === 'sphere' && colliderB.type === 'sphere') {
      return this.checkSphereSphereCollision(
        transformA.position, colliderA.params.radius,
        transformB.position, colliderB.params.radius
      );
    }
    // Sphere-Torus collision
    else if (colliderA.type === 'sphere' && colliderB.type === 'torus') {
      return this.checkSphereTorusCollision(
        transformA.position, colliderA.params.radius,
        transformB.position, transformB.rotation,
        colliderB.params.radius, colliderB.params.tube
      );
    }
    // Torus-Sphere collision (reversed)
    else if (colliderA.type === 'torus' && colliderB.type === 'sphere') {
      return this.checkSphereTorusCollision(
        transformB.position, colliderB.params.radius,
        transformA.position, transformA.rotation,
        colliderA.params.radius, colliderA.params.tube
      );
    }
    
    return result;
  }
  
  /**
   * Check for collision between a sphere and a box
   * @param spherePos Sphere position
   * @param sphereRadius Sphere radius
   * @param boxPos Box position
   * @param boxRot Box rotation
   * @param boxWidth Box width
   * @param boxHeight Box height
   * @param boxDepth Box depth
   * @returns Collision result
   */
  private checkSphereBoxCollision(
    spherePos: THREE.Vector3, 
    sphereRadius: number, 
    boxPos: THREE.Vector3, 
    boxRot: THREE.Vector3, 
    boxWidth: number, 
    boxHeight: number, 
    boxDepth: number
  ): CollisionResult {
    const result: CollisionResult = {
      collided: false,
      normal: new THREE.Vector3(0, 0, 0),
      penetration: 0
    };
    
    // Transform sphere position to box local space to handle rotated boxes
    const localSpherePos = new THREE.Vector3(
      spherePos.x - boxPos.x,
      spherePos.y - boxPos.y,
      spherePos.z - boxPos.z
    );
    
    // Apply inverse rotation if needed
    if (boxRot.x !== 0 || boxRot.y !== 0 || boxRot.z !== 0) {
      // Create matrix from rotation
      const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(boxRot.x, boxRot.y, boxRot.z)
      );
      const invRotMatrix = rotMatrix.clone().invert();
      localSpherePos.applyMatrix4(invRotMatrix);
    }
    
    // Box half extents
    const halfWidth = boxWidth / 2;
    const halfHeight = boxHeight / 2;
    const halfDepth = boxDepth / 2;
    
    // Find closest point on box to sphere center
    const closestPoint = new THREE.Vector3(
      Math.max(-halfWidth, Math.min(halfWidth, localSpherePos.x)),
      Math.max(-halfHeight, Math.min(halfHeight, localSpherePos.y)),
      Math.max(-halfDepth, Math.min(halfDepth, localSpherePos.z))
    );
    
    // Check if the closest point is within the sphere
    const distance = localSpherePos.distanceTo(closestPoint);
    result.collided = distance < sphereRadius;
    
    if (result.collided) {
      // Calculate penetration depth
      result.penetration = sphereRadius - distance;
      
      // Calculate collision normal
      if (distance > 0) {
        result.normal.subVectors(localSpherePos, closestPoint).normalize();
      } else {
        // Sphere center is inside box, find closest face
        const dx = halfWidth - Math.abs(localSpherePos.x);
        const dy = halfHeight - Math.abs(localSpherePos.y);
        const dz = halfDepth - Math.abs(localSpherePos.z);
        
        // Find minimum penetration axis
        if (dx < dy && dx < dz) {
          result.normal.set(Math.sign(localSpherePos.x), 0, 0);
        } else if (dy < dx && dy < dz) {
          result.normal.set(0, Math.sign(localSpherePos.y), 0);
        } else {
          result.normal.set(0, 0, Math.sign(localSpherePos.z));
        }
      }
      
      // Transform normal back to world space if needed
      if (boxRot.x !== 0 || boxRot.y !== 0 || boxRot.z !== 0) {
        const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(
          new THREE.Euler(boxRot.x, boxRot.y, boxRot.z)
        );
        result.normal.applyMatrix4(rotMatrix);
      }
    }
    
    return result;
  }
  
  /**
   * Check for collision between two spheres
   * @param pos1 First sphere position
   * @param radius1 First sphere radius
   * @param pos2 Second sphere position
   * @param radius2 Second sphere radius
   * @returns Collision result
   */
  private checkSphereSphereCollision(
    pos1: THREE.Vector3, 
    radius1: number, 
    pos2: THREE.Vector3, 
    radius2: number
  ): CollisionResult {
    const result: CollisionResult = {
      collided: false,
      normal: new THREE.Vector3(0, 0, 0),
      penetration: 0
    };
    
    const radiusSum = radius1 + radius2;
    const distance = pos1.distanceTo(pos2);
    
    result.collided = distance < radiusSum;
    
    if (result.collided) {
      result.penetration = radiusSum - distance;
      
      // Calculate normal (from sphere2 to sphere1)
      if (distance > 0) {
        result.normal.subVectors(pos1, pos2).normalize();
      } else {
        // Spheres are at exactly the same position, use an arbitrary normal
        result.normal.set(0, 1, 0);
      }
    }
    
    return result;
  }
  
  /**
   * Check for collision between a sphere and a torus
   * @param spherePos Sphere position
   * @param sphereRadius Sphere radius
   * @param torusPos Torus position
   * @param torusRot Torus rotation
   * @param torusRadius Torus major radius
   * @param torusTube Torus tube radius
   * @returns Collision result
   */
  private checkSphereTorusCollision(
    spherePos: THREE.Vector3, 
    sphereRadius: number, 
    torusPos: THREE.Vector3, 
    torusRot: THREE.Vector3, 
    torusRadius: number, 
    torusTube: number
  ): CollisionResult {
    const result: CollisionResult = {
      collided: false,
      normal: new THREE.Vector3(0, 0, 0),
      penetration: 0
    };
    
    // Transform sphere to torus local space
    const localSpherePos = new THREE.Vector3(
      spherePos.x - torusPos.x,
      spherePos.y - torusPos.y,
      spherePos.z - torusPos.z
    );
    
    // Apply inverse rotation
    const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(torusRot.x, torusRot.y, torusRot.z)
    );
    const invRotMatrix = rotMatrix.clone().invert();
    localSpherePos.applyMatrix4(invRotMatrix);
    
    // Assuming torus is in XZ plane after rotation
    const sphereXZ = new THREE.Vector2(localSpherePos.x, localSpherePos.z);
    const distanceFromCenter = sphereXZ.length();
    
    // Check if sphere is passing through the hole
    const innerRadius = torusRadius - torusTube - sphereRadius;
    
    if (distanceFromCenter < innerRadius && Math.abs(localSpherePos.y) < torusTube + sphereRadius) {
      // We're going through the hole, no collision
      return result;
    }
    
    // Find closest point on torus circle center line to sphere center
    const closestPointOnCircle = new THREE.Vector2(0, 0);
    if (distanceFromCenter > 0) {
      closestPointOnCircle.copy(sphereXZ).normalize().multiplyScalar(torusRadius);
    }
    
    // Calculate closest point on torus surface
    const closestPoint = new THREE.Vector3(
      closestPointOnCircle.x,
      localSpherePos.y,
      closestPointOnCircle.y
    );
    
    // Adjust for torus tube
    const directionFromCircle = new THREE.Vector3(
      localSpherePos.x - closestPoint.x,
      localSpherePos.y - closestPoint.y,
      localSpherePos.z - closestPoint.z
    );
    
    if (directionFromCircle.length() > 0) {
      directionFromCircle.normalize();
      closestPoint.add(directionFromCircle.multiplyScalar(torusTube));
    }
    
    // Check collision
    const distance = localSpherePos.distanceTo(closestPoint);
    result.collided = distance < sphereRadius;
    
    if (result.collided) {
      result.penetration = sphereRadius - distance;
      
      // Calculate normal
      if (distance > 0) {
        result.normal.subVectors(localSpherePos, closestPoint).normalize();
      } else {
        // Default normal if distance is zero
        result.normal.set(0, 1, 0);
      }
      
      // Transform normal back to world space
      result.normal.applyMatrix4(rotMatrix);
    }
    
    return result;
  }
  
  /**
   * Resolve collision between entities
   * @param marbleEntity The marble entity
   * @param marbleTransform The marble's transform
   * @param marbleCollider The marble's collider
   * @param marblePhysics The marble's physics
   * @param marbleJump The marble's jump component
   * @param otherEntity The other entity
   * @param otherTransform The other entity's transform
   * @param otherCollider The other entity's collider
   * @param otherSurface The other entity's surface
   * @param otherPhysics The other entity's physics
   * @param collision Collision details
   */
  private resolveCollision(
    marbleEntity: IEntity, 
    marbleTransform: ITransform, 
    marbleCollider: ICollider, 
    marblePhysics: IPhysics, 
    marbleJump: IJump | undefined,
    otherEntity: IEntity, 
    otherTransform: ITransform, 
    otherCollider: ICollider, 
    otherSurface: ISurface | undefined, 
    otherPhysics: IPhysics | undefined,
    collision: CollisionResult
  ): void {
    // Skip trigger colliders
    if (otherCollider.isTrigger) return;
    
    // Get collision normal and penetration
    const normal = collision.normal;
    const penetration = collision.penetration;
    
    // Calculate dot product of velocity and normal
    const relativeVelocity = new THREE.Vector3(
      marblePhysics.velocity.x - (otherPhysics ? otherPhysics.velocity.x : 0),
      marblePhysics.velocity.y - (otherPhysics ? otherPhysics.velocity.y : 0),
      marblePhysics.velocity.z - (otherPhysics ? otherPhysics.velocity.z : 0)
    );
    
    const dotProduct = relativeVelocity.dot(normal);
    
    // Only resolve if objects are moving toward each other
    if (dotProduct < 0) {
      // Calculate bounce coefficient
      const bounceFactor = Math.min(
        marblePhysics.bounceCoefficient,
        otherSurface ? otherSurface.bounciness : marblePhysics.bounceCoefficient
      );
      
      // Apply impulse
      const impulse = -(1 + bounceFactor) * dotProduct;
      
      // Apply impulse to velocity
      marblePhysics.velocity.x += impulse * normal.x;
      marblePhysics.velocity.y += impulse * normal.y;
      marblePhysics.velocity.z += impulse * normal.z;
      
      // Resolve penetration (move marble out of collision)
      marbleTransform.position.x += normal.x * penetration;
      marbleTransform.position.y += normal.y * penetration;
      marbleTransform.position.z += normal.z * penetration;
      
      // Check if this is a ground collision (normal pointing up)
      if (normal.y > 0.1) { // Slight tolerance to handle minor slopes
        if (marbleJump) {
          marbleJump.isOnSurface = true;
          marbleJump.isFalling = false;
          
          // Only cancel jumping if we're moving downward
          if (marblePhysics.velocity.y <= 0) {
            marbleJump.isJumping = false;
          }
        }
        
        marblePhysics.isOnGround = true;
        
        // Apply friction from the surface
        const frictionFactor = otherSurface ? otherSurface.friction : marblePhysics.friction;
        marblePhysics.velocity.x *= frictionFactor;
        marblePhysics.velocity.z *= frictionFactor;
        
        // Handle ramp sliding
        if (otherSurface && otherSurface.isRamp) {
          // Apply slide force based on ramp angle
          const slideForce = Math.sin(otherSurface.rampAngle) * 
                          marblePhysics.gravity * 
                          otherSurface.slideFactor;
          
          // Apply force in the direction of the ramp's slope
          marblePhysics.velocity.z += slideForce;
        }
      }
    }
  }
}