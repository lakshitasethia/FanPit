// ── Prediction Game ──
(function () {
  const GEMINI_KEY = window.ENV?.GEMINI_API_KEY || "";

  // ── DOM refs ──
  const inputArea = document.getElementById("predInputArea");
  const resultPanel = document.getElementById("predResultPanel");
  const cityInput = document.getElementById("predCityGoals");
  const arsenalInput = document.getElementById("predArsenalGoals");
  const callBtn = document.getElementById("predCallBtn");
  const predUserCall = document.getElementById("predUserCall");
  const predAiText = document.getElementById("predAiText");
  const predTracker = document.getElementById("predTracker");
  const predChangeBtn = document.getElementById("predChangeBtn");

  if (!inputArea || !resultPanel) return;

  let trackerInterval = null;

  // ── Submit prediction ──
  callBtn.addEventListener("click", () => {
    const cGoals = parseInt(cityInput.value, 10);
    const aGoals = parseInt(arsenalInput.value, 10);
    if (isNaN(cGoals) || isNaN(aGoals) || cGoals < 0 || aGoals < 0) return;

    // Show result panel, hide input
    inputArea.classList.add("pred-hidden");
    resultPanel.classList.add("pred-show");

    predUserCall.textContent = `You called: Man City ${cGoals} — ${aGoals} Arsenal`;
    predAiText.textContent = "";
    predChangeBtn.classList.add("pred-hidden");

    // Update tracker immediately
    updateTracker(cGoals, aGoals);
    // Poll tracker every 60s
    clearInterval(trackerInterval);
    trackerInterval = setInterval(() => updateTracker(cGoals, aGoals), 60000);

    // Gemini analysis
    fetchAnalysis(cGoals, aGoals);
  });

  // ── Change prediction ──
  predChangeBtn.addEventListener("click", () => {
    resultPanel.classList.remove("pred-show");
    inputArea.classList.remove("pred-hidden");
    predAiText.textContent = "";
    predTracker.textContent = "";
    predChangeBtn.classList.add("pred-hidden");
    clearInterval(trackerInterval);
  });

  // ── Tracker: compare prediction to live score ──
  function updateTracker(predCity, predArsenal) {
    const scoreText = (document.getElementById("tickerScore")?.textContent || "").trim();
    const parts = scoreText.split("—").map((s) => s.trim());
    if (parts.length === 2) {
      const liveHome = parseInt(parts[0], 10);
      const liveAway = parseInt(parts[1], 10);
      if (!isNaN(liveHome) && !isNaN(liveAway)) {
        const match = liveHome === predCity && liveAway === predArsenal;
        predTracker.innerHTML = `Current score: ${liveHome} — ${liveAway} ${
          match
            ? '<span class="pred-correct">✓ Correct</span>'
            : '<span class="pred-off">✗ Off</span>'
        }`;
        return;
      }
    }
    predTracker.textContent = "Waiting for live score…";
  }

  // ── Gemini API call ──
  async function fetchAnalysis(cityGoals, arsenalGoals, retryCount = 0) {
    const liveScore = (document.getElementById("tickerScore")?.textContent || "2 — 1").trim();
    const liveMinute = (document.getElementById("matchTime")?.textContent || "78'").trim();

    const prompt = `You are an analytical football expert. A fan has predicted Man City ${cityGoals} - ${arsenalGoals} Arsenal.

Current live context: Man City vs Arsenal, score is ${liveScore}, minute ${liveMinute}.

Give a sharp 3-sentence analytical breakdown of their prediction:
1. Whether it's realistic given the current scoreline and match context
2. One tactical reason it could or couldn't happen
3. A confidence rating out of 10 with one line justification

Be direct, specific, and analytical. No fluff.`;

    if (!GEMINI_KEY) {
      typewriter("API key not configured. Check config.js.");
      return;
    }

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

      // Handle rate limiting with auto-retry
      if (res.status === 429 && retryCount < 2) {
        const waitSec = 10 + retryCount * 15;
        predAiText.textContent = `⏳ Rate limited — retrying in ${waitSec}s...`;
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        return fetchAnalysis(cityGoals, arsenalGoals, retryCount + 1);
      }

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Prediction API error:", res.status, errBody);
        typewriter("Rate limited — wait a moment and hit CHANGE PREDICTION to retry.");
        return;
      }

      const data = await res.json();

      // Extract text — handle thinking model format (text may be in later parts)
      let text = "";
      const parts = data?.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.text) text = p.text;
      }

      typewriter(text || "Analysis unavailable — try again in a minute.");
    } catch (err) {
      console.error("Prediction fetch error:", err);
      typewriter("Network error — check your connection.");
    }
  }

  // ── Typewriter ──
  function typewriter(text) {
    predAiText.textContent = "";
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) {
        predAiText.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(iv);
        predChangeBtn.classList.remove("pred-hidden");
      }
    }, 25);
  }
})();
