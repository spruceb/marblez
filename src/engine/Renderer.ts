import * as THREE from 'three';
import { CAMERA, COLORS } from '../utils/Constants';

/**
 * Renderer setup result
 */
export interface RendererSetup {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

/**
 * Initialize a Three.js renderer, scene, and camera
 * @returns The created renderer, scene, and camera
 */
export function initializeRenderer(): RendererSetup {
  // Create the scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.SKY);
  scene.fog = new THREE.FogExp2(COLORS.SKY, 0.005);
  
  // Create the renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.body.appendChild(renderer.domElement);
  
  // Create the camera
  const camera = new THREE.PerspectiveCamera(
    CAMERA.FOV,
    window.innerWidth / window.innerHeight,
    CAMERA.NEAR,
    CAMERA.FAR
  );
  camera.position.set(CAMERA.POSITION.x, CAMERA.POSITION.y, CAMERA.POSITION.z);
  camera.lookAt(0, 0, 0);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  return { renderer, scene, camera };
}

/**
 * Set up lights for the scene
 * @param scene The scene to add lights to
 */
export function setupLights(scene: THREE.Scene): void {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  // Main directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(100, 200, 100);
  directionalLight.castShadow = true;
  
  // Improved shadow quality
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  directionalLight.shadow.bias = -0.0005;
  scene.add(directionalLight);
  
  // Add a hemisphere light for more realistic outdoor lighting
  const hemisphereLight = new THREE.HemisphereLight(0xadd8e6, 0xffffff, 0.8);
  scene.add(hemisphereLight);
  
  // Fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0xffd0b0, 0.6);
  fillLight.position.set(-100, 40, -100);
  scene.add(fillLight);
}