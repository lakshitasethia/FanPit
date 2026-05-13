// ── FOOTBALL 101 LOGIC ──

(function() {
  const searchInput = document.getElementById('fbSearchInput');
  const filters = document.getElementById('fbFilters');
  const cards = document.querySelectorAll('.fb-card');
  const modal = document.getElementById('fbModal');
  const modalClose = document.getElementById('fbModalClose');
  const modalBadge = document.getElementById('fbModalBadge');
  const modalTitle = document.getElementById('fbModalTitle');
  const aiTyping = document.getElementById('fbAiTyping');
  const aiResponse = document.getElementById('fbAiResponse');

  let currentFilter = 'ALL';
  let typeInterval;

  // AI Mock Responses
  const aiAnalyses = {
    'Offside': "Imagine you're waiting in line behind everyone at a buffet, but right before the food is served, you sneak past the last person. That's offside! You can't be closer to the opponent's goal than their last defender when the ball is passed to you.",
    'Yellow Card': "Think of a yellow card as a stern warning from a bouncer. You broke a rule, and you're officially on thin ice. Do it again, and you're getting kicked out of the club!",
    'Red Card': "This is the ultimate 'You're fired!' Imagine doing something so bad at work you have to pack your desk immediately. In football, a red card means you leave the field and your team plays with one less person.",
    'Penalty': "A penalty is like a free throw in basketball, but with a lot more drama. It's a 1-on-1 duel between the kicker and the goalie from just 12 yards out, given when a nasty foul happens inside the crucial box area.",
    'Free Kick': "A free kick is basically a 'do-over' from the exact spot you were fouled. The defending team has to stand 10 yards away, and you get a clean chance to pass or shoot directly at the goal.",
    'Striker': "The striker is the lead singer of the rock band. Their main job is to score goals and grab the glory. They hover near the opponent's goal, waiting for the perfect pass to strike.",
    'Goalkeeper': "The goalie is the ultimate security guard. They are the only player allowed to use their hands, and their sole mission is to stop the ball from crossing the goal line.",
    'Midfielder': "Midfielders are the engine room or the stage crew. They run all game, transitioning the ball from defense to attack. Without them, the game falls apart, even if they don't always get the spotlight.",
    'Defender': "Defenders are the defensive wall protecting the castle. Their job is to tackle, block, and annoy the opponent's attackers so they can't even get close to the goalkeeper.",
    'Pressing': "Pressing is like full-court pressure in basketball or hounding a dog with a toy. The team swarms the player with the ball immediately to force a mistake and win it back quickly.",
    'Counter Attack': "A counter-attack is a lightning-fast steal. Imagine a boxing match where one guy swings, misses, and leaves his face wide open—the other guy immediately throws a rapid punch back. That's a counter!",
    'Hat Trick': "A hat trick is when one player gets incredibly hot and scores three goals in a single game. It's the football equivalent of rolling three strikes in a row in bowling—rare, awesome, and definitely worthy of keeping the match ball!"
  };

  // Searching and Filtering
  function filterCards() {
    const query = searchInput.value.toLowerCase();
    
    cards.forEach(card => {
      const term = card.getAttribute('data-term').toLowerCase();
      const category = card.getAttribute('data-category');
      
      const matchesSearch = term.includes(query);
      const matchesFilter = currentFilter === 'ALL' || category === currentFilter;
      
      if (matchesSearch && matchesFilter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  searchInput.addEventListener('input', filterCards);

  filters.addEventListener('click', (e) => {
    if (e.target.classList.contains('fb-chip')) {
      // Update active state
      document.querySelectorAll('.fb-chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      
      // Update filter
      currentFilter = e.target.getAttribute('data-filter');
      filterCards();
    }
  });

  // Modal & AI Interaction
  function openModal(term, category) {
    modalBadge.textContent = category;
    modalTitle.textContent = term;
    aiResponse.innerHTML = '';
    aiTyping.style.display = 'flex';
    modal.classList.add('show');

    clearInterval(typeInterval);

    // Simulate API Call Delay
    setTimeout(() => {
      aiTyping.style.display = 'none';
      const text = aiAnalyses[term] || "AI is thinking...";
      let i = 0;
      
      typeInterval = setInterval(() => {
        aiResponse.innerHTML += text.charAt(i);
        i++;
        if (i >= text.length) clearInterval(typeInterval);
      }, 30); // Typewriter speed
    }, 1500); // Thinking delay
  }

  function closeModal() {
    modal.classList.remove('show');
    clearInterval(typeInterval);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      openModal(
        card.getAttribute('data-term'),
        card.getAttribute('data-category')
      );
    });
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

})();