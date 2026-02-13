import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
import confetti from "canvas-confetti";

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color("#fff0f3"); // Initial background

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(6);
camera.position.setY(0);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffecd2, 1.2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xff69b4, 1.5); // Stronger Pink
pointLight2.position.set(-5, -2, 3);
scene.add(pointLight2);

// --- Heart Texture Generation (for Particles) ---
function createHeartTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffb7b2"; // default pink
  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.bezierCurveTo(16, 6, 14, 0, 8, 0);
  ctx.bezierCurveTo(0, 0, 0, 11.5, 0, 11.5);
  ctx.bezierCurveTo(0, 18, 16, 28, 16, 28);
  ctx.bezierCurveTo(32, 18, 32, 11.5, 32, 11.5);
  ctx.bezierCurveTo(32, 11.5, 32, 0, 24, 0);
  ctx.bezierCurveTo(18, 0, 16, 6, 16, 8);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const heartTexture = createHeartTexture();

// --- Background Particles (Hearts) ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 350;

const posArray = new Float32Array(particlesCount * 3);
const colorArray = new Float32Array(particlesCount * 3); // RGB per particle

for (let i = 0; i < particlesCount * 3; i += 3) {
  // Position
  posArray[i] = (Math.random() - 0.5) * 35; // x wide spread
  posArray[i + 1] = (Math.random() - 0.5) * 35; // y
  posArray[i + 2] = (Math.random() - 0.5) * 20 - 10; // z background

  // Color (Reds and Pinks)
  // Red is (1, 0, 0), Pink is (1, 0.7, 0.8) etc.
  // We want a mix.
  const isRed = Math.random() > 0.5;
  const r = 1.0;
  const g = isRed ? Math.random() * 0.2 : 0.6 + Math.random() * 0.2; // Red has low G, Pink has high G
  const b = isRed ? Math.random() * 0.2 : 0.6 + Math.random() * 0.2; // Red has low B, Pink has high B

  colorArray[i] = r;
  colorArray[i + 1] = g;
  colorArray[i + 2] = b;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(posArray, 3),
);
particlesGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(colorArray, 3),
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.8,
  map: heartTexture,
  transparent: true,
  alphaTest: 0.01,
  opacity: 0.8,
  vertexColors: true,
  sizeAttenuation: true,
  depthWrite: false,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- Envelope Construction ---
const envelopeGroup = new THREE.Group();
scene.add(envelopeGroup);

// Colors
const envColor = 0xffaebc; // Soft pink
const innerColor = 0xfc86aa; // Darker pink inside
const paperColor = 0xffffff;

const envMat = new THREE.MeshStandardMaterial({
  color: envColor,
  roughness: 0.4,
  side: THREE.DoubleSide,
});
const innerMat = new THREE.MeshStandardMaterial({
  color: innerColor,
  roughness: 0.5,
  side: THREE.DoubleSide,
});
const paperMat = new THREE.MeshStandardMaterial({
  color: paperColor,
  roughness: 0.3,
});

// Dimensions
const W = 3.2;
const H = 2.2;

// 1. Back Panel
const backGeo = new THREE.PlaneGeometry(W, H);
const backMesh = new THREE.Mesh(backGeo, envMat);
envelopeGroup.add(backMesh);

// 2. Paper (Letter)
const paperGeo = new THREE.PlaneGeometry(W - 0.2, H - 0.2);
const paperMesh = new THREE.Mesh(paperGeo, paperMat);
paperMesh.position.set(0, 0, 0.01);
envelopeGroup.add(paperMesh);

// 3. "Surprise" Item Inside (A shiny heart)
const surpriseShape = new THREE.Shape();
const x = 0,
  y = 0;
surpriseShape.moveTo(x + 0.25, y + 0.25);
surpriseShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
surpriseShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
surpriseShape.bezierCurveTo(
  x - 0.3,
  y + 0.55,
  x - 0.1,
  y + 0.77,
  x + 0.25,
  y + 0.95,
);
surpriseShape.bezierCurveTo(
  x + 0.6,
  y + 0.77,
  x + 0.8,
  y + 0.55,
  x + 0.8,
  y + 0.35,
);
surpriseShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
surpriseShape.bezierCurveTo(
  x + 0.35,
  y,
  x + 0.25,
  y + 0.25,
  x + 0.25,
  y + 0.25,
);

const extrudeSettings = {
  depth: 0.1,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 2,
  bevelSize: 0.05,
  bevelThickness: 0.05,
};
const surpriseGeo = new THREE.ExtrudeGeometry(surpriseShape, extrudeSettings);
const surpriseMat = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  metalness: 0.6,
  roughness: 0.1,
}); // Shiny Red
const surpriseMesh = new THREE.Mesh(surpriseGeo, surpriseMat);
// Center the heart
surpriseGeo.center();
surpriseMesh.position.set(0, 0, 0.05);
surpriseMesh.scale.set(1.5, 1.5, 1.5);
envelopeGroup.add(surpriseMesh);

// 4. Flaps (Fixed)
// Bottom
const bottomShape = new THREE.Shape();
bottomShape.moveTo(-W / 2, -H / 2);
bottomShape.lineTo(W / 2, -H / 2);
bottomShape.lineTo(0, 0.2); // Peak
bottomShape.lineTo(-W / 2, -H / 2);
const bottomMesh = new THREE.Mesh(new THREE.ShapeGeometry(bottomShape), envMat);
bottomMesh.position.z = 0.06;
envelopeGroup.add(bottomMesh);

// Left
const leftShape = new THREE.Shape();
leftShape.moveTo(-W / 2, -H / 2);
leftShape.lineTo(-W / 2, H / 2);
leftShape.lineTo(0, 0);
leftShape.lineTo(-W / 2, -H / 2);
const leftMesh = new THREE.Mesh(new THREE.ShapeGeometry(leftShape), envMat);
leftMesh.position.z = 0.07;
envelopeGroup.add(leftMesh);

// Right
const rightShape = new THREE.Shape();
rightShape.moveTo(W / 2, -H / 2);
rightShape.lineTo(W / 2, H / 2);
rightShape.lineTo(0, 0);
rightShape.lineTo(W / 2, -H / 2);
const rightMesh = new THREE.Mesh(new THREE.ShapeGeometry(rightShape), envMat);
rightMesh.position.z = 0.07;
envelopeGroup.add(rightMesh);

// 5. Top Flap (Dynamic)
const topShape = new THREE.Shape();
topShape.moveTo(-W / 2, H / 2);
topShape.lineTo(W / 2, H / 2);
topShape.lineTo(0, 0);
topShape.lineTo(-W / 2, H / 2);
const topGeo = new THREE.ShapeGeometry(topShape);
const topMesh = new THREE.Mesh(topGeo, innerMat); // Inner color visible when open

// Pivot Group for Top Flap
const flapGroup = new THREE.Group();
flapGroup.position.set(0, H / 2, 0.06); // Pivot at top
topMesh.position.set(0, -H / 2, 0); // Adjust geometry relative to pivot
flapGroup.add(topMesh);
envelopeGroup.add(flapGroup);

// --- Initial State: Semi-Open ---
flapGroup.rotation.x = Math.PI / 6; // ~30 degrees open (peeking)

// --- Logic ---
let isOpen = false;
let isAnimating = false;

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function handleInteraction(clientX, clientY) {
  if (isOpen || isAnimating) return;

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true); // Recursive for groups

  // Check if clicked ON the envelope logic
  if (intersects.length > 0) {
    // Find if we hit the envelope group
    const hit = intersects.find((i) => {
      let p = i.object;
      while (p) {
        if (p === envelopeGroup) return true;
        p = p.parent;
      }
      return false;
    });

    if (hit) {
      openLetter();
    }
  }
}

// Click Listening
window.addEventListener("click", (e) =>
  handleInteraction(e.clientX, e.clientY),
);
document.getElementById("start-prompt").addEventListener("click", (e) => {
  // Also trigger if they click the DOM overlay
  openLetter();
});

function openLetter() {
  if (isOpen || isAnimating) return;
  isAnimating = true;
  isOpen = true;

  // Hide UI prompt
  const prompt = document.getElementById("start-prompt");
  if (prompt) {
    prompt.style.opacity = "0";
    setTimeout(() => prompt.remove(), 500);
  }

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
      // Allow scrolling after open
      document.body.style.overflow = "auto";
    },
  });

  // 1. Open Flap Fully
  tl.to(flapGroup.rotation, {
    x: Math.PI,
    duration: 1,
    ease: "power2.inOut",
  });

  // 2. Levitate Surprise + Paper
  tl.to(
    surpriseMesh.position,
    {
      z: 0.5,
      y: 0.5,
      duration: 0.5,
      ease: "power2.out",
    },
    "-=0.5",
  );

  tl.to(
    paperMesh.position,
    {
      y: H / 2 + 0.8,
      z: 0.1,
      duration: 0.8,
      ease: "power2.out",
    },
    "-=0.3",
  );

  // 3. Camera Movement "Zoom In / Transition"
  // Move camera so envelope is background or gone
  // User requested "que quede el fondo quede de corazones pero en vez de ser una card esa card tenga la silueta de la carta"
  // This implies the 3D envelope should morph or transition into the HTML card.
  // Easiest is to zoom camera into the paper until it fills screen then swap with HTML.

  tl.to(
    camera.position,
    {
      z: 3,
      y: 1,
      duration: 1.2,
      ease: "power1.inOut",
    },
    "-=0.8",
  );

  // 4. Fade Out 3D Envelope & Show HTML content
  tl.to(
    envelopeGroup.scale,
    {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
    },
    "-=1.0",
  );

  tl.to(envelopeGroup.position, {
    y: 10, // Fly up and away
    duration: 1.5,
    ease: "power2.in",
    onStart: () => {
      // Reveal HTML content underlying
      const content = document.getElementById("content");
      content.classList.remove("hidden");
      content.style.opacity = "0";
      gsap.to(content, { opacity: 1, duration: 1, delay: 0.5 });
    },
  });

  // Keep Hearts (Particles)
  // Maybe make them fall faster or bloom?
}

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const delta = clock.getDelta();

  // Animate Hearts Background
  const positions = particlesGeometry.attributes.position.array;
  for (let i = 1; i < particlesCount * 3; i += 3) {
    positions[i] += Math.sin(t + positions[i - 1]) * 0.01 + 0.02; // Move up Y
    if (positions[i] > 15) {
      positions[i] = -15; // Reset to bottom
    }
    // Sway X
    positions[i - 1] += Math.sin(t * 2 + i) * 0.01;
  }
  particlesGeometry.attributes.position.needsUpdate = true;

  // Idle Envelope Float
  if (!isOpen) {
    envelopeGroup.position.y = Math.sin(t) * 0.15;
    envelopeGroup.rotation.z = Math.sin(t * 0.5) * 0.05;
    // Shiny heart inside pulse
    surpriseMesh.scale.setScalar(1.5 + Math.sin(t * 3) * 0.1);
  }

  // Mouse Parallax for Hearts
  scene.rotation.x = mouse.y * 0.05;
  scene.rotation.y = mouse.x * 0.05;

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Interaction Logic (Confetti, etc) ---
function celebrate(btn) {
  const rect = btn.getBoundingClientRect();
  // Normalise coordinates
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 150,
    spread: 100,
    origin: { x, y },
    colors: ["#e63946", "#ffb7b2", "#ffffff"],
  });

  setTimeout(() => {
    alert("¡Te amo mi San Valentín! ❤️");
  }, 1500);
}

document
  .getElementById("btn-yes")
  ?.addEventListener("click", (e) => celebrate(e.currentTarget));
document
  .getElementById("btn-course")
  ?.addEventListener("click", (e) => celebrate(e.currentTarget));

// Scroll Reveals
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("opacity-100", "translate-y-0");
        entry.target.classList.remove("opacity-0", "translate-y-10");
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll("section > div").forEach((div) => {
  div.classList.add(
    "transition-all",
    "duration-1000",
    "opacity-0",
    "translate-y-10",
  );
  observer.observe(div);
});
