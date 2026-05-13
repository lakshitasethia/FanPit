# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**No build system** — FanPit is a vanilla frontend app with zero dependencies.

```bash
# Serve locally with any HTTP server
python3 -m http.server 8000
npx http-server
# Then open http://localhost:8000
```

All imports are CDN-based (Three.js via importmap in `index.html`). Edit files and refresh the browser — no build step needed.

## Architecture Overview

**Three-Tier Structure:**

1. **3D Hero Section** (`main.js`)
   - Three.js scene, volumetric lighting, fog effects
   - Preloader animation with progress bar
   - Live match time ticker (updates every second)
   - Handles canvas resize and rendering loop

2. **Holographic Cards** (`cards.js`)
   - Cursor-based 3D tilt on hover (normalized x/y to rotation angles)
   - Click-to-flip animation with 3D perspective
   - Foil shimmer effect that follows cursor
   - IIFE pattern, purely event-driven

3. **AI Chat Panel** (`chat.js`)
   - Toggle collapse/expand with button click
   - User message input, typewriter effect on responses
   - Quick action chips for common questions
   - Pure DOM manipulation, no state management library

**How They Connect:**
- All modules read/write DOM directly
- No shared state — each module manages its own section
- CSS variables shared across all modules for theme consistency

## Design System

**CSS Variables** (in `:root`):

| Variable | Purpose |
|----------|---------|
| `--neon` | Primary accent (green #00ff87) |
| `--blue` | Secondary accent (blue #4361ee) |
| `--bg` | Background dark (dark navy #0a0a0f) |
| `--white`, `--w60`, `--w30`, `--w10`, `--w05` | Text opacity scale |
| `--glow-neon`, `--glow-blue` | Box-shadow glows |
| `--font-d` | Display font (Outfit) |
| `--font-b` | Body font (Space Grotesk) |

**Responsive Approach:**
- `clamp(min, ideal, max)` for fluid scaling
- `vw` units for viewport-relative sizing
- Flexbox + CSS Grid for layout
- No media queries needed for hero section

**Animations:**
- Staggered entrance animations (fadeUp, fadeDown, titleRev) with 2.5s+ delays
- Hover states with cubic-bezier easing
- Pulse/glow effects on badges and buttons
- Scroll-triggered animations on bottom bar

## File Structure

```
FanPit/
├── index.html              # Semantic HTML structure (hero, cards, chat sections)
├── main.js                 # Three.js scene (ES Module)
├── cards.js                # Card tilt/flip logic (IIFE)
├── chat.js                 # Chat panel logic
├── style.css               # Single source of styling (design tokens + animations)
└── assets/
    ├── messi.glb           # 3D model for hero
    ├── player-*.png        # Player photos
```

## Common Development Tasks

### Add a New Player Card
1. Copy a `holo-card-wrapper` block in `index.html`
2. Update player name, rating, position, image src
3. Update stat values in the back face
4. Cards.js auto-attaches event listeners to `.holo-card-wrapper` elements

### Change Theme Colors
1. Edit CSS variables in `style.css` `:root` block
2. `--neon` changes primary accent across all sections
3. `--blue` changes secondary accent
4. Box-shadow glows automatically update via `--glow-neon`, `--glow-blue`

### Modify Hero Animations
1. Edit keyframe delays in `style.css` (classes like `.hero-badge`, `.title-line-1`)
2. Delays are sequential: navbar 2.5s → badge 2.8s → title 3s → subtitle 3.4s → buttons 3.6s
3. Each animation uses `cubic-bezier(.16,1,.3,1)` for smooth easing

### Update Match Data (Ticker)
1. Edit ticker items in `index.html` `#bottomBar`
2. Match time auto-increments via `setInterval` in `main.js` (no hardcoding needed)

### Add Chat Features
1. New quick chips: add `.ai-chip` buttons to `#aiQuickActions`
2. Message responses: define handler logic in `chat.js` form submit event
3. Typewriter effect: already built in; just append to `chatMessages` div

## Important Notes

- **No testing infrastructure** — manual browser testing only
- **Canvas is fixed background** — page scrolls over it via z-index layering
- **Three.js updates on resize** — viewport resize listener auto-handles canvas scaling
- **Card interactions are stateful** — `isFlipped` flag persists flip state per card
- **All animations use CSS, not JavaScript** — better performance; JS only triggers class changes

## Key Files to Know

- **index.html** — Structure + Semantic sections (hero, cards, chat)
- **style.css** — Complete styling + animations (no external frameworks)
- **main.js** — Complex Three.js setup; requires graphics knowledge
- **cards.js** — Easy to extend with new card effects or interactions
- **chat.js** — Good place to add API integrations for AI responses
