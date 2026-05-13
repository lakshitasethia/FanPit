[README.md](https://github.com/user-attachments/files/27733743/README.md)
<div align="center">

```
███████╗ █████╗ ███╗   ██╗██████╗ ██╗████████╗
██╔════╝██╔══██╗████╗  ██║██╔══██╗██║╚══██╔══╝
█████╗  ███████║██╔██╗ ██║██████╔╝██║   ██║   
██╔══╝  ██╔══██║██║╚██╗██║██╔═══╝ ██║   ██║   
██║     ██║  ██║██║ ╚████║██║     ██║   ██║   
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝   ╚═╝   
```

### *Your AI-powered football companion. Watch together, understand everything.*

[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-fan--pit.vercel.app-00ff87?style=for-the-badge&logo=vercel&logoColor=black)](https://fan-pit.vercel.app)
[![Built With](https://img.shields.io/badge/Built%20With-Vanilla%20JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://fan-pit.vercel.app)
[![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://fan-pit.vercel.app)
[![Hackathon](https://img.shields.io/badge/hack2skill-Prompt%20Wars-ff6b6b?style=for-the-badge)](https://fan-pit.vercel.app)

<br/>

> *"I want a friend to watch football with — someone who answers my questions without making me feel dumb."*
> 
> That one insight became FanPit.

<br/>

![FanPit Hero](https://fan-pit.vercel.app/assets/player-striker.png)

</div>

---

## 🎯 The Problem

Most football apps are built for people who already know football.

Stats dashboards. Formation trackers. xG heatmaps. All beautiful. All alienating to the casual fan sitting on the couch thinking *"wait, what just happened?"*

FanPit is built for that person. Not a dashboard — a companion.

---

## ⚡ What It Does

```
You open FanPit during a match.
You see the live score, the squads, the atmosphere.
You don't understand something → you ask.
The AI explains it. Instantly. Without judgment.
You feel the roar.
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FANPIT CLIENT                        │
│                  (100% Client-Side)                      │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐      ┌───────────────────────┐
│   BSD SPORTS API │      │   GEMINI 2.5 FLASH AI  │
│  sports.bzzoiro  │      │  generativelanguage    │
│  .com            │      │  .googleapis.com       │
│                  │      │                        │
│  • Live scores   │      │  • AI chat companion   │
│  • Match stats   │      │  • Football 101 terms  │
│  • Squad data    │      │  • Player scouting     │
│  • xG + shots    │      │  • Highlights recap    │
│  • Premier League│      │  • Stat explanations   │
└──────────────────┘      └───────────────────────┘
```

---

## 🗂️ Project Structure

```
fanpit/
│
├── index.html          ← Full site structure & all sections
├── style.css           ← Complete design system + glassmorphism
│
├── main.js             ← Three.js hero scene (3D wireframe ball)
├── cards.js            ← Holographic player cards + flip animation
├── chat.js             ← AI companion chat with conversation memory
├── football101.js      ← Glossary + AI explanations on click
├── team-flow.js        ← Team picker + fan identity card
├── stats.js            ← Live match stats + BSD API + live ticker
├── squad.js            ← Matchday squads via BSD API
├── highlights.js       ← Highlights arena + YouTube links
└── prediction.js       ← Score prediction game + AI analysis
```

---

## ✨ Features

### 🔴 Live Match Experience
- Real-time score ticker (BSD API, polls every 60s)
- Live possession, shots, pass accuracy, xG bars
- Shot map plotted on SVG pitch with xG-scaled circles
- Animated stat bars with AI tooltip explanations

### 🃏 Holographic Player Cards
- FIFA-style cards with tilt-on-hover effect
- Flip animation reveals full stat breakdown
- "Ask AI about this player" button on every card
- Players: Haaland · Saka · Rodri · Ederson

### 🤖 FanPit AI Companion
- Full conversation memory across the session
- Quick action chips: *Who's playing? · Explain offside · Yellow card?*
- Typewriter effect on every response
- Powered by Gemini 2.5 Flash

### 📚 Football 101
- 12 core terms across Rules · Positions · Tactics · Gameplay
- Searchable + filterable
- Click any term → AI explains it in plain English, no jargon

### 🏟️ Matchday Squads
- Live squad data from BSD API (City ID: 12 · Arsenal ID: 14)
- Click any player → AI scouting report generated live
- "WHO SHOULD I WATCH?" — AI picks the most interesting player

### 🎬 Highlights Arena
- 6 real matches with real YouTube links
- "AI RECAP" generates a cinematic match story
- Typewriter reveal for dramatic effect

### 🎯 Prediction Game *(newest)*
- Predict the final scoreline inline in the hero ticker
- AI gives a 3-point analytical breakdown of your prediction
- Live tracker updates against the real score every 60s

### 🎨 Visual Design
- Dark cinematic landing: *"FEEL THE ROAR"*
- Three.js 3D wireframe football (hero canvas)
- Stadium light beams + particle system + confetti
- Loading screen: *"ENTERING THE STADIUM..."*
- Glassmorphism throughout
- Team theme shift: pick City → site goes sky blue, pick Arsenal → site goes red

---

## 🔄 User Flow

```
Landing Page
     │
     ▼
"ENTERING THE STADIUM..." (preloader)
     │
     ▼
Hero Section ──────────────────────────────────────┐
  • 3D football + stadium lights                    │
  • Live score ticker (BSD API)                     │
  • Predict the score → AI analysis                 │
     │                                              │
     ▼                                              │
Player Cards                                        │
  • Hover: holographic tilt                         │
  • Click: flip to stats                            │   AI Chat
  • Ask AI: instant scouting report                 │   (floating,
     │                                              │   always
     ▼                                              │   accessible)
Match Stats                                         │
  • Radar: Haaland vs Saka                          │
  • Live bars: possession, shots, xG                │
  • Shot map on pitch SVG                           │
     │                                              │
     ▼                                              │
Matchday Squads ◄──────────────────────────────────┘
  • Real players via BSD API
  • AI scouting on click
     │
     ▼
Football 101
  • 12 terms, searchable
  • AI explanation modal
     │
     ▼
Team Picker
  • Man City vs Arsenal split screen
  • Fan identity card reveal
  • Theme shift on pick
     │
     ▼
Highlights Arena
  • 6 matches, real YouTube
  • AI recap generator
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Vanilla HTML/CSS/JS | No build step, instant deploy, full control |
| 3D | Three.js | Lightweight, beautiful hero canvas |
| AI | Gemini 2.5 Flash | Fast, conversational, generous free tier |
| Live Data | BSD Sports API | Free, real Premier League data, no rate limits |
| Fonts | Outfit + Space Grotesk | Premium feel without a design system |
| Deploy | Vercel | Zero-config, instant CDN |
| Charts | Chart.js | Radar chart for player comparison |

> **No backend. No database. No build toolchain. 100% client-side.**

---

## 🚀 Running Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/fanpit.git
cd fanpit

# Create config.js with your API keys
cat > config.js << EOF
window.ENV = {
  GEMINI_API_KEY: "your_gemini_key_here",
  BSD_API_TOKEN: "Token your_bsd_token_here"
};
EOF

# Serve locally (any static server works)
npx serve .
# or
python -m http.server 8080
```

> Get your **Gemini API key** → [aistudio.google.com](https://aistudio.google.com)  
> Get your **BSD API token** → [sports.bzzoiro.com](https://sports.bzzoiro.com)  
> Both are **free**.

---

## 🌐 Live Demo

**[fan-pit.vercel.app](https://fan-pit.vercel.app)**

Best experienced during a Premier League matchday. Open it, pick your team, and just watch.

---

## 🗺️ Roadmap

- [x] Live score ticker via BSD API
- [x] AI companion chat
- [x] Holographic player cards
- [x] Football 101 glossary
- [x] Matchday squads (live)
- [x] Match stats + shot map
- [x] Team theme shift
- [x] Highlights arena
- [x] Score prediction game
- [ ] Match clock ticking in real time
- [ ] Player comparison (pick 2 → AI head-to-head)
- [ ] Custom cursor (football that trails the mouse)
- [ ] Goal celebration easter egg
- [ ] Sound toggle (ambient stadium crowd)

---

## 👤 Built By

**Solo build** for the [hack2skill Prompt Wars](https://hack2skill.com) hackathon — *"Fan Engagement & Experience"* problem statement.

Built in a single sprint. Every feature shipped is fully functional.

---

<div align="center">

*Made with obsession for the casual fan who just wants to feel the roar.*

**[⚽ Open FanPit](https://fan-pit.vercel.app)**

</div>
