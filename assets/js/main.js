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
      mini.classList.toggle('show', past);
      mini.setAttribute('aria-hidden', past ? 'false' : 'true');
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

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
