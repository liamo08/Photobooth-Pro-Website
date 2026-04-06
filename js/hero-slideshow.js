/* ========================================
   Hero Gallery Slideshow
   ======================================== */
(function() {
  'use strict';

  const slider = document.getElementById('gallerySlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.gallery-slide');
  const dots = document.querySelectorAll('.gallery-dot');
  const labelText = document.getElementById('galleryLabelText');
  const total = slides.length;
  let current = 0;
  let timer = null;
  let paused = false;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    if (labelText) {
      labelText.textContent = slides[current].getAttribute('data-label') || '';
    }
  }

  function next() {
    goTo(current + 1);
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(next, 4000);
  }

  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Dot clicks
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      goTo(parseInt(this.getAttribute('data-index'), 10));
      startAuto(); // reset timer
    });
  });

  // Pause on hover / focus
  var gallery = document.querySelector('.gallery-main');
  if (gallery) {
    gallery.addEventListener('mouseenter', function() { paused = true; stopAuto(); });
    gallery.addEventListener('mouseleave', function() { paused = false; startAuto(); });
  }

  // Pause when tab not visible
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) { stopAuto(); }
    else if (!paused) { startAuto(); }
  });

  // Start
  startAuto();
})();
