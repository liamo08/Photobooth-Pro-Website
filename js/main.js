/* ========================================
   BoothLedger - Website Interactions
   ======================================== */

(function () {
  'use strict';

  // --- Scroll-triggered fade-in animations ---
  function initScrollAnimations() {
    var fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Navbar scroll effect ---
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var scrollThreshold = 50;

    function handleScroll() {
      if (window.scrollY > scrollThreshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // --- Mobile nav toggle ---
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
        toggle.classList.remove('active');
      }
    });
  }

  // --- Smooth scroll for anchor links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var navHeight = document.getElementById('nav').offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  // --- Download button click handler ---
  function initDownloadButton() {
    var downloadBtn = document.getElementById('downloadBtn');
    if (!downloadBtn) return;

    // GitHub latest release URL - always points to newest version
    var downloadUrl = 'https://github.com/liamo08/photobooth-pro-releases/releases/latest/download/BoothLedger-Setup.exe';

    downloadBtn.addEventListener('click', function () {
      // Start download
      window.location.href = downloadUrl;

      // Show feedback
      var originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Download Starting...';

      setTimeout(function () {
        downloadBtn.innerHTML = originalText;
      }, 3000);
    });
  }

  // --- Active nav link highlighting ---
  function initActiveNavLinks() {
    var sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    function highlightNav() {
      var scrollPos = window.scrollY + 100;

      sections.forEach(function (section) {
        var top = section.offsetTop;
        var height = section.offsetHeight;
        var id = section.getAttribute('id');
        var link = document.querySelector('.nav-links a[href="#' + id + '"]');

        if (link) {
          if (scrollPos >= top && scrollPos < top + height) {
            link.style.color = '#f8fafc';
          } else {
            link.style.color = '';
          }
        }
      });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
  }

  // --- AI Gallery carousel ---
  var galleryAutoPlay = { pause: function () {}, resume: function () {} };

  function initAIGallery() {
    var cards = document.querySelectorAll('.ai-gallery-card');
    var dots = document.querySelectorAll('.ai-gallery-dot');
    if (!cards.length || !dots.length) return;

    var currentIndex = 0;
    var autoPlayInterval;

    function showCard(index) {
      cards.forEach(function (card) { card.classList.remove('active'); });
      dots.forEach(function (dot) { dot.classList.remove('active'); });
      cards[index].classList.add('active');
      dots[index].classList.add('active');
      currentIndex = index;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'), 10);
        showCard(index);
        resetAutoPlay();
      });
    });

    var prevBtn = document.querySelector('.ai-gallery-prev');
    var nextBtn = document.querySelector('.ai-gallery-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        var prev = (currentIndex - 1 + cards.length) % cards.length;
        showCard(prev);
        resetAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var next = (currentIndex + 1) % cards.length;
        showCard(next);
        resetAutoPlay();
      });
    }

    function autoPlay() {
      autoPlayInterval = setInterval(function () {
        var next = (currentIndex + 1) % cards.length;
        showCard(next);
      }, 4000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayInterval);
      autoPlay();
    }

    galleryAutoPlay.pause = function () {
      clearInterval(autoPlayInterval);
    };

    galleryAutoPlay.resume = function () {
      resetAutoPlay();
    };

    autoPlay();
  }

  // --- Mobile comparison sliders ---
  function initComparisonSliders() {
    var cards = document.querySelectorAll('.ai-gallery-card');
    if (!cards.length) return;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function setSliderPosition(card, pct) {
      var before = card.querySelector('.ai-gallery-before');
      var handle = card.querySelector('.ai-slider-handle');
      if (!before || !handle) return;
      var clamped = Math.max(0, Math.min(100, pct));
      before.style.clipPath = 'inset(0 ' + (100 - clamped) + '% 0 0)';
      handle.style.left = clamped + '%';
    }

    function resetAllSliders() {
      cards.forEach(function (card) {
        setSliderPosition(card, 50);
      });
    }

    cards.forEach(function (card) {
      var handle = card.querySelector('.ai-slider-handle');
      var images = card.querySelector('.ai-gallery-images');
      if (!handle || !images) return;

      var dragging = false;

      function updateFromEvent(e) {
        var rect = images.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var pct = (x / rect.width) * 100;
        setSliderPosition(card, pct);
      }

      handle.addEventListener('pointerdown', function (e) {
        if (!isMobile()) return;
        dragging = true;
        galleryAutoPlay.pause();
        handle.setPointerCapture(e.pointerId);
        e.preventDefault();
      });

      handle.addEventListener('pointermove', function (e) {
        if (!dragging || !isMobile()) return;
        updateFromEvent(e);
      });

      handle.addEventListener('pointerup', function () {
        if (dragging) {
          dragging = false;
          galleryAutoPlay.resume();
        }
      });

      handle.addEventListener('pointercancel', function () {
        if (dragging) {
          dragging = false;
          galleryAutoPlay.resume();
        }
      });
    });

    // Reset sliders when carousel changes slides
    var dots = document.querySelectorAll('.ai-gallery-dot');
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        resetAllSliders();
      });
    });

    // Also reset on autoplay transitions via MutationObserver
    var gallery = document.querySelector('.ai-gallery');
    if (gallery) {
      var observer = new MutationObserver(function () {
        if (isMobile()) {
          resetAllSliders();
        }
      });
      cards.forEach(function (card) {
        observer.observe(card, { attributes: true, attributeFilter: ['class'] });
      });
    }
  }

  // --- Video replay button ---
  function initVideoReplay() {
    var player = document.querySelector('.eco-video-player');
    if (!player) return;

    var video = player.querySelector('video');
    var btn = player.querySelector('.eco-video-replay');
    if (!video || !btn) return;

    video.addEventListener('ended', function () {
      btn.classList.add('visible');
    });

    btn.addEventListener('click', function () {
      btn.classList.remove('visible');
      video.currentTime = 0;
      video.play();
    });
  }

  // --- Initialize everything ---
  function init() {
    initScrollAnimations();
    initNavScroll();
    initMobileNav();
    initSmoothScroll();
    initDownloadButton();
    initActiveNavLinks();
    initAIGallery();
    initComparisonSliders();
    initVideoReplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
