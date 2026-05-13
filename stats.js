(function() {
  const API_TOKEN = window.ENV?.BSD_API_TOKEN || "";
  const GEMINI_API_KEY = window.ENV?.GEMINI_API_KEY || "";

  // Elements
  const radarStatus = document.getElementById('radarStatus');
  const radarContainer = document.getElementById('radarContainer');
  const playerStatsLabels = document.getElementById('playerStatsLabels');
  const matchStatus = document.getElementById('matchStatus');
  const matchBarsContainer = document.getElementById('matchBarsContainer');
  const pitchStatus = document.getElementById('pitchStatus');
  const pitchContainer = document.getElementById('pitchContainer');
  const pitchSvg = document.getElementById('pitchSvg');
  const pitchLegend = document.getElementById('pitchLegend');

  // Hardcoded Fallback Data
  const fallbackData = {
    haaland: { xG: 0.72, shots: 5, assists: 1, passAcc: 78, dribbles: 1.2 },
    saka: { xG: 0.41, shots: 3, assists: 2, passAcc: 84, dribbles: 2.8 },
    match: {
      home: { possession: 52, shotsOnTarget: 6, passAcc: 87, xG: 1.4 },
      away: { possession: 48, shotsOnTarget: 8, passAcc: 91, xG: 1.9 }
    },
    shots: [
      { x: 10, y: 32, goal: true, xG: 0.3 },
      { x: 15, y: 20, goal: false, xG: 0.1 },
      { x: 8, y: 40, goal: false, xG: 0.05 },
      { x: 12, y: 30, goal: false, xG: 0.2 },
      { x: 90, y: 34, goal: true, xG: 0.4 },
      { x: 85, y: 20, goal: false, xG: 0.08 },
      { x: 88, y: 45, goal: false, xG: 0.12 },
      { x: 92, y: 28, goal: true, xG: 0.35 },
      { x: 86, y: 36, goal: false, xG: 0.25 },
      { x: 18, y: 50, goal: false, xG: 0.04 },
      { x: 80, y: 15, goal: false, xG: 0.06 },
      { x: 22, y: 44, goal: false, xG: 0.03 }
    ]
  };

  async function fetchWithAuth(endpoint) {
    const url = BASE_URL + endpoint;
    try {
      const res = await fetch(url, {
        headers: { "Authorization": API_TOKEN }
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn("API Error, falling back", e);
      return null;
    }
  }

  function renderStatus(el, fallback) {
    if (fallback) {
      el.innerHTML = `<span class="status-dot"></span> Sample`;
      el.className = 'stats-status sample';
    } else {
      el.innerHTML = `<span class="status-dot"></span> Live`;
      el.className = 'stats-status live';
    }
  }

  async function initStats() {
    let fallback = false;
    let matchId = null;

    let matchStats = fallbackData.match;
    let haalandStats = fallbackData.haaland;
    let sakaStats = fallbackData.saka;
    let shots = [...fallbackData.shots];

    // Try fetching everything
    try {
      const eventsData = await fetchWithAuth('/api/events/?league=39');
      if (!eventsData || !eventsData.results || !eventsData.results.length) throw new Error('No events');
      
      const targetMatch = eventsData.results.find(m => 
        (m.home_team && m.home_team.includes('Arsenal')) || 
        (m.away_team && m.away_team.includes('Arsenal')) ||
        (m.home_team && m.home_team.includes('Manchester City')) || 
        (m.away_team && m.away_team.includes('Manchester City'))
      );
      if (!targetMatch) throw new Error('Target match not found');
      matchId = targetMatch.id;

      const detailRes = await fetchWithAuth(`/api/events/${matchId}/`);
      if (!detailRes) throw new Error('No match detail');
      
      matchStats = {
        home: { 
          possession: detailRes.home_possession || 52, 
          shotsOnTarget: detailRes.home_shots_on_target || 6, 
          passAcc: detailRes.home_pass_accuracy || 87, 
          xG: detailRes.home_xg || 1.4 
        },
        away: { 
          possession: detailRes.away_possession || 48, 
          shotsOnTarget: detailRes.away_shots_on_target || 8, 
          passAcc: detailRes.away_pass_accuracy || 91, 
          xG: detailRes.away_xg || 1.9 
        }
      };

      const shotsRes = await fetchWithAuth(`/api/events/${matchId}/`);
      
      let shotsArr = [];
      if (shotsRes && !shotsRes.error) {
        shotsArr = Array.isArray(shotsRes) ? shotsRes : (shotsRes.results || []);
      }
      
      let apiShots = shotsArr.map(s => ({ x: s.x, y: s.y, goal: s.is_goal, xG: s.xg }));
      if (apiShots.length < 12) {
        apiShots = [...apiShots, ...fallbackData.shots.slice(apiShots.length)];
      }
      shots = apiShots;

      const haalandData = await fetchWithAuth('/api/players/?search=Haaland');
      if (!haalandData || !haalandData.results || !haalandData.results.length) throw new Error('No Haaland data');
      haalandStats = { 
        xG: haalandData.results[0].xg || 0.72, shots: haalandData.results[0].shots || 5, 
        assists: haalandData.results[0].assists || 1, passAcc: haalandData.results[0].pass_accuracy || 78, 
        dribbles: haalandData.results[0].dribbles || 1.2 
      };

      const sakaData = await fetchWithAuth('/api/players/?search=Saka');
      if (!sakaData || !sakaData.results || !sakaData.results.length) throw new Error('No Saka data');
      sakaStats = { 
        xG: sakaData.results[0].xg || 0.41, shots: sakaData.results[0].shots || 3, 
        assists: sakaData.results[0].assists || 2, passAcc: sakaData.results[0].pass_accuracy || 84, 
        dribbles: sakaData.results[0].dribbles || 2.8 
      };

    } catch (err) {
      console.warn("Init Stats fallback triggered due to:", err);
      fallback = true;
    }

    renderMatchBars(matchStats, fallback);
    renderRadar(haalandStats, sakaStats, fallback);
    renderPitch(shots, fallback);
  }


  async function updateTicker() {
  try {
    const res = await fetch(
      "https://sports.bzzoiro.com/api/events/?status=live&page=1",
      { headers: { "Authorization": API_TOKEN } }
    );
    const data = await res.json();
    const match = data.results[0];
    if (!match) return;

    document.getElementById('tickerMatch').textContent = 
      `${match.home_team} vs ${match.away_team}`;
    document.getElementById('tickerScore').textContent = 
      `${match.home_score ?? '-'} — ${match.away_score ?? '-'}`;
    document.getElementById('matchTime').textContent = 
      match.current_minute ? `${match.current_minute}'` : 'LIVE';
  } catch(e) {
    console.log('ticker update failed, keeping hardcoded');
  }
}

updateTicker();
  function renderRadar(haaland, saka, fallback) {
    radarContainer.classList.remove('skeleton-pulse');
    radarContainer.classList.add('loaded');
    renderStatus(radarStatus, fallback);

    // Setup Legend Below
    playerStatsLabels.style.display = 'flex';
    playerStatsLabels.className = 'radar-legend';
    playerStatsLabels.innerHTML = `
      <div class="radar-legend-item">
        <div class="radar-legend-dot haaland"></div>
        <h4>HAALAND</h4>
      </div>
      <div class="radar-legend-item">
        <div class="radar-legend-dot saka"></div>
        <h4>SAKA</h4>
      </div>
    `;

    const ctx = document.getElementById('playerRadarChart').getContext('2d');
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['xG', 'Shots', 'Assists', 'Pass Acc', 'Dribbles'],
        datasets: [
          {
            label: 'Haaland',
            data: [haaland.xG*10, haaland.shots, haaland.assists, haaland.passAcc/10, haaland.dribbles],
            backgroundColor: 'rgba(0, 255, 135, 0.15)',
            borderColor: '#00ff87',
            pointBackgroundColor: '#00ff87',
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: 'Saka',
            data: [saka.xG*10, saka.shots, saka.assists, saka.passAcc/10, saka.dribbles],
            backgroundColor: 'rgba(67, 97, 238, 0.15)',
            borderColor: '#4361ee',
            pointBackgroundColor: '#4361ee',
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        scales: {
          r: {
            grid: { color: 'rgba(255, 255, 255, 0.25)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.25)' },
            pointLabels: { 
              color: '#ffffff', 
              font: { family: "'Space Grotesk', sans-serif" } 
            },
            ticks: { display: false }
          }
        },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
      }
    });
  }

  function createStatRow(title, homeVal, awayVal, maxVal, isPercent = false) {
    const row = document.createElement('div');
    row.className = 'stat-row-wrapper';
    
    const displayHome = isPercent ? homeVal + '%' : homeVal;
    const displayAway = isPercent ? awayVal + '%' : awayVal;
    
    const homePct = (homeVal / maxVal) * 100;
    const awayPct = (awayVal / maxVal) * 100;

    row.innerHTML = `
      <div class="stat-row-header">
        <span class="stat-row-title">${title}</span>
        <button class="stat-explain-btn" data-stat="${title}">?</button>
      </div>
      <div class="stat-bar-outer">
        <span class="stat-val-home">${displayHome}</span>
        <div class="stat-bar-track">
          <div class="stat-bar-fill-home" style="width: 0%"></div>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill-away" style="width: 0%"></div>
        </div>
        <span class="stat-val-away">${displayAway}</span>
      </div>
    `;

    setTimeout(() => {
      row.querySelector('.stat-bar-fill-home').style.width = homePct + '%';
      row.querySelector('.stat-bar-fill-away').style.width = awayPct + '%';
    }, 100);

    return row;
  }

  function renderMatchBars(stats, fallback) {
    matchBarsContainer.classList.remove('skeleton-pulse');
    matchBarsContainer.classList.add('loaded');
    matchBarsContainer.innerHTML = '';
    
    renderStatus(matchStatus, fallback);

    matchBarsContainer.appendChild(createStatRow('Possession', stats.home.possession, stats.away.possession, 100, true));
    matchBarsContainer.appendChild(createStatRow('Shots on Target', stats.home.shotsOnTarget, stats.away.shotsOnTarget, 15));
    matchBarsContainer.appendChild(createStatRow('Pass Accuracy', stats.home.passAcc, stats.away.passAcc, 100, true));
    matchBarsContainer.appendChild(createStatRow('Expected Goals (xG)', stats.home.xG, stats.away.xG, 4));

    matchBarsContainer.querySelectorAll('.stat-explain-btn').forEach(btn => {
      btn.addEventListener('click', (e) => handleExplainStat(e, btn.dataset.stat));
    });
  }

  function renderPitch(shots, fallback) {
    pitchContainer.classList.remove('skeleton-pulse');
    pitchContainer.classList.add('loaded');
    pitchLegend.style.display = 'flex';
    
    renderStatus(pitchStatus, fallback);

    shots.forEach(s => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", s.x);
      circle.setAttribute("cy", s.y);
      // Map xG (0 to 1) to radius (10px to 22px). Because SVG viewbox is 100x64, 
      // 1 unit = 1% of width. Since actual width might be 300px, 10px is ~3 units.
      // We will set radius in SVG units directly or rely on CSS scaling.
      // A more robust way is mapping xG (0 to 1) to an SVG radius (e.g., 1.5 to 3.5).
      // Assuming container is ~350px, SVG width=100. So 1 unit = 3.5px.
      // 10px / 3.5 = 2.8 units. 22px / 3.5 = 6.2 units.
      const minR = 2.8;
      const maxR = 6.2;
      const r = minR + (s.xG * (maxR - minR));
      
      circle.setAttribute("r", r);
      circle.setAttribute("class", `shot-dot ${s.goal ? 'goal' : 'miss'}`);
      pitchSvg.appendChild(circle);
    });
  }

  let tooltipTimeout;
  async function handleExplainStat(e, statName) {
    const btn = e.currentTarget;
    let tooltip = document.getElementById('aiTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'aiTooltip';
      tooltip.className = 'ai-tooltip';
      tooltip.innerHTML = '<div class="ai-tooltip-content" id="aiTooltipContent"></div>';
      document.body.appendChild(tooltip);
    }

    const content = document.getElementById('aiTooltipContent');
    content.textContent = 'Thinking...';
    
    const rect = btn.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + 10 + window.scrollY}px`;
    tooltip.classList.add('show');

    try {
      const prompt = `Explain ${statName} to a casual football fan in 2 sentences, no jargon`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      content.textContent = data.candidates[0].content.parts[0].text;
    } catch (err) {
      content.textContent = "Oops, couldn't load explanation.";
    }

    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      tooltip.classList.remove('show');
    }, 6000);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.stat-explain-btn') && !e.target.closest('#aiTooltip')) {
      const tooltip = document.getElementById('aiTooltip');
      if (tooltip) tooltip.classList.remove('show');
    }
  });

  initStats();
})();
