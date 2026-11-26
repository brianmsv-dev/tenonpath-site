/*
  Homepage section motion (docs/SITE_SPEC.md 02 and 05). Markup is always the end state;
  these only run with motion allowed, and gsap.matchMedia reverts them if that changes.

  02 Problem: on enter, the week's rows slide in one by one, then a brass line strikes through
     each task's text in turn as it dims, then "Or: open one dashboard." arrives. Plays once.
  05 Process: a brass line draws along the measured line as the section scrolls through
     (scrubbed, no pin), and each step's tick locks when the line reaches it.
*/
import { gsap, ScrollTrigger, MOTION_OK } from './motion';

const mm = gsap.matchMedia();

mm.add(MOTION_OK, () => {
  /* 02 Problem */
  const week = document.querySelector<HTMLElement>('[data-week]');
  if (week) {
    const rows = gsap.utils.toArray<HTMLElement>(week.querySelectorAll('[data-week-row]'));
    const texts = gsap.utils.toArray<HTMLElement>(week.querySelectorAll('[data-week-text]'));
    const answer = week.querySelector<HTMLElement>('[data-week-answer]');
    // Unstruck start: full-brightness text, no line. Colours are the bone / bone-dim tokens.
    gsap.set(texts, { backgroundSize: '0% 1.5px', color: '#ede8df' });
    const tl = gsap.timeline({ scrollTrigger: { trigger: week, start: 'top 70%', once: true } });
    tl.fromTo(rows, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.14, ease: 'power3.out' })
      .to(texts, { backgroundSize: '100% 1.5px', color: '#a9a39a', duration: 0.45, stagger: 0.09, ease: 'power3.out' }, '+=0.25')
      .fromTo(answer, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '+=0.1');
  }
});

/* 05 Process: rebuilt when the line switches between vertical and horizontal (900px). */
mm.add({ ok: MOTION_OK, wide: '(min-width: 900px)' }, (ctx) => {
  const { ok, wide } = ctx.conditions as Record<string, boolean>;
  if (!ok) return;
  const steps = document.querySelector<HTMLElement>('[data-steps]');
  if (steps) {
    const progress = steps.querySelector<HTMLElement>('[data-steps-progress]')!;
    const items = gsap.utils.toArray<HTMLElement>(steps.querySelectorAll('[data-step]'));
    const horizontal = () => wide;

    // Where each tick sits along the line, as a share of the line's length.
    let marks: number[] = [];
    const measure = () => {
      const box = progress.parentElement!.getBoundingClientRect();
      marks = items.map((item) => {
        const tick = item.querySelector<HTMLElement>('[data-step-tick]')!.getBoundingClientRect();
        return horizontal()
          ? (tick.left + tick.width / 2 - box.left) / box.width
          : (tick.top + tick.height / 2 - box.top) / box.height;
      });
    };
    const lock = (p: number) => items.forEach((item, i) => item.classList.toggle('is-locked', p >= marks[i] - 0.001));

    items.forEach((item) => item.classList.remove('is-locked'));
    const tween = gsap.fromTo(
      progress,
      { scaleX: horizontal() ? 0 : 1, scaleY: horizontal() ? 1 : 0 },
      { scaleX: 1, scaleY: 1, ease: 'none' },
    );
    ScrollTrigger.create({
      trigger: steps,
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: true,
      animation: tween,
      onRefresh: (self) => {
        measure();
        lock(self.progress);
      },
      onUpdate: (self) => lock(self.progress),
    });

    return () => items.forEach((item) => item.classList.add('is-locked'));
  }
});
