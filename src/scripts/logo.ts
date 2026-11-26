/*
  Logo animation: the tenon slides into the mortise along one axis and stops,
  then presses home the last screen pixel (the "1px settle"). 620ms total.

  Uses the Web Animations API on the SVG path, so it costs no GSAP and runs off the main thread
  where the browser allows. CSS px inside SVG transforms are user units, which is what we want.

  Triggers: [data-autoplay] marks play on load; any [data-logo-hover] container replays its mark
  on pointer enter; [data-logo-replay] buttons replay the mark they point at.
  Reduced motion: nothing moves. The mark is always drawn in its final state.
*/
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const DURATION = 620;
const EXPO_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const POWER3_OUT = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

export function playLogo(svg: SVGSVGElement, { force = false } = {}) {
  if (reduced.matches) return;
  const tenon = svg.querySelector<SVGPathElement>('[data-tenon]');
  if (!tenon) return;

  const running = tenon.getAnimations().some((a) => a.playState === 'running');
  if (running && !force) return;
  tenon.getAnimations().forEach((a) => a.cancel());

  const axis = svg.dataset.axis === 'x' ? 'x' : 'y';
  const from = Number(svg.dataset.from) || 0;
  // One screen pixel, expressed in grid units at the mark's current size.
  const unitsPerPx = 32 / Math.max(svg.getBoundingClientRect().width, 1);
  const settle = Math.sign(from) * unitsPerPx;
  const at = (v: number) => (axis === 'x' ? `translate(${v}px, 0px)` : `translate(0px, ${v}px)`);

  tenon.animate(
    [
      { transform: at(from), opacity: 0, offset: 0, easing: EXPO_OUT },
      { transform: at(settle), opacity: 1, offset: 0.72, easing: POWER3_OUT },
      { transform: at(0), opacity: 1, offset: 1 },
    ],
    // 'both' holds the end state, which matters for autoplay marks hidden by CSS until they play.
    { duration: DURATION, fill: 'both' },
  );
}

function init() {
  document.querySelectorAll<SVGSVGElement>('svg[data-logo][data-autoplay]').forEach((svg) => playLogo(svg));

  document.querySelectorAll<HTMLElement>('[data-logo-hover]').forEach((el) => {
    const svg = el.querySelector<SVGSVGElement>('svg[data-logo]');
    if (svg) el.addEventListener('pointerenter', () => playLogo(svg));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-logo-replay]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.logoReplay || '');
      target?.querySelectorAll<SVGSVGElement>('svg[data-logo]').forEach((svg) => playLogo(svg, { force: true }));
    });
  });
}

init();
