import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

// Add fog for atmosphere (less dense)
scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

// Renderer setup with improved quality
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance" 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// Camera setup for third-person view - zoomed out significantly
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 25); // Much further back and higher up
camera.lookAt(0, 0, 0);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Enhanced lighting setup
// Ambient light - increased to brighten the scene
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

// Create an even larger plane (floor) with grass texture
const planeSize = 100;
const planeGeometry = new THREE.PlaneGeometry(planeSize * 2, planeSize * 2, 32, 32);

// Create grass texture
const grassCanvas = document.createElement('canvas');
grassCanvas.width = 512;
grassCanvas.height = 512;
const grassCtx = grassCanvas.getContext('2d');

// Base green
grassCtx.fillStyle = '#4CAF50'; // Medium green
grassCtx.fillRect(0, 0, grassCanvas.width, grassCanvas.height);

// Add texture and pattern
for (let i = 0; i < 5000; i++) {
    // Random grass blade
    const x = Math.random() * grassCanvas.width;
    const y = Math.random() * grassCanvas.height;
    const size = 2 + Math.random() * 3;
    
    // Vary the green shades
    const greenValue = 100 + Math.floor(Math.random() * 155);
    const r = 20 + Math.floor(Math.random() * 50);
    const g = greenValue;
    const b = 20 + Math.floor(Math.random() * 50);
    
    grassCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    grassCtx.fillRect(x, y, size, size);
}

// Create occasional dirt patches
for (let i = 0; i < 30; i++) {
    const x = Math.random() * grassCanvas.width;
    const y = Math.random() * grassCanvas.height;
    const size = 5 + Math.random() * 20;
    
    const brownValue = 100 + Math.floor(Math.random() * 55);
    grassCtx.fillStyle = `rgb(${brownValue}, ${brownValue * 0.7}, ${brownValue * 0.4})`;
    grassCtx.beginPath();
    grassCtx.arc(x, y, size, 0, Math.PI * 2);
    grassCtx.fill();
}

const grassTexture = new THREE.CanvasTexture(grassCanvas);
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(8, 8);

const planeMaterial = new THREE.MeshStandardMaterial({ 
    map: grassTexture,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: false
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
plane.receiveShadow = true;
scene.add(plane);

// Add a boundary visual to indicate the edge of the platform
const boundaries = new THREE.Group();
scene.add(boundaries);

// Create four edges to mark the boundary
const boundaryMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff6666,
    roughness: 0.5,
    metalness: 0.3,
    emissive: 0xff6666,
    emissiveIntensity: 0.2
});

const boundaryGeometry = new THREE.BoxGeometry(planeSize * 2, 1, 1);
const boundaryTop = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
boundaryTop.position.set(0, 0.5, -planeSize);
boundaryTop.castShadow = true;
boundaryTop.receiveShadow = true;
boundaries.add(boundaryTop);

const boundaryBottom = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
boundaryBottom.position.set(0, 0.5, planeSize);
boundaryBottom.castShadow = true;
boundaryBottom.receiveShadow = true;
boundaries.add(boundaryBottom);

const boundaryLeft = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
boundaryLeft.position.set(-planeSize, 0.5, 0);
boundaryLeft.rotation.y = Math.PI / 2;
boundaryLeft.castShadow = true;
boundaryLeft.receiveShadow = true;
boundaries.add(boundaryLeft);

const boundaryRight = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
boundaryRight.position.set(planeSize, 0.5, 0);
boundaryRight.rotation.y = Math.PI / 2;
boundaryRight.castShadow = true;
boundaryRight.receiveShadow = true;
boundaries.add(boundaryRight);

// Create obstacles and structures on the field
const obstacles = new THREE.Group();
scene.add(obstacles);

// Colliders array to store all obstacle collision data
const colliders = [];
const bounceCoefficient = 0.5; // How much the marble bounces off obstacles

// Create brick texture for walls
const brickCanvas = document.createElement('canvas');
brickCanvas.width = 512;
brickCanvas.height = 512;
const brickCtx = brickCanvas.getContext('2d');

// Base brick color
brickCtx.fillStyle = '#a63c06'; // Brick red
brickCtx.fillRect(0, 0, brickCanvas.width, brickCanvas.height);

// Brick pattern
const brickWidth = 64;
const brickHeight = 32;
const mortarSize = 4;

for (let y = 0; y < brickCanvas.height; y += brickHeight) {
    const rowOffset = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2); // Offset every other row
    
    for (let x = 0; x < brickCanvas.width; x += brickWidth) {
        // Draw darker bricks with variation
        const r = 140 + Math.floor(Math.random() * 30);
        const g = 50 + Math.floor(Math.random() * 25);
        const b = 20 + Math.floor(Math.random() * 20);
        brickCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Draw brick with margins for mortar
        brickCtx.fillRect(
            x + rowOffset + mortarSize/2, 
            y + mortarSize/2, 
            brickWidth - mortarSize, 
            brickHeight - mortarSize
        );
    }
}

const brickTexture = new THREE.CanvasTexture(brickCanvas);
brickTexture.wrapS = THREE.RepeatWrapping;
brickTexture.wrapT = THREE.RepeatWrapping;

const brickMaterial = new THREE.MeshStandardMaterial({
    map: brickTexture,
    roughness: 0.9,
    metalness: 0.1
});

// 1. Create a ramp - using simple approach that works well with physics
const rampSize = 15;
const rampHeight = 5;
const rampLength = rampSize * 2;

// Simple ramp made from a box with rotation
const rampGeometry = new THREE.BoxGeometry(rampSize, rampHeight, rampLength);
const rampMesh = new THREE.Mesh(rampGeometry, brickMaterial);

// Position the ramp
rampMesh.position.set(-50, rampHeight/2, 0);

// Rotate to make a sloped ramp - 15 degree incline
const rampAngle = Math.PI * 0.08; // About 15 degrees
rampMesh.rotation.x = -rampAngle;

rampMesh.castShadow = true;
rampMesh.receiveShadow = true;
obstacles.add(rampMesh);

// Simple box collider with the same rotation
colliders.push({
    type: 'box',
    mesh: rampMesh,
    width: rampSize,
    height: rampHeight,
    depth: rampLength,
    position: rampMesh.position.clone(),
    rotation: rampMesh.rotation.clone(),
    isRamp: true // Mark as ramp for special physics
});

// 2. Create a series of walls/barriers
// Wall material with wood texture
const woodCanvas = document.createElement('canvas');
woodCanvas.width = 512;
woodCanvas.height = 512;
const woodCtx = woodCanvas.getContext('2d');

// Base wood color
woodCtx.fillStyle = '#8B4513'; // Brown
woodCtx.fillRect(0, 0, woodCanvas.width, woodCanvas.height);

// Wood grain
for (let i = 0; i < 50; i++) {
    const x = Math.random() * woodCanvas.width;
    const width = 1 + Math.random() * 3;
    
    woodCtx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
    woodCtx.lineWidth = width;
    woodCtx.beginPath();
    woodCtx.moveTo(x, 0);
    
    // Create wavy grain lines
    for (let y = 0; y < woodCanvas.height; y += 10) {
        const xOffset = Math.random() * 5 - 2.5;
        woodCtx.lineTo(x + xOffset, y);
    }
    
    woodCtx.stroke();
}

const woodTexture = new THREE.CanvasTexture(woodCanvas);
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;

const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8,
    metalness: 0.1
});

// Create a zigzag wall obstacle
const wallSegmentSize = 12;
const wallHeight = 2;
const wallThickness = 1;

for (let i = 0; i < 5; i++) {
    const xPos = 10 + i * (wallSegmentSize + 10);
    const zPos = 20 * Math.sin(i * Math.PI/2); // Zigzag pattern
    
    const wallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallSegmentSize);
    const wallMesh = new THREE.Mesh(wallGeometry, woodMaterial);
    wallMesh.position.set(xPos, wallHeight/2, zPos);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    obstacles.add(wallMesh);
    
    // Add wall to colliders
    colliders.push({
        type: 'box',
        mesh: wallMesh,
        width: wallThickness,
        height: wallHeight,
        depth: wallSegmentSize,
        position: wallMesh.position.clone(),
        rotation: wallMesh.rotation.clone()
    });
}

// 3. Create jumping platforms
const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeff00,  // Yellow
    roughness: 0.5,
    metalness: 0.5,
    emissive: 0xeeff00,
    emissiveIntensity: 0.2
});

// Create a series of platforms with increasing height
for (let i = 0; i < 4; i++) {
    const platformSize = 8 - i;
    const platformHeight = 1 + i * 2;
    
    const platformGeometry = new THREE.BoxGeometry(platformSize, 0.5, platformSize);
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
    platformMesh.position.set(-20, platformHeight, -30 + i * 10);
    platformMesh.castShadow = true;
    platformMesh.receiveShadow = true;
    obstacles.add(platformMesh);
    
    // Add platform to colliders with extra properties for friction
    colliders.push({
        type: 'box',
        mesh: platformMesh,
        width: platformSize,
        height: 0.5,
        depth: platformSize,
        position: platformMesh.position.clone(),
        rotation: platformMesh.rotation.clone(),
        friction: 0.05, // Add a specific friction value for platforms
        isJumpable: true // Mark as a surface we can jump from
    });
}

// Define the marble radius first since it's used in collision calculations
const marbleRadius = 0.8;

// 4. Create a ring to jump through
const ringRadius = 5;
const ringThickness = 1;
const ringGeometry = new THREE.TorusGeometry(ringRadius, ringThickness, 16, 32);
const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,  // Cyan
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x00ffff,
    emissiveIntensity: 0.3
});

const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
ringMesh.position.set(30, ringRadius + 1, -30);
ringMesh.rotation.x = Math.PI / 2; // Orient horizontally
ringMesh.castShadow = true;
ringMesh.receiveShadow = true;
obstacles.add(ringMesh);

// Add ring to colliders as a custom torus type
colliders.push({
    type: 'torus',
    mesh: ringMesh,
    radius: ringRadius,
    tube: ringThickness,
    position: ringMesh.position.clone(),
    rotation: ringMesh.rotation.clone(),
    // Precompute values for collision detection
    innerRadius: ringRadius - ringThickness - marbleRadius,
    outerRadius: ringRadius + ringThickness + marbleRadius
});

// Create a transparent blue marble
const marbleGeometry = new THREE.SphereGeometry(marbleRadius, 32, 32);

// Create a canvas for the marble texture
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

// Create texture from canvas
const marbleTexture = new THREE.CanvasTexture(canvas);

const marbleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1E90FF,           // Dodger blue
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.7,               // 70% transparent
    transmission: 0.5,          // Light passes through
    clearcoat: 0.5,             // Slight glossy coating
    map: marbleTexture          // Apply swirl texture
});

const marble = new THREE.Mesh(marbleGeometry, marbleMaterial);
marble.position.set(0, marbleRadius, 0); // Start at center
marble.castShadow = true;
marble.receiveShadow = true;
scene.add(marble);

// Marble movement - extremely slow acceleration (50% slower)
const marbleSpeed = 0.005; // Reduced by 50%
const airControlFactor = 0.3; // How much control the player has while in air (30%)
const marbleVelocity = { x: 0, z: 0, y: 0 };
const jumpPower = 0.4; // Initial jump velocity
const gravity = 0.015; // Slightly stronger gravity for better physics feel
const keys = {};
let isFalling = false;
let isJumping = false;
let isOnSurface = true; // Track if marble is on any surface
let respawnTimer = 0;

// Status text for debugging
const statusDisplay = document.createElement('div');
statusDisplay.style.position = 'absolute';
statusDisplay.style.top = '10px';
statusDisplay.style.left = '10px';
statusDisplay.style.color = 'white';
statusDisplay.style.fontFamily = 'monospace';
statusDisplay.style.fontSize = '14px';
statusDisplay.style.backgroundColor = 'rgba(0,0,0,0.5)';
statusDisplay.style.padding = '10px';
statusDisplay.style.zIndex = '1000';
document.body.appendChild(statusDisplay);

function updateStatus() {
    statusDisplay.innerHTML = `
        isOnSurface: ${isOnSurface} <br>
        isJumping: ${isJumping} <br>
        isFalling: ${isFalling} <br>
        Position: ${marble.position.x.toFixed(2)}, ${marble.position.y.toFixed(2)}, ${marble.position.z.toFixed(2)} <br>
        Velocity: ${marbleVelocity.x.toFixed(2)}, ${marbleVelocity.y.toFixed(2)}, ${marbleVelocity.z.toFixed(2)}
    `;
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Jump when spacebar is pressed and on any solid surface
    if (e.key === ' ') {
        console.log("Space pressed!", 
                    "isOnSurface:", isOnSurface, 
                    "isJumping:", isJumping,
                    "isFalling:", isFalling,
                    "position.y:", marble.position.y.toFixed(2));
                    
        if (isOnSurface && !isJumping) {
            console.log("JUMPING WITH POWER:", jumpPower);
            isJumping = true;
            isFalling = false;
            
            // Apply immediate upward force
            marbleVelocity.y = jumpPower;
            
            // Force the marble slightly up to prevent immediate ground detection
            marble.position.y += 0.05;
            
            // We're no longer on a surface when jumping
            isOnSurface = false;
        } else {
            console.log("Can't jump - not on surface or already jumping/falling");
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Camera control settings
const cameraOffset = new THREE.Vector3(0, 15, 25); // Base camera position
const cameraLerpFactor = 0.01; // Very slow camera movement
const cameraRotationSpeed = 0.05; // Speed of camera rotation
let cameraAngle = 0; // Current camera angle

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Track if we're using arrow keys for movement or camera
    const usingArrowLeftRight = (keys['ArrowLeft'] || keys['ArrowRight']) && !(keys['w'] || keys['s'] || keys['ArrowUp'] || keys['ArrowDown']);
    
    // Handle camera rotation (Q/E keys or left/right arrows when not moving)
    if (keys['q'] || (usingArrowLeftRight && keys['ArrowLeft'])) {
        cameraAngle -= cameraRotationSpeed;
    }
    if (keys['e'] || (usingArrowLeftRight && keys['ArrowRight'])) {
        cameraAngle += cameraRotationSpeed;
    }
    
    // Calculate movement direction based on camera angle
    // This allows the marble to move relative to the camera view
    const moveAngle = cameraAngle;
    const moveMatrix = new THREE.Matrix4().makeRotationY(moveAngle);
    const moveForward = new THREE.Vector3(0, 0, -1).applyMatrix4(moveMatrix);
    const moveRight = new THREE.Vector3(1, 0, 0).applyMatrix4(moveMatrix);
    
    // Prepare for movement calculations
    // We'll set isOnSurface later based on collision detection
    // Don't reset it here
    
    // Apply movement based on controls
    // Full speed on ground, reduced in air
    const currentSpeed = (isOnSurface && !isJumping) ? marbleSpeed : marbleSpeed * airControlFactor;
    
    if (keys['ArrowUp'] || keys['w']) {
        marbleVelocity.x += moveForward.x * currentSpeed;
        marbleVelocity.z += moveForward.z * currentSpeed;
    }
    if (keys['ArrowDown'] || keys['s']) {
        marbleVelocity.x -= moveForward.x * currentSpeed;
        marbleVelocity.z -= moveForward.z * currentSpeed;
    }
    // Only use Left/Right for movement if we're also moving forward/backward
    if ((keys['a'] || (keys['ArrowLeft'] && !usingArrowLeftRight))) {
        marbleVelocity.x -= moveRight.x * currentSpeed;
        marbleVelocity.z -= moveRight.z * currentSpeed;
    }
    if ((keys['d'] || (keys['ArrowRight'] && !usingArrowLeftRight))) {
        marbleVelocity.x += moveRight.x * currentSpeed;
        marbleVelocity.z += moveRight.z * currentSpeed;
    }
    
    // Apply different friction based on surface contact
    if (isOnSurface) {
        // More friction when on a surface
        marbleVelocity.x *= 0.97;
        marbleVelocity.z *= 0.97;
    } else {
        // Less friction when in air
        marbleVelocity.x *= 0.99;
        marbleVelocity.z *= 0.99;
    }
    
    // Calculate rotation based on velocity and radius (physics-based rolling)
    // For a rolling sphere, rotation = distance/radius
    const rotationFactor = 1 / marbleRadius;
    
    // Store previous position for collision resolution
    const prevPosition = {
        x: marble.position.x,
        y: marble.position.y,
        z: marble.position.z
    };
    
    // Update position based on velocity
    marble.position.x += marbleVelocity.x;
    marble.position.z += marbleVelocity.z;
    
    // RESET our surface detection once before all collision checks
    // This will be set to true by any collision that puts us on a surface
    isOnSurface = false;
    
    // Check for collisions with obstacles - this should set isOnSurface if we're on an obstacle
    checkCollisions(prevPosition);
    
    // Handle main platform collision - but don't interfere with jumping
    if (Math.abs(marble.position.x) <= planeSize && Math.abs(marble.position.z) <= planeSize) {
        // We're above the main platform (horizontally)
        
        // Only check for ground collision if we're not actively jumping upward
        // This prevents "snapping" to ground during early jump phase
        if (marble.position.y <= marbleRadius + 0.1 && (!isJumping || marbleVelocity.y <= 0)) {
            // We're touching or below the ground level
            isOnSurface = true;
            isFalling = false;
            
            // Only reset jumping state if we're moving downward
            if (marbleVelocity.y <= 0) {
                isJumping = false;
                
                // Apply small bounce when hitting the ground with some speed
                if (marbleVelocity.y < -0.05) {
                    marbleVelocity.y = -marbleVelocity.y * 0.3; // 30% bounce
                } else {
                    marbleVelocity.y = 0; // Just stop
                }
                
                // Set position exactly on ground to prevent clipping
                marble.position.y = marbleRadius;
                
                console.log("ON MAIN PLATFORM", marble.position.x.toFixed(2), marble.position.z.toFixed(2));
            }
        }
    } else if (marble.position.y <= marbleRadius + 0.1 && marbleVelocity.y <= 0) {
        // We're off the edge of the platform horizontally but at platform height
        // Only trigger falling if we're not already jumping upward
        if (!isJumping || marbleVelocity.y <= 0) {
            isFalling = true;
            isOnSurface = false;
            console.log("OFF PLATFORM EDGE", marble.position.x.toFixed(2), marble.position.z.toFixed(2));
        }
    }
    
    console.log("After ground check:", 
                "isOnSurface:", isOnSurface, 
                "isJumping:", isJumping, 
                "isFalling:", isFalling, 
                "position.y:", marble.position.y.toFixed(2),
                "velocity.y:", marbleVelocity.y.toFixed(2));
    
    // Handle vertical movement (jumping, falling, and gravity)
    if (!isOnSurface || isJumping || isFalling) {
        // Apply gravity only if not on a surface or during jumping/falling
        marbleVelocity.y -= gravity;
        
        // Apply vertical velocity directly to position
        marble.position.y += marbleVelocity.y;
        
        console.log("Applying vertical motion:",
                   "velocity.y:", marbleVelocity.y.toFixed(3),
                   "position.y:", marble.position.y.toFixed(3),
                   "jumping:", isJumping,
                   "falling:", isFalling);
        
        // If we're jumping but now moving downward
        if (isJumping && marbleVelocity.y < 0) {
            // Not actively jumping up anymore, but still in air
            isJumping = false;
            isFalling = true;
            console.log("Jump peak reached, now falling");
        }
        
        // Respawn when fallen far enough
        if (marble.position.y < -20) {
            respawnMarble();
        }
    } else {
        // We're on a surface, make sure y velocity is zeroed
        // But don't override a jump that was just initiated
        if (!isJumping) {
            marbleVelocity.y = 0;
        }
    }
    
    // Physics-based rotation for a rolling sphere
    // The rotation axis is perpendicular to the velocity vector
    marble.rotation.x += marbleVelocity.z * rotationFactor;
    marble.rotation.z -= marbleVelocity.x * rotationFactor;
    
    // Update camera position - simple follow with fixed offset
    updateCamera();
    
    // Update debug display
    updateStatus();
    
    renderer.render(scene, camera);
}

// Camera update function with orbital rotation
function updateCamera() {
    // Calculate camera position using the orbit angle
    // This creates a circular orbit around the marble
    const orbitX = Math.sin(cameraAngle) * cameraOffset.z;
    const orbitZ = Math.cos(cameraAngle) * cameraOffset.z;
    
    // Update camera position with orbital rotation
    camera.position.x = marble.position.x + orbitX;
    camera.position.y = marble.position.y + cameraOffset.y;
    camera.position.z = marble.position.z + orbitZ;
    
    // Always look directly at the marble
    camera.lookAt(marble.position);
}

// Respawn the marble at the center
function respawnMarble() {
    // Reset marble position and velocity
    marble.position.set(0, marbleRadius, 0);
    marbleVelocity.x = 0;
    marbleVelocity.y = 0;
    marbleVelocity.z = 0;
    marble.rotation.set(0, 0, 0);
    
    // Reset all state flags for proper physics
    isFalling = false;
    isJumping = false;
    isOnSurface = true;
    
    console.log("RESPAWNED - all state flags reset");
}

// Collision detection function
function checkCollisions(prevPosition) {
    // For each collider in our obstacles
    for (const collider of colliders) {
        let collision = false;
        let normal = { x: 0, y: 0, z: 0 }; // Direction to push the marble
        let frictionFactor = 0; // Default no extra friction
        let isJumpableSurface = false;
        
        if (collider.type === 'box') {
            // Transform marble position to the obstacle's local space to handle rotated objects
            const localMarblePos = new THREE.Vector3(
                marble.position.x - collider.position.x,
                marble.position.y - collider.position.y,
                marble.position.z - collider.position.z
            );
            
            // Apply inverse rotation if needed
            if (collider.rotation.x !== 0 || collider.rotation.y !== 0 || collider.rotation.z !== 0) {
                // Create matrix from rotation
                const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(collider.rotation);
                const invRotMatrix = rotMatrix.clone().invert();
                localMarblePos.applyMatrix4(invRotMatrix);
            }
            
            // Simple box collision test (AABB)
            const halfWidth = collider.width / 2;
            const halfHeight = collider.height / 2;
            const halfDepth = collider.depth / 2;
            
            // Check if marble is colliding with the box
            if (Math.abs(localMarblePos.x) < halfWidth + marbleRadius &&
                Math.abs(localMarblePos.y) < halfHeight + marbleRadius &&
                Math.abs(localMarblePos.z) < halfDepth + marbleRadius) {
                
                // Determine which face of the box was hit (find the minimum penetration)
                const penetrations = [
                    halfWidth + marbleRadius - Math.abs(localMarblePos.x), // x-axis
                    halfHeight + marbleRadius - Math.abs(localMarblePos.y), // y-axis
                    halfDepth + marbleRadius - Math.abs(localMarblePos.z)   // z-axis
                ];
                
                // Find minimum penetration axis
                const minPenetrationIndex = penetrations.indexOf(Math.min(...penetrations));
                
                // Calculate normal vector based on the hit face
                if (minPenetrationIndex === 0) { // x-axis collision
                    normal.x = localMarblePos.x > 0 ? 1 : -1;
                } else if (minPenetrationIndex === 1) { // y-axis collision
                    normal.y = localMarblePos.y > 0 ? 1 : -1;
                    
                    // If we hit the top face, note if it's a jumpable surface
                    if (normal.y > 0 && collider.isJumpable) {
                        isJumpableSurface = true;
                    }
                } else { // z-axis collision
                    normal.z = localMarblePos.z > 0 ? 1 : -1;
                }
                
                // If obstacle is rotated, transform normal back to world space
                if (collider.rotation.x !== 0 || collider.rotation.y !== 0 || collider.rotation.z !== 0) {
                    const normalVector = new THREE.Vector3(normal.x, normal.y, normal.z);
                    const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(collider.rotation);
                    normalVector.applyMatrix4(rotMatrix);
                    normal = { x: normalVector.x, y: normalVector.y, z: normalVector.z };
                }
                
                // Check if this collider has a custom friction property
                if (collider.friction !== undefined) {
                    frictionFactor = collider.friction;
                }
                
                collision = true;
            }
        } else if (collider.type === 'torus') {
            // Simplified torus collision that works better
            // Get distances from center of ring
            const dx = marble.position.x - collider.position.x;
            const dy = marble.position.y - collider.position.y;
            const dz = marble.position.z - collider.position.z;
            
            // Calculate horizontal distance to ring center
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);
            
            // Check if we're at the right height for the ring
            if (Math.abs(dy) < collider.tube + marbleRadius) {
                // Check if we're in the right radial distance for the ring
                // Skip collision if we're going through the hole
                const goingThroughHole = horizontalDist < collider.innerRadius;
                
                // If we're in the collision region (not through the hole)
                if (horizontalDist > collider.innerRadius && horizontalDist < collider.outerRadius) {
                    // Calculate closest point on the ring's center circle
                    const angle = Math.atan2(dz, dx);
                    const ringX = collider.position.x + Math.cos(angle) * collider.radius;
                    const ringZ = collider.position.z + Math.sin(angle) * collider.radius;
                    
                    // Calculate normal from ring center to marble
                    const normalX = marble.position.x - ringX;
                    const normalZ = marble.position.z - ringZ;
                    const normalLength = Math.sqrt(normalX * normalX + normalZ * normalZ);
                    
                    // Normalize
                    normal.x = normalX / normalLength;
                    normal.z = normalZ / normalLength;
                    
                    // If hitting from below or above, add Y component to normal
                    if (Math.abs(dy) > collider.tube * 0.5) {
                        normal.y = (dy > 0) ? 1 : -1;
                    }
                    
                    collision = true;
                    frictionFactor = 0.1; // Moderate friction for ring
                }
            }
        }
        
        // Handle collision response
        if (collision) {
            // Calculate dot product of velocity and normal to find velocity component along normal
            const dotProduct = 
                marbleVelocity.x * normal.x + 
                marbleVelocity.y * normal.y + 
                marbleVelocity.z * normal.z;
            
            // If we're moving toward the obstacle (dot product is negative)
            if (dotProduct < 0) {
                // Apply bounce effect by reflecting velocity along the normal
                marbleVelocity.x -= (1 + bounceCoefficient) * dotProduct * normal.x;
                marbleVelocity.y -= (1 + bounceCoefficient) * dotProduct * normal.y;
                marbleVelocity.z -= (1 + bounceCoefficient) * dotProduct * normal.z;
                
                // Move marble back to previous position and adjust based on normal
                // Use a smaller offset for non-vertical collisions to prevent sticking
                const offsetFactor = normal.y > 0.7 ? 0.01 : 0.001;
                marble.position.x = prevPosition.x + normal.x * offsetFactor;
                
                // Only adjust Y if we hit the top of an object, to allow for jumping on platforms
                if (normal.y > 0) {
                    marble.position.y = prevPosition.y + normal.y * offsetFactor;
                    
                    // If we landed on a surface with a positive normal.y, we're on a surface
                    if (normal.y > 0.1) { // Only count if normal is pointing somewhat upward
                        isOnSurface = true;
                        
                        // Stop jumping and falling when we hit a surface from above
                        if (marbleVelocity.y <= 0) {
                            isJumping = false;
                            isFalling = false;
                            
                            // Log that we detected a surface
                            console.log("Surface detected in collision!", 
                                        "normal:", normal.x.toFixed(2), normal.y.toFixed(2), normal.z.toFixed(2),
                                        "velocity:", marbleVelocity.y.toFixed(2));
                        }
                    }
                }
                
                marble.position.z = prevPosition.z + normal.z * offsetFactor;
                
                // Apply additional friction for this collision if the collider has friction
                if (frictionFactor > 0) {
                    // Apply friction only to horizontal movement
                    marbleVelocity.x *= (1 - frictionFactor);
                    marbleVelocity.z *= (1 - frictionFactor);
                }
                
                // For ramps, apply a special sliding force for gravity
                if (collider.isRamp) {
                    // Mark as on a surface since we can roll on ramps
                    // If the normal has a Y component, we're on the ramp surface
                    if (normal.y > 0.1) {
                        isOnSurface = true;
                        isFalling = false;
                        
                        // Only reset jumping state if we're moving downward
                        if (marbleVelocity.y <= 0) {
                            isJumping = false;
                        }
                        
                        console.log("ON RAMP SURFACE");
                    }
                    
                    // Get rotation of the ramp
                    const rampRotX = collider.rotation.x;
                    
                    // Simple sliding force down the ramp based on rotation
                    const slideForce = Math.sin(rampRotX) * gravity * 2.0;
                    
                    // Apply force in the direction of the ramp's slope
                    marbleVelocity.z += slideForce;
                    
                    // Very low friction on ramps
                    marbleVelocity.x *= 0.995;
                    marbleVelocity.z *= 0.995;
                }
            }
        }
    }
}

animate();