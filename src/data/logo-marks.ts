/*
  Tenonpath mark geometry, three concepts (docs/BRAND.md > Logo).
  32-unit grid. Every edge sits on an even coordinate so the mark lands on whole pixels at 16px.
  The 2-unit gap around each joint is 1px at 16px, the thinnest line that still renders.

  fixed = the mortise piece. tenon = the moving piece.
  axis / from = how the tenon travels into place, in grid units (see src/scripts/logo.ts).
*/
export type Concept = 'a' | 'b' | 'c';

export interface MarkGeometry {
  fixed: string;
  tenon: string;
  axis: 'x' | 'y';
  from: number;
}

export const MARKS: Record<Concept, MarkGeometry> = {
  // A: the T's bar is the mortise with a slot cut from below; the stem is the tenon,
  // shoulders cut so its tongue seats in the slot. Travels up.
  a: {
    fixed: 'M2 2H30V14H22V8H10V14H2Z',
    tenon: 'M12 10H20V16H24V30H8V16H12Z',
    axis: 'y',
    from: 12,
  },
  // B: two offset blocks, a stout square T. The left block carries a notch in its stem,
  // the right block a tongue. The seam sits 1 unit left of center. Travels left.
  b: {
    fixed: 'M2 2H14V14H10V24H14V30H6V12H2Z',
    tenon: 'M16 2H30V12H26V30H16V22H12V16H16Z',
    axis: 'x',
    from: 10,
  },
  // C: a square with a T cut out of it; the cut piece drops back into place. Travels down.
  c: {
    fixed: 'M2 2H6V12H10V26H22V12H26V2H30V30H2Z',
    tenon: 'M8 2H24V10H20V24H12V10H8Z',
    axis: 'y',
    from: -10,
  },
};
