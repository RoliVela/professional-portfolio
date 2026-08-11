import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loader = new STLLoader();

function initViewer(container) {
  const modelUrl = container.dataset.model;
  const color = container.dataset.color || "#4fd6ff";
  const loadingEl = container.querySelector(".cad-loading");

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x4fd6ff, 0.8);
  fill.position.set(-6, -2, -4);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = true;
  controls.minDistance = 2;
  controls.maxDistance = 30;
  controls.autoRotate = !prefersReducedMotion;
  controls.autoRotateSpeed = 1.4;

  let mesh;

  const rotateX = parseFloat(container.dataset.rotateX) || -Math.PI / 2.4;
  const scaleFactor = parseFloat(container.dataset.scale) || 1;

  loader.load(
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
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      if (loadingEl) loadingEl.remove();
    },
    (xhr) => {
      if (loadingEl && xhr.total) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        loadingEl.textContent = `Loading model… ${pct}%`;
      }
    },
    (err) => {
      if (loadingEl) loadingEl.textContent = "Model unavailable";
      console.error("STL load failed:", modelUrl, err);
    }
  );

  let running = true;
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }, 150);
  });

  return () => { running = false; };
}

// Lazy-init: only spin up WebGL contexts once a viewer scrolls into view.
const viewers = document.querySelectorAll(".cad-viewer");
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
viewers.forEach((v) => io.observe(v));
