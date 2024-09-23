(function () {
  const doc = document;
  const rootEl = doc.documentElement;
  const body = doc.body;
  /* global ScrollReveal */
  const sr = window.sr = ScrollReveal();

  rootEl.classList.remove('no-js');
  rootEl.classList.add('js');

  window.addEventListener('load', function () {
    body.classList.add('is-loaded');
    // Set default to "lights off" mode when the page loads
    body.classList.add('lights-off');
  });

  // Reveal animations
  function revealAnimations() {
    sr.reveal('.feature', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      origin: 'right',
      viewFactor: 0.2
    });
  }

  if (body.classList.contains('has-animations')) {
    window.addEventListener('load', revealAnimations);
  }
}());
