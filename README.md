# Professional Portfolio

Personal portfolio site for Rolando "Roli" Vela — Computer Engineering & AI
student at Northwestern University, software + hardware engineer seeking
software engineering and fintech-adjacent roles.

Live: https://rolivela.github.io/professional-portfolio/

## Stack

Static HTML/CSS/JS — no build step. Three.js (via CDN import map) powers the
rotatable STL viewers in the Engineering section; everything else is plain
DOM/CSS (scroll-reveal via `IntersectionObserver`, a small 2D canvas field
animation for the hero/contact backgrounds, and a CSS-only marquee).

```
index.html
css/style.css       design system + layout
js/main.js           nav, scroll reveal, marquee, background canvases
js/viewer.js          three.js STL viewers for the CAD section
assets/img            headshot
assets/models          sampled .stl files from the CAD portfolio
assets/resume          downloadable résumé PDF
```

## Run locally

```
python3 -m http.server 8000
```

## Deploy

Static export served directly from `main` via GitHub Pages — no Actions
build required.
