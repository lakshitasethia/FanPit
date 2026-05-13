(() => {
  const BASE = "https://sports.bzzoiro.com";
  const TOKEN = window.ENV?.BSD_API_TOKEN || "";
  const GEMINI_KEY = window.ENV?.GEMINI_API_KEY || "";

  const cityGrid = document.getElementById("citySquadGrid");
  const arsenalGrid = document.getElementById("arsenalSquadGrid");
  const statusBadge = document.getElementById("squadStatusBadge");
  const scoutingPanel = document.getElementById("aiScoutingPanel");
  const scoutingText = document.getElementById("scoutingText");

  document.getElementById("closeScoutingPanel")
    .addEventListener("click", () => scoutingPanel.classList.remove("show"));

  async function bsdFetch(endpoint) {
    const res = await fetch(BASE + endpoint, {
      headers: { "Authorization": TOKEN }
    });
    if (!res.ok) throw new Error("BSD " + res.status);
    return res.json();
  }

  function pickPlayers(players) {
    const positions = { G: null, D: null, M: null, F: null };
    players.forEach(p => {
      if (!positions[p.position]) positions[p.position] = p;
    });
    return Object.values(positions)
      .filter(Boolean)
      .map(p => ({
        id: p.id,
        name: p.short_name || p.name,
        position: p.position === 'G' ? 'GK' 
                : p.position === 'D' ? 'DEF'
                : p.position === 'M' ? 'MID' : 'FWD',
        number: p.jersey_number || '00'
      }));
  }

  async function initSquads() {
    try {
      const [cityData, arsenalData] = await Promise.all([
        bsdFetch("/api/v2/teams/12/squad/"),
        bsdFetch("/api/v2/teams/14/squad/")
      ]);

      renderCards(pickPlayers(cityData.players), "city", cityGrid);
      renderCards(pickPlayers(arsenalData.players), "arsenal", arsenalGrid);

      statusBadge.textContent = "● Live Data";
      statusBadge.style.color = "var(--neon)";

    } catch(err) {
      console.warn("Squad error:", err);
      statusBadge.textContent = "● Error";
    }
  }

  function renderCards(players, team, container) {
    const isNeon = team === "city";
    container.innerHTML = players.map(p => {
      const parts = p.name.split(' ');
      const initials = parts.map(w => w.replace('.','')[0])
        .filter(Boolean).slice(0,2).join('');
      return `
      <div class="squad-card ${team}-card" data-player="${p.name}">
        <div class="squad-card-top">
          <span class="squad-pos-badge">${p.position}</span>
          <div class="squad-initials">${initials}</div>
          <span class="squad-card-fallback">${p.number}</span>
          <img 
            src="${BASE}/static/players/${p.id}.png"
            class="squad-card-img"
            onerror="this.style.display='none'"
            alt="${p.name}"
          />
        </div>
        <div class="squad-card-bottom">
          <h4 class="squad-card-name">${p.name}</h4>
          <div class="squad-card-meta">
            <span class="squad-card-pos">${p.position}</span>
            <span class="squad-card-rating ${isNeon ? 'neon' : 'blue'}">${p.number}</span>
          </div>
        </div>
      </div>
    `;
    }).join("");

    container.querySelectorAll(".squad-card").forEach(card => {
      card.addEventListener("click", () => scoutPlayer(card.dataset.player));
    });
  }

  async function askGemini(prompt) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      { method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({contents:[{parts:[{text:prompt}]}]}) }
    );
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  function typeText(text, el) {
    el.textContent = "";
    let i = 0;
    const t = () => { if(i < text.length) { el.textContent += text[i++]; setTimeout(t, 20); } };
    t();
  }

  async function scoutPlayer(name) {
    scoutingPanel.classList.add("show");
    scoutingText.textContent = `Analyzing ${name}...`;
    const team = localStorage.getItem('fanpitTeam') || 'football';
    const reply = await askGemini(
      `FanPit AI. 2-sentence scouting report on ${name} for a casual ${team} fan. Fun, no jargon.`
    );
    typeText(reply, scoutingText);
  }

  document.getElementById("btnWhoToWatch")
    .addEventListener("click", async () => {
      scoutingPanel.classList.add("show");
      scoutingText.textContent = "Consulting the tactical board...";
      const team = localStorage.getItem('fanpitTeam') || 'football';
      const reply = await askGemini(
        `Pick ONE player from Man City or Arsenal and tell a casual ${team} fan why they'll love watching them today. 2 sentences, hype energy.`
      );
      typeText(reply, scoutingText);
    });

  initSquads();
})();