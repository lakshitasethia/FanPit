/* ═══════════════════════════════════════════════════════════
   FanPit — Holographic Card Interactions
   Tilt on hover (cursor-angle-based), flip on click,
   holographic foil shimmer, scroll reveal
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const cards = document.querySelectorAll('.holo-card-wrapper');

  cards.forEach((wrapper) => {
    const card = wrapper.querySelector('.holo-card');
    const foils = wrapper.querySelectorAll('.holo-foil');
    const shines = wrapper.querySelectorAll('.holo-shine');

    let bounds;
    let isFlipped = false;

    // ── Tilt on mousemove ──
    wrapper.addEventListener('mouseenter', () => {
      bounds = wrapper.getBoundingClientRect();
      wrapper.style.transition = 'none';
      card.style.transition = 'none';
    });

    wrapper.addEventListener('mousemove', (e) => {
      if (!bounds) return;
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      // Normalize -1 to 1
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      // Tilt angles (max ±15deg)
      const rotateY = normX * 15;
      const rotateX = -normY * 15;

      // Apply tilt (preserve flip if flipped)
      const flipDeg = isFlipped ? 180 : 0;
      card.style.transform =
        `rotateY(${flipDeg + rotateY}deg) rotateX(${rotateX}deg)`;

      // Move holographic foil background
      const bgX = 50 + normX * 30;
      const bgY = 50 + normY * 30;
      foils.forEach((foil) => {
        foil.style.backgroundPosition = `${bgX}% ${bgY}%`;
      });

      // Move shine spot
      const shineX = ((x / bounds.width) * 100).toFixed(1);
      const shineY = ((y / bounds.height) * 100).toFixed(1);
      shines.forEach((shine) => {
        shine.style.setProperty('--shine-x', shineX + '%');
        shine.style.setProperty('--shine-y', shineY + '%');
      });
    });

    wrapper.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      const flipDeg = isFlipped ? 180 : 0;
      card.style.transform = `rotateY(${flipDeg}deg) rotateX(0deg)`;
      bounds = null;
    });

    // ── Flip on click ──
    wrapper.addEventListener('click', () => {
      isFlipped = !isFlipped;
      wrapper.classList.toggle('flipped', isFlipped);
      card.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)';
      const flipDeg = isFlipped ? 180 : 0;
      card.style.transform = `rotateY(${flipDeg}deg) rotateX(0deg)`;
    });
  });

  // ── Scroll reveal for cards section ──
  const section = document.getElementById('cardsSection');
  if (section) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('visible');
            observer.unobserve(section);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(section);

    // Add staggered reveal to each card
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(60px) scale(0.92)';
      card.style.transition = `opacity .8s cubic-bezier(.16,1,.3,1) ${i * 0.12}s, transform .8s cubic-bezier(.16,1,.3,1) ${i * 0.12}s`;
    });

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger all cards to animate in
            cards.forEach((card) => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            });
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (document.getElementById('cardsGrid')) {
      cardObserver.observe(document.getElementById('cardsGrid'));
    }
  }
})();
