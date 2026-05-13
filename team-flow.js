(function() {
  const btnExplore = document.getElementById('btnExplore');
  const teamPicker = document.getElementById('teamPicker');
  const pickCity = document.getElementById('pickCity');
  const pickArsenal = document.getElementById('pickArsenal');
  const fanIdentityScreen = document.getElementById('fanIdentityScreen');
  const idNickname = document.getElementById('idNickname');
  const idTeam = document.getElementById('idTeam');
  const idHype = document.getElementById('idHype');
  const btnEnterStadium = document.getElementById('btnEnterStadium');
  const aiChatPanel = document.getElementById('aiChatPanel');
  const aiChatMessages = document.getElementById('aiChatMessages');
  const aiChatBtn = document.getElementById('aiChatBtn');

  const nicknames = ["The Faithful", "Die-Hard", "Ultras Legend", "Matchday Warrior"];

  // ── Theme Shift ──
  function applyTeamTheme(team) {
    const root = document.documentElement;

    if (team === 'arsenal' || team === 'Arsenal') {
      root.style.setProperty('--neon', '#cc0000');
      root.style.setProperty('--neon-dim', '#990000');
      root.style.setProperty('--glow-neon',
        '0 0 20px rgba(204,0,0,0.4), 0 0 60px rgba(204,0,0,0.15)');
      root.style.setProperty('--team-accent', 'rgba(204,0,0,0.3)');
    } else {
      root.style.setProperty('--neon', '#4361ee');
      root.style.setProperty('--neon-dim', '#2d47c9');
      root.style.setProperty('--glow-neon',
        '0 0 20px rgba(67,97,238,0.4), 0 0 60px rgba(67,97,238,0.15)');
      root.style.setProperty('--team-accent', 'rgba(67,97,238,0.3)');
    }

    localStorage.setItem('fanpitTeam', team);
  }

  // Restore saved theme on page load
  const savedTeam = localStorage.getItem('fanpitTeam');
  if (savedTeam) applyTeamTheme(savedTeam);

  // 1. Enter the Pitch -> Show Picker
  if (btnExplore) {
    btnExplore.addEventListener('click', (e) => {
      e.preventDefault();
      // Show overlay and prevent body scroll
      if (teamPicker) {
        teamPicker.classList.remove('hidden');
        document.body.classList.add('no-scroll');
      }
    });
  }

  // 2. Handle Team Selection
  function handleTeamPick(team) {
    localStorage.setItem('fanpitTeam', team);
    
    // Animate split
    if (team === 'Man City') {
      pickCity.classList.add('expanded');
      pickArsenal.classList.add('collapsed');
    } else {
      pickArsenal.classList.add('expanded');
      pickCity.classList.add('collapsed');
    }

    // Wait for transition to finish then fade out picker
    setTimeout(() => {
      teamPicker.classList.add('hidden');
      // Reset expansion for future
      setTimeout(() => {
        pickCity.classList.remove('expanded', 'collapsed');
        pickArsenal.classList.remove('expanded', 'collapsed');
      }, 800);
      
      // Show identity card immediately after picker hides
      setTimeout(() => {
        showFanIdentity(team);
      }, 500);
    }, 1200);
  }

  if (pickCity) {
    pickCity.addEventListener('click', (e) => {
      if (e.target.closest('.team-pick-btn')) {
        handleTeamPick('Man City');
      }
    });
  }

  if (pickArsenal) {
    pickArsenal.addEventListener('click', (e) => {
      if (e.target.closest('.team-pick-btn')) {
        handleTeamPick('Arsenal');
      }
    });
  }

  function showFanIdentity(team) {
    // Set content
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
    idNickname.textContent = nickname;
    
    if (team === 'Man City') {
      idTeam.textContent = 'MAN CITY';
      idHype.textContent = 'Sky Blue till I die.';
      fanIdentityScreen.style.setProperty('--team-accent', 'rgba(0, 163, 224, 0.4)');
    } else {
      idTeam.textContent = 'ARSENAL';
      idHype.textContent = 'The Gunners never sleep.';
      fanIdentityScreen.style.setProperty('--team-accent', 'rgba(239, 1, 7, 0.4)');
    }

    fanIdentityScreen.classList.add('show');
  }

  // 3. Enter the Stadium -> Apply theme, hide identity, show chat
  if (btnEnterStadium) {
    btnEnterStadium.addEventListener('click', () => {
      const team = localStorage.getItem('fanpitTeam');

      // Apply site-wide theme shift before closing identity screen
      if (team === 'Arsenal') {
        applyTeamTheme('arsenal');
      } else {
        applyTeamTheme('city');
      }

      fanIdentityScreen.classList.remove('show');
      document.body.classList.remove('no-scroll');
      
      // Open AI Chat Panel
      if (aiChatPanel && aiChatPanel.classList.contains('hidden')) {
        if (aiChatBtn) aiChatBtn.click();
        else aiChatPanel.classList.remove('hidden');
      } else if (aiChatPanel) {
        aiChatPanel.classList.remove('hidden');
      }

      // Auto-send hardcoded welcome message
      setTimeout(() => {
        let message = "";
        if (team === 'Man City') {
          message = "Sky Blue forever 💙 You made the right call. Haaland's been unreal today, we're leading 2-1. Watch us close this out!";
        } else if (team === 'Arsenal') {
          message = "Come on Arsenal! 🔴 You picked the right side. Saka's been electric today, we're 2-1 down but this isn't over. Let's go!";
        }

        if (message && typeof addAIMessage === 'function') {
          addAIMessage(message);
        } else if (message && aiChatMessages) {
          // Fallback: inject directly if addAIMessage not global
          const aiMsg = document.createElement('div');
          aiMsg.className = 'chat-message ai-message';
          aiMsg.innerHTML = `
            <div class="chat-avatar">⚽</div>
            <div class="chat-bubble">${message}</div>
          `;
          aiChatMessages.appendChild(aiMsg);
          aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }
      }, 500);
    });
  }

})();
