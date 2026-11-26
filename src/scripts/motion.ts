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

  // Opacity only (never visibility: hidden), so content that has not been revealed yet is still
  // in the accessibility tree and reachable by screen readers and keyboard.
  mm.add(MOTION_OK, () => {
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
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
      if (ends.length) tl.fromTo(ends, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power3.out' }, '-=0.35');
      if (label) tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power3.out' }, 0.1);
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

/* ---------- Anchor links ----------
  Content below the hero can change height after a jump starts (the pinned hero's spacer
  settling, fonts, and the lazy-loaded demo embed growing by ~800px). A plain scroll to the
  target's position at click time can then land a whole section early. So we keep the target
  and, while the jump is in progress and for a short time after, re-snap whenever the page
  height changes, until the target sits under the header.
*/
const HEADER_OFFSET = 72;
let pendingTarget: HTMLElement | null = null;
let settleTimer = 0;

function targetY(el: HTMLElement) {
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
}

function scrollToTarget(el: HTMLElement, immediate = false) {
  if (lenis && !immediate) {
    lenis.scrollTo(targetY(el), { duration: 1.1, onComplete: () => settle(el) });
  } else {
    lenis ? lenis.scrollTo(targetY(el), { immediate: true }) : window.scrollTo(0, targetY(el));
    settle(el);
  }
}

function settle(el: HTMLElement) {
  if (pendingTarget !== el) return;
  const off = el.getBoundingClientRect().top - HEADER_OFFSET;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const want = Math.min(targetY(el), maxY);
  // Stop when we are there, or when the page cannot scroll any closer (e.g. the last section).
  if (Math.abs(off) <= 4 || Math.abs(window.scrollY - want) <= 2) return;
  scrollToTarget(el, true);
}

function goToHash(hash: string, immediate = false) {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  const el = id ? document.getElementById(id) : null;
  if (!el) return false;
  pendingTarget = el;
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => (pendingTarget = null), 4000);
  ScrollTrigger.refresh();
  scrollToTarget(el, immediate || prefersReducedMotion());
  return true;
}

// Re-snap when the layout grows or shrinks during a pending jump.
new ResizeObserver(() => {
  if (pendingTarget) settle(pendingTarget);
}).observe(document.body);

// The user taking over (wheel, touch, keys) cancels the pending jump.
['wheel', 'touchstart', 'keydown'].forEach((type) =>
  window.addEventListener(type, () => (pendingTarget = null), { passive: true }),
);

document.addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  if (!document.getElementById(decodeURIComponent(url.hash.slice(1)))) return;
  e.preventDefault();
  history.pushState(null, '', url.hash);
  goToHash(url.hash);
});

// Arriving from another page with a hash (e.g. /privacy -> /#pricing).
if (location.hash) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const go = () => goToHash(location.hash, true);
  window.addEventListener('load', () => { go(); window.setTimeout(go, 300); }, { once: true });
  document.fonts?.ready.then(go);
}
window.addEventListener('popstate', () => goToHash(location.hash, true));

export function getLenis() {
  return lenis;
}
