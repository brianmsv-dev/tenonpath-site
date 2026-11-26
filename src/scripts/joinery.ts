/*
  Hero joinery animation (docs/SITE_SPEC.md > 01 Hero).

  Desktop (1024px+): the hero pins for 175vh of scroll and the timeline is scrubbed by scroll.
  Below 1024px: no pin; the sequence plays once, at a fixed speed, when the drawing enters view.
  Reduced motion: nothing is set up. The SVG markup is already the end state.

  Sequence: each block straightens and slides along its one axis, stops 1 screen pixel short,
  then presses home. On lock, its brass seat line flashes and the counter ticks up. After all
  five, the dashboard appears, the figures count up and the chart line draws itself.
*/
import { gsap, ScrollTrigger } from './motion';
import { formatFigure } from '../data/joinery';

type Format = 'pct' | 'usd' | 'int';

const BONE = '#ede8df';
const BRASS = '#c8963e';
const STEP = 0.9; // timeline seconds between block starts
const SLIDE = 0.8;
const SETTLE = 0.15;

/** Exact end values: the SITE_SPEC figures, full chart line, all five connected. */
function writeFinalState(svg: SVGSVGElement, counter: HTMLElement | null) {
  svg.querySelectorAll<SVGTextElement>('[data-count]').forEach((el) => {
    el.textContent = formatFigure(Number(el.dataset.count), el.dataset.format as Format);
  });
  const chart = svg.querySelector<SVGPathElement>('[data-chart]');
  if (chart) gsap.set(chart, { strokeDashoffset: 0 });
  const total = svg.querySelectorAll('[data-block]').length;
  if (counter) counter.textContent = `${total}/${total} CONNECTED`;
}

function build(svg: SVGSVGElement, counter: HTMLElement | null) {
  const vbWidth = svg.viewBox.baseVal.width;
  const unitsPerPx = vbWidth / Math.max(svg.getBoundingClientRect().width, 1);
  const blocks = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll('[data-block]'));
  const total = blocks.length;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  const lockTimes: number[] = [];

  // Loose links start visible, then fade as their first block moves.
  svg.querySelectorAll<SVGPathElement>('[data-link]').forEach((link) => {
    gsap.set(link, { opacity: 0.8 });
    tl.to(link, { opacity: 0, duration: 0.4 }, Number(link.dataset.link) * STEP);
  });

  blocks.forEach((block, i) => {
    const axis = block.dataset.axis === 'x' ? 'x' : 'y';
    const from = Number(block.dataset.from) || 0;
    const rot = Number(block.dataset.rot) || 0;
    const settle = Math.sign(from) * unitsPerPx;
    const tick = svg.querySelector(`[data-tick="${i}"]`);
    const t0 = i * STEP;

    gsap.set(block, { [axis]: from, rotation: rot, transformOrigin: '50% 50%' });
    gsap.set(tick, { opacity: 0 });

    tl.to(block, { [axis]: settle, rotation: 0, duration: SLIDE, ease: 'expo.out' }, t0).to(
      block,
      { [axis]: 0, duration: SETTLE },
      t0 + SLIDE,
    );

    const lock = t0 + SLIDE + SETTLE;
    tl.fromTo(tick, { opacity: 0, stroke: BONE }, { opacity: 1, duration: 0.06, ease: 'none' }, lock).to(
      tick,
      { stroke: BRASS, duration: 0.35 },
      lock + 0.06,
    );
    lockTimes.push(lock);
  });

  // Dashboard
  const tDash = (total - 1) * STEP + SLIDE + SETTLE + 0.25;
  const dashParts = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll('[data-dash]'));
  const snippets = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll('[data-snippet]'));
  const chart = svg.querySelector<SVGPathElement>('[data-chart]');
  const values = gsap.utils.toArray<SVGTextElement>(svg.querySelectorAll('[data-count]'));

  tl.fromTo(dashParts, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, tDash);
  if (snippets.length) {
    // Compact layout has no snippets.
    gsap.set(snippets, { opacity: 1 });
    tl.to(snippets, { opacity: 0.45, duration: 0.6 }, tDash);
  }

  values.forEach((el) => {
    const target = Number(el.dataset.count);
    const format = el.dataset.format as Format;
    const state = { v: 0 };
    el.textContent = formatFigure(0, format);
    tl.to(
      state,
      {
        v: target,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = formatFigure(state.v, format);
        },
      },
      tDash + 0.25,
    );
  });

  if (chart) {
    gsap.set(chart, { strokeDasharray: 1, strokeDashoffset: 1 });
    tl.to(chart, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, tDash + 0.35);
  }

  // Counter follows the playhead both ways, so scrubbing back un-counts.
  const renderCount = () => {
    if (!counter) return;
    const n = lockTimes.filter((t) => tl.time() >= t).length;
    counter.textContent = `${n}/${total} CONNECTED`;
  };
  tl.eventCallback('onUpdate', renderCount);
  renderCount();

  // GSAP reverts the styles it set; text content is ours to restore.
  const cleanup = () => writeFinalState(svg, counter);

  return { tl, cleanup };
}

function init() {
  const root = document.querySelector<HTMLElement>('[data-joinery-root]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!root || !hero) return;
  const counter = root.querySelector<HTMLElement>('[data-joinery-counter]');

  const mm = gsap.matchMedia();
  mm.add(
    {
      desktop: '(min-width: 1024px)',
      phone: '(max-width: 639.98px)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { desktop, phone, reduce } = ctx.conditions as Record<string, boolean>;
      root.classList.add('is-ready');
      if (reduce) return;

      const svg = root.querySelector<SVGSVGElement>(phone ? '[data-joinery="compact"]' : '[data-joinery="wide"]');
      if (!svg) return;
      const { tl, cleanup } = build(svg, counter);

      if (desktop) {
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: '+=175%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          animation: tl,
        });
        return cleanup;
      }

      /* Play once. Whatever happens (fast scroll past, page loaded below the hero, tab sent to
         the background mid-play, a stalled frame loop), it must end on the exact final state. */
      tl.timeScale(1.9);
      let safety = 0;
      const finish = () => {
        if (tl.progress() < 1) tl.progress(1);
        writeFinalState(svg, counter);
      };
      const play = () => {
        if (tl.progress() >= 1 || tl.isActive()) return;
        tl.play();
        // Backstop in case rAF is throttled: finish shortly after the nominal end.
        window.clearTimeout(safety);
        safety = window.setTimeout(finish, (tl.duration() / tl.timeScale()) * 1000 + 1500);
      };
      const onVisibility = () => {
        if (document.hidden && tl.progress() > 0) finish();
      };

      const st = ScrollTrigger.create({
        trigger: svg,
        start: 'top 85%',
        end: 'bottom top',
        onEnter: play,
        onEnterBack: play,
        onLeave: finish, // scrolled past before it finished: show the end state
      });
      tl.eventCallback('onComplete', () => {
        writeFinalState(svg, counter);
        st.kill();
      });
      document.addEventListener('visibilitychange', onVisibility);

      // Page opened (or restored) already scrolled past the drawing.
      if (svg.getBoundingClientRect().bottom < 0) finish();

      return () => {
        window.clearTimeout(safety);
        document.removeEventListener('visibilitychange', onVisibility);
        cleanup();
      };
    },
  );
}

init();
