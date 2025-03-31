import * as THREE from 'three';
import { COLORS } from './Constants.js';
import { random, randomInt } from './MathUtils.js';

/**
 * Generate a grass texture using HTML Canvas
 * @returns {THREE.Texture} The generated grass texture
 */
export function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base green - Using a proper RGB value for grass green
  const baseColor = { r: 76, g: 175, b: 80 }; // Medium green
  ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add texture and pattern
  for (let i = 0; i < 5000; i++) {
    // Random grass blade
    const x = random(0, canvas.width);
    const y = random(0, canvas.height);
    const size = random(2, 5);
    
    // Vary the green shades
    const greenValue = randomInt(100, 200);
    const r = randomInt(20, 100);
    const g = greenValue;
    const b = randomInt(20, 100);
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, y, size, size);
  }
  
  // Create occasional dirt patches
  for (let i = 0; i < 30; i++) {
    const x = random(0, canvas.width);
    const y = random(0, canvas.height);
    const size = random(5, 25);
    
    const brownValue = randomInt(100, 155);
    ctx.fillStyle = `rgb(${brownValue}, ${brownValue * 0.7}, ${brownValue * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  
  return texture;
}

/**
 * Generate a brick texture using HTML Canvas
 * @returns {THREE.Texture} The generated brick texture
 */
export function createBrickTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base brick color
  ctx.fillStyle = '#a63c06'; // Brick red
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Brick pattern
  const brickWidth = 64;
  const brickHeight = 32;
  const mortarSize = 4;
  
  for (let y = 0; y < canvas.height; y += brickHeight) {
    const rowOffset = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2); // Offset every other row
    
    for (let x = 0; x < canvas.width; x += brickWidth) {
      // Draw darker bricks with variation
      const r = randomInt(140, 170);
      const g = randomInt(50, 75);
      const b = randomInt(20, 40);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      
      // Draw brick with margins for mortar
      ctx.fillRect(
        x + rowOffset + mortarSize/2, 
        y + mortarSize/2, 
        brickWidth - mortarSize, 
        brickHeight - mortarSize
      );
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}

/**
 * Generate a wood texture using HTML Canvas
 * @returns {THREE.Texture} The generated wood texture
 */
export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base wood color
  ctx.fillStyle = '#8B4513'; // Brown
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Wood grain
  for (let i = 0; i < 50; i++) {
    const x = random(0, canvas.width);
    const width = random(1, 4);
    
    ctx.strokeStyle = `rgba(0, 0, 0, ${random(0, 0.2)})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    
    // Create wavy grain lines
    for (let y = 0; y < canvas.height; y += 10) {
      const xOffset = random(-2.5, 2.5);
      ctx.lineTo(x + xOffset, y);
    }
    
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}

/**
 * Generate a marble texture using HTML Canvas
 * @returns {THREE.Texture} The generated marble texture
 */
export function createMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Fill with transparent background
  ctx.fillStyle = 'rgba(30, 144, 255, 0.2)'; // Light blue base
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw swirl pattern in darker blue
  ctx.strokeStyle = 'rgba(0, 80, 255, 0.6)'; // Darker blue for swirls
  ctx.lineWidth = 8;
  ctx.beginPath();
  
  // Create swirl pattern
  for (let i = 0; i < 5; i++) {
    let radius = 20 + i * 20;
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 4; angle += 0.1) {
      const x = canvas.width/2 + Math.cos(angle + i) * radius * Math.sin(angle * 0.5);
      const y = canvas.height/2 + Math.sin(angle + i) * radius * Math.sin(angle * 0.5);
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      radius += 0.1;
    }
    ctx.stroke();
  }
  
  return new THREE.CanvasTexture(canvas);
}