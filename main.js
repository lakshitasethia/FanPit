import * as THREE from 'three';

// ── DOM & Setup ──
const canvas = document.getElementById('heroCanvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Colors
const NEON = new THREE.Color(0x00ff87);
const BLUE = new THREE.Color(0x4361ee);
const BG = new THREE.Color(0x0a0a0f);

// ── Preloader ──
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloaderBar');
let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 15 + 5;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    setTimeout(() => preloader.classList.add('hidden'), 400);
  }
  preloaderBar.style.width = loadProgress + '%';
}, 200);

// ── Match Time \& Stats Ticker ──
let matchSec = 78 * 60 + 24;
const timeEl = document.getElementById('matchTime');
const possessionEl = document.getElementById('matchPossession');
const shotsEl = document.getElementById('matchShots');

let possessionHome = 54;
let shotsHome = 14;
let shotsAway = 9;

setInterval(() => {
  // Tick clock
  matchSec++;
  const m = Math.floor(matchSec / 60);
  const s = matchSec % 60;
  if (timeEl) timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

  // Randomly fluctuate possession slightly every 3 seconds
  if (matchSec % 3 === 0 && possessionEl) {
    if (Math.random() > 0.5 && possessionHome < 65) possessionHome++;
    else if (possessionHome > 35) possessionHome--;
    possessionEl.textContent = `${possessionHome}% — ${100 - possessionHome}%`;
  }

  // Very occasionally add a shot
  if (Math.random() > 0.95 && shotsEl) {
    if (Math.random() > 0.4) {
      shotsHome++;
    } else {
      shotsAway++;
    }
    shotsEl.textContent = `${shotsHome} — ${shotsAway}`;
  }
}, 1000);

// ── Lighting ──
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(NEON, 10, 20, Math.PI / 4, 0.5, 1);
spotLight.position.set(0, 5, 0);
scene.add(spotLight);

// Volumetric Rays
const rays = [];
const rayGeo = new THREE.CylinderGeometry(0.1, 2, 10, 16, 1, true);
rayGeo.translate(0, 5, 0);
for (let i = 0; i < 7; i++) {
  const isNeon = i % 2 === 0;
  const rayMat = new THREE.MeshBasicMaterial({
    color: isNeon ? NEON : BLUE,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ray = new THREE.Mesh(rayGeo, rayMat);
  ray.position.set((Math.random() - 0.5) * 15, -2, (Math.random() - 0.5) * 5 - 2);
  ray.rotation.z = (Math.random() - 0.5) * 0.5;
  ray.rotation.x = (Math.random() - 0.5) * 0.5;
  ray.userData = { speed: Math.random() * 2 + 1, baseOpacity: 0.15 + Math.random() * 0.1 };
  scene.add(ray);
  rays.push(ray);
}

// ── Environment (Stadium / Crowd) ──
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.8, metalness: 0.2 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);

// Crowd Silhouette Shader
const crowdGeo = new THREE.CylinderGeometry(15, 15, 6, 32, 1, true);
const crowdMat = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: BLUE }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    
    // Pseudo-random noise
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    
    void main() {
      float y = vUv.y;
      float x = vUv.x * 100.0;
      float id = floor(x);
      
      float h = hash(vec2(id)) * 0.5 + 0.2; // crowd height
      h += sin(uTime * 2.0 + id) * 0.05; // jumping
      
      float alpha = 0.0;
      if (y < h && hash(vec2(id, y * 20.0)) > 0.3) {
        alpha = 0.3 * (1.0 - y/h); // fade at top
      }
      
      // Flash bulbs
      if (hash(vec2(id, uTime)) > 0.99) {
        alpha = 1.0;
      }
      
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
  side: THREE.BackSide
});
const crowd = new THREE.Mesh(crowdGeo, crowdMat);
crowd.position.y = 1;
scene.add(crowd);

// ── 3D Football ──
const ballGroup = new THREE.Group();
scene.add(ballGroup);

const ballGeo = new THREE.IcosahedronGeometry(1.2, 2);
const ballMat = new THREE.MeshPhysicalMaterial({
  color: 0x111115,
  metalness: 0.9,
  roughness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
});
const ball = new THREE.Mesh(ballGeo, ballMat);
ballGroup.add(ball);

const wireGeo = new THREE.IcosahedronGeometry(1.205, 2);
const wireMat = new THREE.MeshBasicMaterial({
  color: NEON,
  wireframe: true,
  transparent: true,
  opacity: 0.15
});
const wireBall = new THREE.Mesh(wireGeo, wireMat);
ballGroup.add(wireBall);

const glowGeo = new THREE.SphereGeometry(1.1, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({
  color: BLUE,
  transparent: true,
  opacity: 0.4
});
const glowBall = new THREE.Mesh(glowGeo, glowMat);
ballGroup.add(glowBall);

// ── Floating Stat Cards ──
const cards = [];
function createStatCard(title, val1, val2, x, y, z) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  
  ctx.fillStyle = 'rgba(14, 14, 22, 0.8)';
  ctx.beginPath();
  ctx.roundRect(0, 0, 256, 128, 16);
  ctx.fill();
  
  ctx.strokeStyle = '#00ff87';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#4361ee';
  ctx.font = 'bold 24px "Space Grotesk"';
  ctx.fillText(title, 20, 40);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px "Outfit"';
  ctx.fillText(val1, 20, 90);
  
  ctx.fillStyle = '#00ff87';
  ctx.font = 'bold 24px "Outfit"';
  ctx.fillText(val2, 160, 90);
  
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), mat);
  mesh.position.set(x, y, z);
  mesh.userData = {
    oy: y,
    speed: Math.random() * 1.5 + 0.5,
    offset: Math.random() * Math.PI * 2
  };
  scene.add(mesh);
  cards.push(mesh);
}
createStatCard('POSSESSION', '64%', '+12%', -3.5, 1, -2);
createStatCard('SHOTS ON TARGET', '8', '2', 3.5, 0.5, -1.5);
createStatCard('PASS ACCURACY', '89%', '-2%', -2.5, -1, 1.5);

// ── Particles ──
const pGeo = new THREE.BufferGeometry();
const pCount = 600;
const pPos = new Float32Array(pCount * 3);
const pCol = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  pPos[i*3] = (Math.random() - 0.5) * 20;
  pPos[i*3+1] = (Math.random() - 0.5) * 10;
  pPos[i*3+2] = (Math.random() - 0.5) * 15;
  const c = Math.random() > 0.5 ? NEON : BLUE;
  pCol[i*3] = c.r; pCol[i*3+1] = c.g; pCol[i*3+2] = c.b;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const pMat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ── Confetti ──
const cGeo = new THREE.PlaneGeometry(0.08, 0.04);
const cInst = new THREE.InstancedMesh(cGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), 200);
const cDummy = new THREE.Object3D();
const cData = [];
for(let i=0; i<200; i++) {
  cData.push({
    x: (Math.random() - 0.5) * 10,
    y: Math.random() * 10,
    z: (Math.random() - 0.5) * 10,
    rx: Math.random() * Math.PI,
    ry: Math.random() * Math.PI,
    speed: Math.random() * 0.02 + 0.01,
    color: new THREE.Color(Math.random() > 0.5 ? 0x00ff87 : 0xffffff)
  });
  cInst.setColorAt(i, cData[i].color);
}
scene.add(cInst);

// ── Interaction & Animation ──
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  
  targetX = mouseX * 0.5;
  targetY = mouseY * 0.5;
  
  // Parallax Camera
  camera.position.x += (targetX * 2 - camera.position.x) * 0.05;
  camera.position.y += (targetY * 1 + 1.5 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);
  
  // Football
  ballGroup.rotation.y += 0.005;
  ballGroup.rotation.x += 0.002;
  ballGroup.position.x += (targetX * 1.5 - ballGroup.position.x) * 0.1;
  ballGroup.position.y += (targetY * 1.5 - ballGroup.position.y) * 0.1;
  glowBall.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
  
  // Crowd
  crowdMat.uniforms.uTime.value = t;
  
  // Rays
  rays.forEach(r => {
    r.material.opacity = r.userData.baseOpacity + Math.sin(t * r.userData.speed) * 0.1;
  });
  
  // Cards
  cards.forEach(c => {
    c.position.y = c.userData.oy + Math.sin(t * c.userData.speed + c.userData.offset) * 0.2;
    c.lookAt(camera.position);
  });
  
  // Particles
  particles.rotation.y = t * 0.05;
  
  // Confetti
  for(let i=0; i<200; i++) {
    const d = cData[i];
    d.y -= d.speed;
    d.rx += d.speed;
    d.ry += d.speed;
    if (d.y < -2) d.y = 8;
    cDummy.position.set(d.x, d.y, d.z);
    cDummy.rotation.set(d.rx, d.ry, 0);
    cDummy.updateMatrix();
    cInst.setMatrixAt(i, cDummy.matrix);
  }
  cInst.instanceMatrix.needsUpdate = true;
  
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('btnWatch').addEventListener('click', () => {
  document.getElementById('highlightsSection').scrollIntoView({ 
    behavior: 'smooth' 
  });
});