/* ========================================
   PhotoBooth Pro - Website Interactions
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

    downloadBtn.addEventListener('click', function () {
      var originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> Trial Coming Soon';
      downloadBtn.style.opacity = '0.8';
      downloadBtn.disabled = true;

      setTimeout(function () {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.opacity = '1';
        downloadBtn.disabled = false;
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

  // --- Initialize everything ---
  function init() {
    initScrollAnimations();
    initNavScroll();
    initMobileNav();
    initSmoothScroll();
    initDownloadButton();
    initActiveNavLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
