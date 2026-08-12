/* ---------------------------------------------------------
   Nav: scroll shadow + mobile toggle
--------------------------------------------------------- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

const scrollBar = document.getElementById("scrollBar");

window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
  if (scrollBar) {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : "0%";
  }
}, { passive: true });

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------------------------------------------------------
   Scroll reveal
--------------------------------------------------------- */
const revealEls = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------
   Animated number counters
--------------------------------------------------------- */
const counters = document.querySelectorAll(".counter");
if (counters.length && !prefersReducedMotion) {
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const decimals = parseInt(el.dataset.decimals) || 0;
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          el.textContent = prefix + current.toFixed(decimals) + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        }
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterIO.observe(el));
}

/* ---------------------------------------------------------
   Parallax 3D tilt on project cards
--------------------------------------------------------- */
const tiltCards = document.querySelectorAll(".project-card");
if (tiltCards.length && !prefersReducedMotion) {
  const TILT_MAX = 8;

  tiltCards.forEach((card) => {
    const glow = card.querySelector(".project-card-glow");

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * TILT_MAX;
      const rotateX = -(y - 0.5) * TILT_MAX;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
      card.classList.add("is-tilting");

      if (glow) {
        glow.style.setProperty("--mx", `${x * 100}%`);
        glow.style.setProperty("--my", `${y * 100}%`);
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      card.classList.remove("is-tilting");
      if (glow) {
        glow.style.setProperty("--mx", "50%");
        glow.style.setProperty("--my", "50%");
      }
    });
  });
}

/* ---------------------------------------------------------
   Hero + contact canvas: animated blueprint grid
   Lightweight 2D canvas — a field of drifting nodes connected
   by faint lines when close, over a subtle grid. No dependency,
   ties visually to the CAD/engineering theme of the site.
--------------------------------------------------------- */
function initFieldCanvas(canvas, { nodeColor, lineColor, density = 1 }) {
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");
  let width, height, dpr;
  let nodes = [];
  let pointer = null; // canvas-local {x, y} while hovering, else null

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((width * height) / 9500 * density);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.375,
      vy: (Math.random() - 0.5) * 0.375,
      r: Math.random() * 1.8 + 0.8,
    }));
  }

  function drawGrid() {
    const step = 56;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    const maxDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.strokeStyle = lineColor.replace("ALPHA", String(0.22 * (1 - dist / maxDist)));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Plasma-ball effect: tendrils from nearby nodes to the cursor.
    if (pointer) {
      const reach = 160;
      for (const n of nodes) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < reach) {
          const t = 1 - dist / reach;
          ctx.strokeStyle = lineColor.replace("ALPHA", String(0.6 * t));
          ctx.lineWidth = 1 + t;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = nodeColor;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  step();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  // Listen on window (not the canvas) so the effect still tracks the cursor
  // when it's over text/buttons stacked above the canvas.
  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    pointer = (x >= 0 && x <= width && y >= 0 && y <= height) ? { x, y } : null;
  });
  document.addEventListener("pointerleave", () => { pointer = null; });
}

initFieldCanvas(document.getElementById("bg-canvas"), {
  nodeColor: "rgba(232, 182, 79, 0.6)",
  lineColor: "rgba(79, 214, 255, ALPHA)",
  density: 1.3,
});

initFieldCanvas(document.getElementById("hero-canvas"), {
  nodeColor: "rgba(232, 182, 79, 0.6)",
  lineColor: "rgba(79, 214, 255, ALPHA)",
  density: 1.3,
});
