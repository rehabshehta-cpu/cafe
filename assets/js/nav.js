import { $, $$, setupReveal, setupRain, hidePreloader, waitForFonts } from './utils.js';

export function initNav() {
  const navbar = $('.navbar');
  const toggle = $('#navToggle');
  const links = $('#navLinks');

  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  links?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const sections = $$('section[id], header[id]');
  const navAnchors = links?.querySelectorAll('a') || [];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => {
            a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

export function initPreloader() {
  Promise.all([waitForFonts(), new Promise((r) => setTimeout(r, 800))])
    .then(() => hidePreloader());
}

export function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const visual = $('.hero-visual');
  if (!visual) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      visual.style.transform = `translateY(${y * 0.15}px)`;
    }
  }, { passive: true });
}

export function initGlobalEffects() {
  setupReveal();
  setupRain();
  initPreloader();
  initHeroParallax();
}
