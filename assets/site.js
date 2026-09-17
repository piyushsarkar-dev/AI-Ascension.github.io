/* AI-Ascension site shell: theme toggle, spire draw, tier reveal. No dependencies, no requests. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduced = false; }
  try { if (getComputedStyle(root).getPropertyValue('--motion').trim() === '0') { reduced = true; } } catch (e) { /* ignore */ }

  /* ---- theme ---- */
  var KEY = 'ascent-theme';
  function systemDark() {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
  }
  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : ''; } catch (e) { return ''; }
  }
  function fromQuery() {
    var m = /[?&]theme=(dark|light)(?:&|$)/.exec(window.location.search);
    return m ? m[1] : '';
  }
  function effective() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') { return t; }
    return systemDark() ? 'dark' : 'light';
  }
  function swapHeroArt(theme) {
    var sources = document.querySelectorAll('picture.hero-picture source[media]');
    for (var i = 0; i < sources.length; i++) {
      sources[i].setAttribute('media', theme === 'dark' ? 'all' : 'not all');
    }
  }
  function apply(theme, persist) {
    if (theme === 'dark' || theme === 'light') { root.setAttribute('data-theme', theme); }
    var eff = effective();
    var btn = document.getElementById('theme');
    if (btn) {
      btn.setAttribute('aria-pressed', eff === 'dark' ? 'true' : 'false');
      btn.textContent = 'theme: ' + eff;
    }
    if (root.hasAttribute('data-theme')) { swapHeroArt(eff); }
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (e) { /* storage unavailable */ } }
  }
  var initial = fromQuery() || stored();
  apply(initial, false);
  var toggle = document.getElementById('theme');
  if (toggle) {
    toggle.addEventListener('click', function () {
      apply(effective() === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ---- current page in nav ---- */
  var here = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var links = document.querySelectorAll('.site-nav a');
  for (var n = 0; n < links.length; n++) {
    var href = (links[n].getAttribute('href') || '').toLowerCase();
    if (href === here) { links[n].setAttribute('aria-current', 'page'); }
  }

  /* ---- tier reveal (bottom to top) ---- */
  var ascents = document.querySelectorAll('.ascent[data-reveal]');
  function revealAll() {
    for (var i = 0; i < ascents.length; i++) { ascents[i].classList.add('is-in'); }
  }
  if (!ascents.length) { return; }
  if (reduced || typeof window.IntersectionObserver !== 'function') {
    revealAll();
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('is-in');
        io.unobserve(entries[i].target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  for (var a = 0; a < ascents.length; a++) { io.observe(ascents[a]); }
  /* Safety: never leave tiers hidden if the observer does not fire (e.g. printing). */
  window.setTimeout(revealAll, 2500);

  /* ---- scroll-driven center spire animation ---- */
  var ledgers = document.querySelectorAll('.ledger');
  if (ledgers.length) {
    var ticking = false;
    function updateSpireScroll() {
      ticking = false;
      if (reduced) {
        for (var i = 0; i < ledgers.length; i++) {
          ledgers[i].style.setProperty('--spire-progress', '1');
        }
        return;
      }
      var winH = window.innerHeight || document.documentElement.clientHeight || 1;
      var docH = document.documentElement.scrollHeight || document.body.scrollHeight || 1;
      var maxScroll = Math.max(1, docH - winH);
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var progress = Math.max(0, Math.min(1, scrollY / maxScroll));

      for (var j = 0; j < ledgers.length; j++) {
        ledgers[j].style.setProperty('--spire-progress', progress.toFixed(4));
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(updateSpireScroll);
        } else {
          updateSpireScroll();
        }
      }
    }

    if (reduced) {
      updateSpireScroll();
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      updateSpireScroll();
    }
  }
})();

