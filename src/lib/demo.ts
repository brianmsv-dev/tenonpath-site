/*
  Demo dashboard data layer. Everything is computed at build time from src/data/demo/*.json.

  Dates: the data is generated "as of" a fixed Friday. At build, every date moves forward by
  whole weeks so the as-of date is the most recent Friday on or before the build. Weekdays,
  the 180-day window and "this month" stay consistent; the demo never looks stale.
*/
import portfolio from '../data/demo/portfolio.json';
import payments from '../data/demo/payments.json';
import weeklyRaw from '../data/demo/collections-weekly.json';
import tasksRaw from '../data/demo/tasks.json';
import criticalRaw from '../data/demo/critical-dates.json';
import pipelineRaw from '../data/demo/pipeline.json';

const DAY = 86400000;
const dataAsOf = Date.parse(portfolio.asOf + 'T00:00:00Z');
const now = Date.now();
const shiftDays = Math.max(0, Math.floor((now - dataAsOf) / DAY / 7) * 7);

const shift = (isoDate: string) => Date.parse(isoDate + 'T00:00:00Z') + shiftDays * DAY;
const asOfTime = dataAsOf + shiftDays * DAY;

/* ---------- Formatting ---------- */
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const num = new Intl.NumberFormat('en-US');
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const fmt = {
  usd: (n: number) => usd0.format(n),
  usdCents: (n: number) => usd2.format(n),
  num: (n: number) => num.format(n),
  sf: (n: number) => `${num.format(n)} SF`,
  pct: (n: number, digits = 1) => `${n.toFixed(digits)}%`,
  date: (t: number) => dateFmt.format(t),
  short: (t: number) => shortDate.format(t),
  /** "$0" for zero amounts reads as noise in aging tables; show a quiet dash instead. */
  usdOrDash: (n: number) => (n ? usd0.format(n) : '-'),
};

/* ---------- Core entities ---------- */
export const NAME = portfolio.name;
export const AS_OF = asOfTime;

type Aging = { d0_30: number; d31_60: number; d61_90: number; d90p: number };

export const properties = portfolio.properties;
const propertyById = Object.fromEntries(properties.map((p) => [p.id, p]));
export const propertyName = (id: string) => propertyById[id]?.name ?? id;

export const tenants = portfolio.tenants.map((t) => {
  const aging = t.aging as Aging;
  return {
    ...t,
    aging,
    balance: aging.d0_30 + aging.d31_60 + aging.d61_90 + aging.d90p,
    leaseEndTime: shift(t.leaseEnd),
    propertyName: propertyName(t.propertyId),
  };
});
const tenantById = Object.fromEntries(tenants.map((t) => [t.id, t]));
export const tenantName = (id: string) => tenantById[id]?.name ?? id;

export const paymentsThisMonth = payments.map((p) => ({
  ...p,
  time: shift(p.date),
  tenant: tenantById[p.tenantId],
}));

export const weekly = weeklyRaw.map((w) => ({ time: shift(w.weekEnding), amount: w.amount }));

/* ---------- Overview ---------- */
const totalSf = properties.reduce((s, p) => s + p.sf, 0);
const vacantSf = properties.reduce((s, p) => s + p.vacant, 0);
const open = tasksRaw.filter((t) => t.status !== 'Done');

export const keyFigures = {
  occupancy: ((totalSf - vacantSf) / totalSf) * 100,
  collected: paymentsThisMonth.reduce((s, p) => s + p.amount, 0),
  pastDue: tenants.reduce((s, t) => s + t.balance, 0),
  openTasks: open.length,
};

export const propertyRows = properties.map((p) => {
  const ts = tenants.filter((t) => t.propertyId === p.id);
  const ids = new Set(ts.map((t) => t.id));
  return {
    ...p,
    occupancy: ((p.sf - p.vacant) / p.sf) * 100,
    tenantCount: ts.length,
    collected: paymentsThisMonth.filter((x) => ids.has(x.tenantId)).reduce((s, x) => s + x.amount, 0),
    pastDue: ts.reduce((s, t) => s + t.balance, 0),
    openTasks: open.filter((t) => t.propertyId === p.id).length,
  };
});

/* ---------- Collections ---------- */
export const receivables = tenants
  .filter((t) => t.balance > 0)
  .sort((a, b) => b.aging.d90p - a.aging.d90p || b.aging.d61_90 - a.aging.d61_90 || b.balance - a.balance);

export const agingTotals = receivables.reduce(
  (s, t) => ({
    d0_30: s.d0_30 + t.aging.d0_30,
    d31_60: s.d31_60 + t.aging.d31_60,
    d61_90: s.d61_90 + t.aging.d61_90,
    d90p: s.d90p + t.aging.d90p,
  }),
  { d0_30: 0, d31_60: 0, d61_90: 0, d90p: 0 },
);

/* ---------- Leases: critical dates in the next 180 days ---------- */
export const criticalDates = criticalRaw
  .map((c) => {
    const time = shift(c.date);
    const t = tenantById[c.tenantId];
    return { ...c, time, days: Math.round((time - asOfTime) / DAY), tenant: t.name, property: t.propertyName, suite: t.suite, propertyId: t.propertyId };
  })
  .filter((c) => c.days >= 0 && c.days <= 180);

/* ---------- Tasks ---------- */
export const STATUS_ORDER = ['Stuck', 'Waiting on vendor', 'Working on it', 'Not started', 'Done'];
export const tasksByProperty = properties.map((p) => ({
  property: p,
  open: open.filter((t) => t.propertyId === p.id).length,
  tasks: tasksRaw
    .filter((t) => t.propertyId === p.id)
    .map((t) => ({ ...t, time: shift(t.due) }))
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.time - b.time),
}));
export const taskCounts = STATUS_ORDER.map((s) => ({ status: s, count: tasksRaw.filter((t) => t.status === s).length }));

/* ---------- Pipeline ---------- */
export const STAGES = ['Under review', 'LOI', 'Under contract', 'Closed'];
export const pipeline = STAGES.map((stage) => {
  const deals = pipelineRaw.filter((d) => d.stage === stage).map((d) => ({ ...d, nextTime: shift(d.nextDate.date) }));
  return { stage, deals, volume: deals.reduce((s, d) => s + d.price, 0), sf: deals.reduce((s, d) => s + d.sf, 0) };
});
