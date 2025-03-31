import { Component } from '../engine/ecs/Component';
import { 
  IMarbleTag, 
  IPlatformTag, 
  IObstacleTag, 
  IRampTag, 
  IRingTag, 
  IWallTag, 
  IJumpPlatformTag 
} from '../types/components';

/**
 * Tag component for the player marble
 */
export class MarbleTag extends Component implements IMarbleTag {}

/**
 * Tag component for platforms
 */
export class PlatformTag extends Component implements IPlatformTag {}

/**
 * Tag component for obstacles
 */
export class ObstacleTag extends Component implements IObstacleTag {}

/**
 * Tag component for ramps
 */
export class RampTag extends Component implements IRampTag {}

/**
 * Tag component for rings
 */
export class RingTag extends Component implements IRingTag {}

/**
 * Tag component for walls/barriers
 */
export class WallTag extends Component implements IWallTag {}

/**
 * Tag component for jump platforms
 */
export class JumpPlatformTag extends Component implements IJumpPlatformTag {}