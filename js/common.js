/* Shared PC canvas sizing, navigation, and a safe native-scroll fallback. */
(() => {
  'use strict';
  const root = document.documentElement;
  const capture = new URLSearchParams(location.search).has('capture');
  const scaleCanvas = () => root.style.setProperty('--canvas-scale', capture ? 1 : Math.max(1280, root.clientWidth) / 1920);
  scaleCanvas();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { scaleCanvas(); window.ScrollTrigger?.refresh(); }, 150);
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.hash);
    if (!target) return;
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('kumu:reveal-target', {detail: target}));
    const smoother = window.ScrollSmoother?.get();
    if (smoother) smoother.scrollTo(target.offsetTop * parseFloat(root.style.getPropertyValue('--canvas-scale')), true);
    else target.scrollIntoView({behavior:'smooth'});
    history.pushState(null, '', link.hash);
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
  });
  const topLink = document.querySelector('.back-top');
  window.addEventListener('scroll', () => topLink.classList.toggle('is-visible', window.scrollY > 700), {passive:true});
  document.addEventListener('focusin', event => {
    if (!event.target.closest('main')) return;
    document.dispatchEvent(new CustomEvent('kumu:reveal-target', {detail:event.target}));
  });
  window.addEventListener('pageshow', event => { if(event.persisted) window.ScrollTrigger?.refresh(); });
})();
