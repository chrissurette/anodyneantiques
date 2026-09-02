/* Anodyne Antiques — interactions
   Scroll reveals, hero parallax, mini header, image fade-ins.
   Everything respects prefers-reduced-motion. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- image fade-in on load ---------- */
  document.querySelectorAll('img').forEach(function (img) {
    img.classList.add('lazyfade');
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function () { img.classList.add('loaded'); }, { once: true });
      img.addEventListener('error', function () { img.classList.add('loaded'); }, { once: true });
    }
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- mini header after hero ---------- */
  var mini = document.getElementById('miniHeader');
  var heroEnd = document.getElementById('heroEnd');
  if (mini && heroEnd && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var past = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      mini.classList.toggle('show', past);   // CSS handles visibility, so hidden links are never focusable
    }, { threshold: 0 }).observe(heroEnd);
  }

  /* ---------- hero parallax (collage cards + botanical sprites) ---------- */
  if (!reduced) {
    var phs = Array.prototype.slice.call(document.querySelectorAll('.ph[data-speed]'));
    var floras = Array.prototype.slice.call(document.querySelectorAll('.flora img[data-speed]'));
    var stamp = document.querySelector('.stamp');
    var ticking = false;

    var baseRot = { ph1: -5, ph2: 2.5, ph3: 6 };

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        phs.forEach(function (ph) {
          var speed = parseFloat(ph.getAttribute('data-speed')) || 0;
          var cls = ph.classList.contains('ph1') ? 'ph1' : ph.classList.contains('ph2') ? 'ph2' : 'ph3';
          ph.style.transform = 'translateY(' + (-y * speed).toFixed(1) + 'px) rotate(' + baseRot[cls] + 'deg)';
        });
        floras.forEach(function (fl) {
          var speed = parseFloat(fl.getAttribute('data-speed')) || 0;
          fl.style.transform = 'translateY(' + (-y * speed).toFixed(1) + 'px) rotate(' + (fl.getAttribute('data-rot') || 0) + 'deg)' +
            (fl.hasAttribute('data-flip') ? ' scaleX(-1)' : '');
        });
        if (stamp) stamp.style.transform = 'translateY(' + (-y * 0.03).toFixed(1) + 'px) rotate(-8deg)';
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- keep botanical sprites fully on the page ----------
     Rotation makes each sprite's visual bounds larger than its layout
     box, so instead of hand-tuned offsets per breakpoint, measure the
     rendered bounding box and nudge the sprite the minimum distance
     needed to sit fully inside the hero. Runs on load and resize. */
  var heroEl = document.querySelector('.hero');
  function fitFlora() {
    if (!heroEl) return;
    var hb = heroEl.getBoundingClientRect();
    var y = window.scrollY || 0;
    document.querySelectorAll('.flora img').forEach(function (fl) {
      fl.style.translate = '0px 0px';
      var r = fl.getBoundingClientRect();
      // undo the current parallax offset so we measure the resting position
      var py = reduced ? 0 : y * (parseFloat(fl.getAttribute('data-speed')) || 0);
      var top = r.top + py, bottom = r.bottom + py;
      var dx = 0, dy = 0, m = 2;
      if (r.left < hb.left + m) dx = (hb.left + m) - r.left;
      else if (r.right > hb.right - m) dx = (hb.right - m) - r.right;
      if (top < hb.top + m) dy = (hb.top + m) - top;
      else if (bottom > hb.bottom - m) dy = (hb.bottom - m) - bottom;
      fl.style.translate = dx.toFixed(0) + 'px ' + dy.toFixed(0) + 'px';
    });
  }
  fitFlora();
  var fitTimer;
  window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitFlora, 150);
  });

  /* ---------- infinite marquee ----------
     The CSS loops by translating the track -50%, which is only seamless
     if the track (all copies together) is at least twice the visible
     width — otherwise the content runs out before the loop resets. Clone
     the original unit (always an even count, so -50% lands on a whole
     number of copies) until that holds, on load and on resize. */
  var mqWrap = document.querySelector('.marquee');
  var mqTrack = document.querySelector('.mq-track');
  if (mqWrap && mqTrack && mqTrack.children.length) {
    var mqUnit = mqTrack.children[0];
    var mqBaseDuration = 26; // seconds, tuned for a 2-copy track — scaled below to keep speed constant
    function fitMarquee() {
      var containerW = mqWrap.clientWidth;
      // measure a currently-attached copy — mqUnit itself gets detached below
      var unitW = (mqTrack.children[0] || mqUnit).getBoundingClientRect().width || 1;
      var copies = Math.max(2, Math.ceil((containerW * 2) / unitW));
      if (copies % 2) copies++;
      mqTrack.innerHTML = '';
      for (var i = 0; i < copies; i++) mqTrack.appendChild(mqUnit.cloneNode(true));
      mqTrack.style.animationDuration = (mqBaseDuration * copies / 2) + 's';
    }
    fitMarquee();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMarquee);
    var mqTimer;
    window.addEventListener('resize', function () {
      clearTimeout(mqTimer);
      mqTimer = setTimeout(fitMarquee, 150);
    });
  }

  /* ---------- mobile menu ---------- */
  /* There can be more than one opener (the sticky header's hamburger and,
     on the home page, one in the hero's top bar) plus a close button inside
     the sheet itself — they all drive the same state. */
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.nav-toggle'));
  var closers = Array.prototype.slice.call(document.querySelectorAll('.sheet-close'));
  var sheet = document.getElementById('sheet');
  if (toggles.length && sheet) {
    var lastOpener = null;
    var setMenu = function (open) {
      sheet.hidden = !open;
      document.body.classList.toggle('nav-open', open);
      toggles.forEach(function (t) {
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
        t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      if (open) {
        var first = sheet.querySelector('a');
        if (first) first.focus();
      } else if (lastOpener) {
        lastOpener.focus();
      }
    };
    toggles.forEach(function (t) {
      t.addEventListener('click', function () { lastOpener = t; setMenu(sheet.hidden); });
    });
    closers.forEach(function (c) { c.addEventListener('click', function () { setMenu(false); }); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) setMenu(false); });
  }

  /* ---------- placeholder badges (local preview only) ----------
     Images marked data-placeholder="…" are stand-ins for real photos.
     Show a small tag over them on localhost so they're easy to spot;
     never in production. */
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    document.querySelectorAll('img[data-placeholder]').forEach(function (img) {
      var host = img.parentElement;
      if (!host) return;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var b = document.createElement('span');
      b.className = 'placeholder-badge';
      b.textContent = 'placeholder';
      b.title = img.getAttribute('data-placeholder');
      host.appendChild(b);
    });
  }

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
