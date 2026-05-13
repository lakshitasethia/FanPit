// ── Highlights Arena ──
(function () {
  const GEMINI_KEY = window.ENV?.GEMINI_API_KEY || "";

  const highlights = [
    {
      competition: "PREMIER LEAGUE",
      competition_color: "#3d195b",
      badge_emoji: "🏴",
      home: "Man City",
      away: "Arsenal",
      score: "2 — 1",
      date: "May 10, 2026",
      matchweek: "Matchweek 36",
      youtube: "https://www.youtube.com/watch?v=FZJSs5eh_QE",
      ai_story:
        "79th minute. City trailing. Haaland receives, turns, fires. The Emirates went silent.",
    },
    {
      competition: "UCL SEMI-FINAL",
      competition_color: "#001f5b",
      badge_emoji: "⭐",
      home: "Arsenal",
      away: "Atlético Madrid",
      score: "3 — 2",
      date: "May 6, 2026",
      matchweek: "Semi Final · Leg 2",
      youtube: "https://www.youtube.com/watch?v=BtRHAors0S0",
      ai_story:
        "Saka. 94th minute. One touch. The Emirates erupted. Arsenal are in the final.",
    },
    {
      competition: "UCL SEMI-FINAL",
      competition_color: "#001f5b",
      badge_emoji: "⭐",
      home: "Atlético Madrid",
      away: "Arsenal",
      score: "1 — 2",
      date: "April 29, 2026",
      matchweek: "Semi Final · Leg 1",
      youtube: "https://www.youtube.com/watch?v=sqWkFhUAEfo",
      ai_story:
        "Away goal. Hostile crowd. Arsenal came to Madrid and left with everything.",
    },
    {
      competition: "PREMIER LEAGUE",
      competition_color: "#3d195b",
      badge_emoji: "🏴",
      home: "Man Utd",
      away: "Brentford",
      score: "1 — 3",
      date: "April 27, 2026",
      matchweek: "Matchweek 34",
      youtube: "https://www.youtube.com/watch?v=bXrYvkS1-oE",
      ai_story:
        "Old Trafford. Another loss. The Brentford fans couldn't believe what they were watching.",
    },
    {
      competition: "PREMIER LEAGUE",
      competition_color: "#3d195b",
      badge_emoji: "🏴",
      home: "Arsenal",
      away: "Bayern München",
      score: "3 — 1",
      date: "November 26, 2025",
      matchweek: "UCL Group Stage",
      youtube: "https://www.youtube.com/watch?v=c6OKPUhTGrE",
      ai_story:
        "Bayern thought they knew Arsenal. They did not know this Arsenal.",
    },
    {
      competition: "PREMIER LEAGUE",
      competition_color: "#3d195b",
      badge_emoji: "🏴",
      home: "Best Goals",
      away: "April 2026",
      score: "TOP 10",
      date: "April 2026",
      matchweek: "Monthly Compilation",
      youtube: "https://www.youtube.com/watch?v=ZDmewtz8Xy4",
      ai_story:
        "Ten goals. One month. Every single one better than the last.",
    },
  ];

  // ── Build Section ──
  const section = document.getElementById("highlightsSection");
  if (!section) return;

  // Header
  section.innerHTML = `
    <div class="hl-header">
      <span class="section-tag">WATCH HIGHLIGHTS</span>
      <h2 class="section-title">HIGHLIGHTS<br/><span class="title-gradient">ARENA</span></h2>
      <p class="section-desc">The biggest moments. Relived.</p>
    </div>
    <div class="hl-grid" id="hlGrid"></div>
  `;

  const grid = document.getElementById("hlGrid");

  highlights.forEach((h, idx) => {
    const card = document.createElement("div");
    card.className = "hl-card";
    card.id = `hlCard${idx}`;
    card.innerHTML = `
      <div class="hl-card-top" style="background:linear-gradient(135deg, ${h.competition_color}, #0a0a0f)">
        <div class="hl-comp-badge">
          <span>${h.badge_emoji}</span>
          <span>${h.competition}</span>
        </div>
        <div class="hl-top-center">
          <div class="hl-score-big">${h.score}</div>
          <div class="hl-teams-top">${h.home} vs ${h.away}</div>
        </div>
      </div>
      <div class="hl-card-bottom">
        <div class="hl-meta-line">${h.matchweek} · ${h.date}</div>
        <div class="hl-match-info">${h.home} <span class="hl-score-sm">${h.score}</span> ${h.away}</div>
        <div class="hl-actions">
          <button class="hl-btn-watch" data-yt="${h.youtube}">▶ WATCH</button>
          <button class="hl-btn-recap" data-idx="${idx}">✨ AI RECAP</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // ── Watch Buttons ──
  grid.addEventListener("click", (e) => {
    const watchBtn = e.target.closest(".hl-btn-watch");
    if (watchBtn) {
      window.open(watchBtn.dataset.yt, "_blank");
    }
  });

  // ── AI Recap Overlay ──
  // Create overlay once, reuse
  const overlay = document.createElement("div");
  overlay.className = "hl-recap-overlay";
  overlay.id = "hlRecapOverlay";
  overlay.innerHTML = `
    <button class="hl-recap-close" id="hlRecapClose">×</button>
    <div class="hl-recap-inner">
      <div class="hl-recap-badge" id="hlRecapBadge"></div>
      <div class="hl-recap-match" id="hlRecapMatch"></div>
      <div class="hl-recap-divider"></div>
      <div class="hl-recap-text" id="hlRecapText"></div>
      <button class="hl-btn-watch-now hidden" id="hlRecapWatchBtn">▶ WATCH NOW</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const recapClose = document.getElementById("hlRecapClose");
  const recapBadge = document.getElementById("hlRecapBadge");
  const recapMatch = document.getElementById("hlRecapMatch");
  const recapText = document.getElementById("hlRecapText");
  const recapWatchBtn = document.getElementById("hlRecapWatchBtn");

  let currentYT = "";
  let typingInterval = null;

  function openRecap(idx) {
    const h = highlights[idx];
    currentYT = h.youtube;

    recapBadge.innerHTML = `<span>${h.badge_emoji}</span> ${h.competition}`;
    recapMatch.textContent = `${h.home} vs ${h.away} · ${h.score}`;
    recapText.textContent = "";
    recapWatchBtn.classList.add("hidden");

    overlay.classList.add("show");
    document.body.style.overflow = "hidden";

    fetchRecap(h);
  }

  function closeRecap() {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    if (typingInterval) clearInterval(typingInterval);
    recapText.textContent = "";
  }

  recapClose.addEventListener("click", closeRecap);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeRecap();
  });

  recapWatchBtn.addEventListener("click", () => {
    window.open(currentYT, "_blank");
  });

  // Recap button delegation
  grid.addEventListener("click", (e) => {
    const recapBtn = e.target.closest(".hl-btn-recap");
    if (recapBtn) {
      openRecap(parseInt(recapBtn.dataset.idx, 10));
    }
  });

  // ── Gemini API call ──
  async function fetchRecap(h) {
    const prompt = `You are a football narrator. Write a 4-sentence dramatic story about ${h.competition} result: ${h.home} ${h.score} ${h.away}, ${h.competition}, ${h.date}. Make it feel like a movie trailer voiceover. Cinematic, present tense, emotional. Start with a key moment from the match.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        h.ai_story;
      typewriterAnimate(text);
    } catch {
      typewriterAnimate(h.ai_story);
    }
  }

  function typewriterAnimate(text) {
    recapText.textContent = "";
    let i = 0;
    if (typingInterval) clearInterval(typingInterval);
    typingInterval = setInterval(() => {
      if (i < text.length) {
        recapText.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
        typingInterval = null;
        recapWatchBtn.classList.remove("hidden");
      }
    }, 25);
  }

  // ── Scroll-reveal animation ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("hl-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".hl-card").forEach((c) => observer.observe(c));
})();
