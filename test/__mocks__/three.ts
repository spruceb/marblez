export class Vector3 {
  x: number;
  y: number;
  z: number;
  
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  
  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  
  equals(v: Vector3) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }
  
  distanceTo(v: Vector3) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (length > 0) {
      this.x /= length;
      this.y /= length;
      this.z /= length;
    }
    return this;
  }
  
  subVectors(a: Vector3, b: Vector3) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }
  
  toArray() {
    return [this.x, this.y, this.z];
  }
  
  applyMatrix4(matrix: Matrix4) {
    // Simplified implementation
    return this;
  }
  
  add(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  
  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }
}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

export class Euler {
  x: number;
  y: number;
  z: number;
  
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

export class Matrix4 {
  elements: number[];
  
  constructor() {
    this.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
  
  makeRotationFromEuler(euler: Euler) {
    // Simplified mock implementation
    return this;
  }
  
  invert() {
    // Simplified mock implementation
    return this;
  }
  
  clone() {
    const m = new Matrix4();
    m.elements = [...this.elements];
    return m;
  }
}

export class Vector2 {
  x: number;
  y: number;
  
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  
  normalize() {
    const length = this.length();
    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }
    return this;
  }
  
  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }
  
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }
}

export const DoubleSide = 0;
export const RepeatWrapping = 1000;

export class MeshStandardMaterial {
  color: number | Color;
  roughness: number;
  metalness: number;
  map: any;
  
  constructor(params: any = {}) {
    this.color = params.color !== undefined ? params.color : 0xffffff;
    this.roughness = params.roughness !== undefined ? params.roughness : 0.5;
    this.metalness = params.metalness !== undefined ? params.metalness : 0.5;
    this.map = params.map || null;
  }
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {
  transmission: number;
  clearcoat: number;
  transparent: boolean;
  opacity: number;
  
  constructor(params: any = {}) {
    super(params);
    this.transmission = params.transmission || 0;
    this.clearcoat = params.clearcoat || 0;
    this.transparent = params.transparent || false;
    this.opacity = params.opacity !== undefined ? params.opacity : 1.0;
  }
}

export class Mesh {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  castShadow: boolean;
  receiveShadow: boolean;
  geometry: any;
  material: any;
  parent: any;
  
  constructor(geometry: any, material: any) {
    this.geometry = geometry;
    this.material = material;
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.castShadow = false;
    this.receiveShadow = false;
    this.parent = null;
  }
}

export class Object3D {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  parent: any;
  children: Object3D[];
  
  constructor() {
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.parent = null;
    this.children = [];
  }
  
  add(object: any) {
    if (object === this) return;
    if (object.parent !== null) {
      object.parent.remove(object);
    }
    
    object.parent = this;
    this.children.push(object);
    
    return this;
  }
  
  remove(object: any) {
    const index = this.children.indexOf(object);
    
    if (index !== -1) {
      object.parent = null;
      this.children.splice(index, 1);
    }
    
    return this;
  }
  
  lookAt(v: Vector3) {
    // Simplified implementation
  }
}

export class Scene extends Object3D {
  constructor() {
    super();
  }
}

export class Camera extends Object3D {
  constructor() {
    super();
  }
}

export class PerspectiveCamera extends Camera {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
}

export class WebGLRenderer {
  domElement: HTMLCanvasElement;
  shadowMap: {enabled: boolean};
  
  constructor(params: any = {}) {
    this.domElement = document.createElement('canvas');
    this.shadowMap = {
      enabled: false
    };
  }
  
  setSize(width: number, height: number) {}
  setPixelRatio(ratio: number) {}
  render(scene: Scene, camera: Camera) {}
}

// Simple geometries
export class BoxGeometry {
  parameters: {
    width: number;
    height: number;
    depth: number;
  };
  
  constructor(width = 1, height = 1, depth = 1) {
    this.parameters = { width, height, depth };
  }
}

export class SphereGeometry {
  parameters: {
    radius: number;
  };
  
  constructor(radius = 1) {
    this.parameters = { radius };
  }
}

export class TorusGeometry {
  parameters: {
    radius: number;
    tube: number;
  };
  
  constructor(radius = 1, tube = 0.4) {
    this.parameters = { radius, tube };
  }
}

export class PlaneGeometry {
  parameters: {
    width: number;
    height: number;
  };
  
  constructor(width = 1, height = 1) {
    this.parameters = { width, height };
  }
}

export class CanvasTexture {
  wrapS: number;
  wrapT: number;
  repeat: Vector2;
  
  constructor(canvas: HTMLCanvasElement) {
    this.wrapS = 0;
    this.wrapT = 0;
    this.repeat = new Vector2(1, 1);
  }
}

export class Color {
  r: number;
  g: number;
  b: number;
  
  constructor(color?: number) {
    this.r = 1;
    this.g = 1;
    this.b = 1;
  }
}

export const AmbientLight = jest.fn().mockImplementation((color, intensity) => {
  return {
    color,
    intensity,
    isLight: true,
    type: 'AmbientLight'
  };
});

export const DirectionalLight = jest.fn().mockImplementation((color, intensity) => {
  return {
    color,
    intensity,
    position: new Vector3(),
    target: { position: new Vector3() },
    castShadow: false,
    shadow: {
      mapSize: { width: 0, height: 0 },
      camera: { left: 0, right: 0, top: 0, bottom: 0, near: 0, far: 0, updateProjectionMatrix: jest.fn() }
    },
    isLight: true,
    type: 'DirectionalLight'
  };
});

export const PCFSoftShadowMap = 1;

// Helper for Euler creation
export function makeEuler(x: number, y: number, z: number): Euler {
  return new Euler(x, y, z);
}