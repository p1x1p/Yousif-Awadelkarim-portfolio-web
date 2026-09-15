import * as THREE from './three.module.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// Scroll progress + subtle pointer light
const progress = document.querySelector('.scroll-progress span');
const cursorGlow = document.querySelector('.cursor-glow');
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

function onScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (finePointer && !prefersReducedMotion) {
  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorGlow.style.opacity = '1';
  }, { passive: true });
  const followGlow = () => {
    glowX += (mouseX - glowX) * 0.09;
    glowY += (mouseY - glowY) * 0.09;
    cursorGlow.style.transform = `translate(${glowX - 256}px, ${glowY - 256}px)`;
    requestAnimationFrame(followGlow);
  };
  followGlow();
}

// Reveal content as it enters the viewport
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.13, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  if (element.closest('.cap-list') || element.closest('.project-row') || element.closest('.process-steps')) {
    element.style.transitionDelay = `${(index % 3) * 70}ms`;
  }
  revealObserver.observe(element);
});

// Role rotator
const roleElement = document.querySelector('.role-cycle');
const roles = ['SOFTWARE ENGINEERING', 'FULL STACK DEVELOPMENT', 'MOBILE APPLICATIONS', 'BACKEND SYSTEMS'];
let roleIndex = 0;
if (!prefersReducedMotion) {
  window.setInterval(() => {
    roleElement.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-5px)' }
    ], { duration: 220, fill: 'forwards' }).finished.then(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleElement.textContent = roles[roleIndex];
      roleElement.animate([
        { opacity: 0, transform: 'translateY(5px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 280, fill: 'forwards' });
    });
  }, 2300);
}

// Lightweight magnetic motion for important actions
if (finePointer && !prefersReducedMotion) {
  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * 0.09}px, ${y * 0.12}px)`;
    });
    element.addEventListener('pointerleave', () => {
      element.style.transform = 'translate(0, 0)';
    });
  });

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--rx', `${py * -3.5}deg`);
      card.style.setProperty('--ry', `${px * 4}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

// Terminal command loop
const terminalType = document.querySelector('#terminal-type');
const terminalCommands = [
  'ship --quality production',
  'test --across every-layer',
  'optimize --for real-users',
  'deploy --with confidence'
];
let commandIndex = 0;
let typingTimer;

function typeCommand(text, position = 0) {
  terminalType.textContent = text.slice(0, position);
  if (position < text.length) {
    typingTimer = window.setTimeout(() => typeCommand(text, position + 1), 32 + Math.random() * 35);
  } else {
    typingTimer = window.setTimeout(eraseCommand, 1900);
  }
}
function eraseCommand() {
  const current = terminalType.textContent;
  if (current.length) {
    terminalType.textContent = current.slice(0, -1);
    typingTimer = window.setTimeout(eraseCommand, 18);
  } else {
    commandIndex = (commandIndex + 1) % terminalCommands.length;
    typingTimer = window.setTimeout(() => typeCommand(terminalCommands[commandIndex]), 300);
  }
}
if (!prefersReducedMotion) typingTimer = window.setTimeout(eraseCommand, 2200);

// Interactive Three.js hero object — a small "software core" system
const container = document.querySelector('#scene-container');
const fallback = document.querySelector('.scene-fallback');

function createTextSprite(text, color = '#c6ff37') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '700 44px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = 14;
  context.fillText(text, 128, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.55, 0.78, 1);
  return sprite;
}

function initScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070907, 0.055);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.15, 9.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);
  fallback.style.display = 'none';

  const system = new THREE.Group();
  system.rotation.set(-0.08, -0.28, -0.08);
  scene.add(system);

  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x131914,
    roughness: 0.18,
    metalness: 0.86,
    clearcoat: 0.65,
    clearcoatRoughness: 0.25,
    emissive: 0x152008,
    emissiveIntensity: 0.38,
    flatShading: true
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.52, 2), coreMaterial);
  system.add(core);

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xc6ff37,
    wireframe: true,
    transparent: true,
    opacity: 0.34,
    depthWrite: false
  });
  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.58, 1), wireMaterial);
  system.add(wire);

  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.74, 1),
    new THREE.MeshBasicMaterial({ color: 0xc6ff37, wireframe: true, transparent: true, opacity: 0.14 })
  );
  system.add(inner);

  const glyph = createTextSprite('{ }');
  glyph.position.z = 1.68;
  glyph.scale.set(1.45, 0.72, 1);
  system.add(glyph);

  const ringMaterial = new THREE.MeshStandardMaterial({ color: 0x879279, metalness: 0.9, roughness: 0.28 });
  const ringMaterialBright = new THREE.MeshBasicMaterial({ color: 0xc6ff37, transparent: true, opacity: 0.72 });
  const ringOne = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.018, 10, 180), ringMaterialBright);
  ringOne.rotation.set(1.12, 0.22, 0.3);
  system.add(ringOne);
  const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.026, 10, 180), ringMaterial);
  ringTwo.rotation.set(0.34, 1.18, 0.75);
  system.add(ringTwo);
  const ringThree = new THREE.Mesh(new THREE.TorusGeometry(3.38, 0.012, 8, 180), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.24 }));
  ringThree.rotation.set(1.52, 0.08, -0.18);
  system.add(ringThree);

  const satellites = new THREE.Group();
  const satelliteMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b35, emissive: 0x6a1805, emissiveIntensity: 0.65, roughness: 0.38, metalness: 0.6 });
  const satelliteGeometry = new THREE.OctahedronGeometry(0.18, 0);
  const satelliteData = [
    [2.35, 0.82, 0.25, 0.1], [-2.82, -0.18, 0.3, 0.2], [0.75, -2.73, -0.3, 0.12], [-0.55, 3.18, -0.5, 0.15]
  ];
  satelliteData.forEach(([x, y, z, scale]) => {
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    satellite.position.set(x, y, z);
    satellite.scale.setScalar(0.75 + scale * 2);
    satellites.add(satellite);
  });
  system.add(satellites);

  // Small moving data nodes on the main ring
  const nodes = [];
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xc6ff37 });
  for (let i = 0; i < 8; i += 1) {
    const node = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), nodeMaterial);
    system.add(node);
    nodes.push(node);
  }

  // Point cloud depth field
  const particleCount = window.innerWidth < 700 ? 380 : 760;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const acidColor = new THREE.Color(0xc6ff37);
  const paleColor = new THREE.Color(0xaeb6a7);
  for (let i = 0; i < particleCount; i += 1) {
    const radius = 5 + Math.random() * 11;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) - 3;
    const color = Math.random() > 0.9 ? acidColor : paleColor;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    size: 0.028,
    vertexColors: true,
    transparent: true,
    opacity: 0.62,
    sizeAttenuation: true
  }));
  scene.add(particles);

  const grid = new THREE.GridHelper(18, 30, 0x3f4c31, 0x1d231c);
  grid.position.set(0, -4.25, -1.5);
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  scene.add(grid);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const key = new THREE.PointLight(0xc6ff37, 12, 18, 1.8);
  key.position.set(4, 4, 6);
  scene.add(key);
  const warm = new THREE.PointLight(0xff6b35, 14, 15, 1.7);
  warm.position.set(-4, -2, 5);
  scene.add(warm);
  const rim = new THREE.DirectionalLight(0x8abaff, 1.8);
  rim.position.set(-3, 4, -5);
  scene.add(rim);

  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let dragX = 0;
  let dragY = 0;
  let dragging = false;
  let previousX = 0;
  let previousY = 0;
  let visible = true;

  renderer.domElement.addEventListener('pointerdown', (event) => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  });
  renderer.domElement.addEventListener('pointermove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.8;
    pointerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.5;
    if (dragging) {
      dragY += (event.clientX - previousX) * 0.006;
      dragX += (event.clientY - previousY) * 0.006;
      previousX = event.clientX;
      previousY = event.clientY;
    }
  });
  const endDrag = (event) => {
    dragging = false;
    if (renderer.domElement.hasPointerCapture?.(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
  };
  renderer.domElement.addEventListener('pointerup', endDrag);
  renderer.domElement.addEventListener('pointercancel', endDrag);
  renderer.domElement.addEventListener('pointerleave', () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
  });

  const sceneObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.02 });
  sceneObserver.observe(container);

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const motion = prefersReducedMotion ? 0 : 1;

    const scrollInfluence = Math.min(window.scrollY / window.innerHeight, 1.3);
    system.rotation.y += ((-0.18 + pointerTargetX + dragY + t * 0.075 * motion) - system.rotation.y) * 0.035;
    system.rotation.x += ((-0.06 + pointerTargetY + dragX + scrollInfluence * 0.18) - system.rotation.x) * 0.04;
    system.position.y = Math.sin(t * 0.9) * 0.12 * motion - scrollInfluence * 0.15;
    wire.rotation.x = t * 0.09 * motion;
    wire.rotation.y = -t * 0.14 * motion;
    inner.rotation.y = t * 0.35 * motion;
    ringOne.rotation.z = 0.3 + t * 0.06 * motion;
    ringTwo.rotation.z = 0.75 - t * 0.045 * motion;
    satellites.rotation.z = t * 0.07 * motion;
    particles.rotation.y = t * 0.006 * motion;

    nodes.forEach((node, index) => {
      const angle = t * (0.23 + index * 0.006) + (index / nodes.length) * Math.PI * 2;
      const radius = 2.45;
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.38, Math.sin(angle) * 0.9);
      node.rotation.x = angle;
      node.rotation.y = angle * 0.7;
    });

    camera.position.x += (pointerTargetX * 0.35 - camera.position.x) * 0.025;
    camera.position.y += ((0.15 - pointerTargetY * 0.26) - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  render();
}

try {
  initScene();
} catch (error) {
  console.warn('3D scene unavailable; using CSS fallback.', error);
  fallback.style.display = 'grid';
}

document.querySelector('#year').textContent = new Date().getFullYear();
