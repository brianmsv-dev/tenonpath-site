/*
  Site motion: Lenis smooth scroll driven by the GSAP ticker, ScrollTrigger kept in sync,
  and the shared "enter once" animations (reveal, measurement lines).

  Reduced motion: no Lenis (native scroll), no movement. Elements show their end state.
  The preference is watched live, so toggling it in the OS takes effect without a reload.
*/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)';
const reducedQuery = window.matchMedia(MOTION_REDUCED);

export const prefersReducedMotion = () => reducedQuery.matches;

/* ---------- Lenis ---------- */
let lenis: Lenis | null = null;
const raf = (time: number) => lenis?.raf(time * 1000);

function startLenis() {
  if (lenis) return;
  lenis = new Lenis({
    lerp: 0.12,
    smoothWheel: true,
    anchors: { offset: -72 }, // leave room for the header when it reappears
    autoRaf: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
}

function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
}

/** Freeze page scrolling (e.g. while the mobile menu is open). */
export function lockScroll() {
  if (lenis) lenis.stop();
  document.documentElement.style.overflow = 'hidden';
}
export function unlockScroll() {
  document.documentElement.style.overflow = '';
  if (lenis) lenis.start();
}

/* ---------- Shared enter-once animations ---------- */
function initReveals() {
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    });

    // Measurement lines draw outward from the label, then the end ticks lock.
    gsap.utils.toArray<HTMLElement>('[data-measure]').forEach((el) => {
      const lines = el.querySelectorAll<HTMLElement>('.measure__line');
      const ends = el.querySelectorAll<HTMLElement>('.measure__end');
      const label = el.querySelector<HTMLElement>('.measure__label');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
      tl.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.out' });
      if (ends.length) tl.fromTo(ends, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'power3.out' }, '-=0.35');
      if (label) tl.fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power3.out' }, 0.1);
    });
  });

  mm.add(MOTION_REDUCED, () => {
    // End states only. Clear anything a previous no-preference context left behind.
    gsap.set('[data-reveal], .measure__line, .measure__end, .measure__label', { clearProps: 'all' });
  });
}

/* ---------- Boot ---------- */
function applyPreference() {
  if (reducedQuery.matches) stopLenis();
  else startLenis();
  ScrollTrigger.refresh();
}

applyPreference();
reducedQuery.addEventListener('change', applyPreference);
initReveals();

// Fonts change line lengths; recalc trigger positions once they are in.
document.fonts?.ready.then(() => ScrollTrigger.refresh());

export function getLenis() {
  return lenis;
}
