# Build report — professional-portfolio

Autonomous overnight build, 2026-08-07. Site is live at
https://rolivela.github.io/professional-portfolio/ and the code is pushed to
`main` on the new public repo `RoliVela/professional-portfolio`.

## What got built

A single-page, dark-themed portfolio site (vanilla HTML/CSS/JS, Three.js via
CDN for the CAD viewers, no build step) covering: hero, about/overview,
skills marquee, work experience timeline, software project cards, an
interactive "Engineering" section with three rotatable/zoomable 3D models
pulled from the CAD-Portfolio repo, leadership + education, and contact.
Deployed straight to GitHub Pages from `main`.

## Judgment calls made without checking in

These were genuine "confused, made the reasonable call, moving on" moments —
flagging them so you can override anything you don't like.

1. **Only 3 of the CAD models got interactive viewers** (rocketry fin,
   assistive-device compliant clamp, EXCEL McCormick fin) — picked the
   smallest/cleanest `.stl` files per project for fast load times. The
   wheelchair-propulsion hardware and side-projects (Prom Box, G-Babies,
   Leadership Kermit, Roli Vela Excel) are `.step`-only or too large
   (Prom Box STL is 12MB) and aren't viewable with the lightweight
   three.js STL loader I used — those are only reachable via the "Browse
   Full CAD Portfolio" link out to the GitHub repo.

2. **"EXCEL McCormick Robot Proposition" project description is thin.**
   The CAD-Portfolio README only labels this folder "EXCEL McCormick
   School" with no further detail, and it's not in your résumé's project
   list — I didn't want to invent specifics I don't actually know, so the
   copy on the site is deliberately generic ("a robot proposition built
   through Northwestern's EXCEL McCormick summer engineering-access
   program"). Worth a rewrite if you can give me the real story.

3. **No live homepage link for the Toyota WiFi portal.** The
   `Internship-Wifi` repo has no `homepage` set on GitHub (it's presumably
   only physically deployed on signage at the dealership), so that project
   card only links to the GitHub repo, not a live URL.

4. **FIFADEX has no code link.** It's in your résumé as a project but isn't
   a repo on your GitHub — the card describes it from the résumé bullets
   only, with no GitHub/live link.

5. **Skipped a contact form.** GitHub Pages is static with no backend, so a
   contact form that doesn't actually submit anywhere would be a broken,
   half-built feature. I used direct `mailto:`/`tel:`/link cards instead —
   all of them actually work. Say the word if you'd rather I wire up a real
   form via a serverless function (e.g., the same pattern your
   `latex-resumes` project already uses on Vercel), but that means hosting
   somewhere other than GitHub Pages, or adding a separate small backend.

6. **Design direction:** I didn't loop back to ask about visual tone (bold
   vs. buttoned-up) — went with a dark navy/charcoal base, gold accent
   (fintech/precision cue) + cyan accent (engineering/blueprint cue), Space
   Grotesk display type. Distinct from the mzermeno.com reference's
   purple-on-navy look, but same overall register (dark, confident, techy).
   Easy to retheme via the CSS custom properties at the top of
   `css/style.css` if it's not your taste.

7. **Left the `expired-clone` and GPA off per your explicit answers** —
   noting only so it's clear those were deliberate, not overlooked.

## Nothing was left broken or half-finished

Everything above is a scoping/content call, not an unfinished feature — the
site as pushed is complete, tested locally and on the live GitHub Pages URL
(3D viewers, nav, mobile layout, and links all verified working), with no
placeholder content.
