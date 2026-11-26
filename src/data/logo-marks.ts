/*
  Tenonpath mark geometry. Concept A (slot and stem) was chosen at the phase 1 review.
  32-unit grid. Every edge sits on an even coordinate so the mark lands on whole pixels at 16px.
  The 2-unit gap around the joint is 1px at 16px, the thinnest line that still renders.

  fixed = the mortise piece (the T's bar, slot cut from below).
  tenon = the moving piece (the stem, shoulders cut so its tongue seats in the slot).
  axis / from = how the tenon travels into place, in grid units (see src/scripts/logo.ts).
*/
export type Concept = 'a' | 'a-v1';

export interface MarkGeometry {
  fixed: string;
  tenon: string;
  axis: 'x' | 'y';
  from: number;
}

export const MARKS: Record<Concept, MarkGeometry> = {
  // A, refined (the mark in use). Bar 10 units tall (was 12), stem 12 wide (was 16),
  // tongue 4 wide in an 8 wide slot. Stem edges stay symmetric on even units, so 12 is the
  // next step down from 16 that keeps the 16px favicon crisp.
  a: {
    fixed: 'M2 2H30V12H20V6H12V12H2Z',
    tenon: 'M14 8H18V14H22V30H10V14H14Z',
    axis: 'y',
    from: 12,
  },
  // A, original from phase 1. Kept on /styleguide for comparison only.
  'a-v1': {
    fixed: 'M2 2H30V14H22V8H10V14H2Z',
    tenon: 'M12 10H20V16H24V30H8V16H12Z',
    axis: 'y',
    from: 12,
  },
};
