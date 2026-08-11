import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stlLoader = new STLLoader();

// ── Shared renderer ──────────────────────────────────────────────
// One WebGLRenderer / one canvas / one rAF loop for all viewers.
// Avoids browser WebGL context limits that break multi-viewer pages.

let sharedRenderer = null;
const activeViewers = [];
let frameId = null;

function getRenderer() {
  if (sharedRenderer) return sharedRenderer;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none;";
  canvas.setAttribute("data-role", "cad-shared-canvas");
  document.body.prepend(canvas);

  sharedRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  sharedRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  sharedRenderer.setClearColor(0x000000, 0);
  sharedRenderer.setScissorTest(true);

  window.addEventListener("resize", () => {
    sharedRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  return sharedRenderer;
}

function startLoop() {
  if (frameId) return;
  function loop() {
    frameId = requestAnimationFrame(loop);

    // Clean up viewers removed from DOM
    for (let i = activeViewers.length - 1; i >= 0; i--) {
      if (!document.body.contains(activeViewers[i].container)) {
        activeViewers.splice(i, 1);
      }
    }
    if (activeViewers.length === 0) {
      cancelAnimationFrame(frameId);
      frameId = null;
      return;
    }

    sharedRenderer.setSize(window.innerWidth, window.innerHeight);

    for (const v of activeViewers) {
      const rect = v.container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0 || rect.bottom < 0 || rect.top > window.innerHeight) continue;

      const dpr = sharedRenderer.getPixelRatio();
      const sx = rect.left * dpr;
      const sy = (window.innerHeight - rect.bottom) * dpr;
      const sw = w * dpr;
      const sh = h * dpr;

      sharedRenderer.setViewport(sx, sy, sw, sh);
      sharedRenderer.setScissor(sx, sy, sw, sh);

      v.camera.aspect = w / h;
      v.camera.updateProjectionMatrix();

      v.controls.update();
      sharedRenderer.render(v.scene, v.camera);
    }
  }
  loop();
}

// ── Init a single viewer ────────────────────────────────────────

function initViewer(container) {
  getRenderer();

  const modelUrl = container.dataset.model;
  const color = container.dataset.color || "#4fd6ff";
  const loadingEl = container.querySelector(".cad-loading");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
  camera.position.set(0, 0, 10);

  // Lights
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x4fd6ff, 0.8);
  fill.position.set(-6, -2, -4);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  // Controls bound to the viewer container (receives scroll / drag events)
  const controls = new OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = true;
  controls.minDistance = 2;
  controls.maxDistance = 30;
  controls.autoRotate = !prefersReducedMotion;
  controls.autoRotateSpeed = 1.4;

  const rotateX = parseFloat(container.dataset.rotateX) || -Math.PI / 2.4;
  const scaleFactor = parseFloat(container.dataset.scale) || 1;

  stlLoader.load(
    modelUrl,
    (geometry) => {
      geometry.center();
      geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 1;
      const scale = (3.4 / (radius || 1)) * scaleFactor;
      geometry.scale(scale, scale, scale);
      geometry.rotateX(rotateX);

      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.35,
        roughness: 0.45,
      });
      scene.add(new THREE.Mesh(geometry, material));

      if (loadingEl) loadingEl.remove();
    },
    (xhr) => {
      if (loadingEl && xhr.total) {
        loadingEl.textContent = `Loading model… ${Math.round((xhr.loaded / xhr.total) * 100)}%`;
      }
    },
    (err) => {
      if (loadingEl) loadingEl.textContent = "Model unavailable";
      console.error("STL load failed:", modelUrl, err);
    }
  );

  const viewer = { container, scene, camera, controls };
  activeViewers.push(viewer);
  startLoop();

  return () => {
    const idx = activeViewers.indexOf(viewer);
    if (idx >= 0) activeViewers.splice(idx, 1);
  };
}

// ── Lazy-init on scroll ─────────────────────────────────────────

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        initViewer(entry.target);
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".cad-viewer").forEach((v) => io.observe(v));
