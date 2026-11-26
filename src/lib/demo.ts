/*
  Demo dashboard data layer. Everything is computed at build time from src/data/demo/*.json.

  Money: the data holds integer cents, whole dollars only. Amounts become dollars only here, at
  display. A tie-out check at the bottom runs on every build and throws (failing the build) if any
  displayed total does not equal the sum of the figures it summarises.

  Dates: the data is "as of" the 20th of a month. At build, every date moves forward by whole
  months so the as-of date is the most recent 20th on or before the build. Day of month is kept,
  so "this month vs last month" and the 180-day window stay right. Each deploy refreshes it.
*/
import portfolio from '../data/demo/portfolio.json';
import paymentsRaw from '../data/demo/payments.json';
import lastMonthRaw from '../data/demo/payments-last-month.json';
import tasksRaw from '../data/demo/tasks.json';
import criticalRaw from '../data/demo/critical-dates.json';
import pipelineRaw from '../data/demo/pipeline.json';

const DAY = 86400000;
const dataAsOf = new Date(portfolio.asOf + 'T00:00:00Z');

/* ---------- Month shift ---------- */
const now = new Date();
let monthShift = (now.getUTCFullYear() - dataAsOf.getUTCFullYear()) * 12 + (now.getUTCMonth() - dataAsOf.getUTCMonth());
if (now.getUTCDate() < dataAsOf.getUTCDate()) monthShift -= 1;
monthShift = Math.max(0, monthShift);

const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
function shift(isoDate: string) {
  const d = new Date(isoDate + 'T00:00:00Z');
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + monthShift;
  const ty = y + Math.floor(m / 12);
  const tm = ((m % 12) + 12) % 12;
  return Date.UTC(ty, tm, Math.min(d.getUTCDate(), daysIn(ty, tm)));
}
const asOfTime = shift(portfolio.asOf);
const asOfDate = new Date(asOfTime);

/* ---------- Formatting (cents in, display out) ---------- */
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-US');
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });

export const fmt = {
  /** cents -> "$12,345". Amounts are whole dollars, so this never rounds. */
  usd: (cents: number) => usd0.format(cents / 100),
  usdOrDash: (cents: number) => (cents ? usd0.format(cents / 100) : '-'),
  num: (n: number) => num.format(n),
  sf: (n: number) => `${num.format(n)} SF`,
  pct: (n: number, digits = 1) => `${n.toFixed(digits)}%`,
  date: (t: number) => dateFmt.format(t),
  short: (t: number) => shortDate.format(t),
  month: (t: number) => monthFmt.format(t),
};

/* ---------- Core entities ---------- */
export const NAME = portfolio.name;
export const AS_OF = asOfTime;
export const AS_OF_DAY = asOfDate.getUTCDate();
export const THIS_MONTH = fmt.month(asOfTime);
const lastMonthStart = Date.UTC(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth() - 1, 1);
export const LAST_MONTH = fmt.month(lastMonthStart);
export const LAST_MONTH_DAYS = daysIn(new Date(lastMonthStart).getUTCFullYear(), new Date(lastMonthStart).getUTCMonth());

type Aging = { d0_30: number; d31_60: number; d61_90: number; d90p: number };
export const BUCKETS = [
  ['d0_30', '0 to 30'],
  ['d31_60', '31 to 60'],
  ['d61_90', '61 to 90'],
  ['d90p', '90+'],
] as const;

export const properties = portfolio.properties;
const propertyById = Object.fromEntries(properties.map((p) => [p.id, p]));
export const propertyName = (id: string) => propertyById[id]?.name ?? id;

export const tenants = portfolio.tenants.map((t) => {
  const aging = t.aging as Aging;
  return {
    ...t,
    aging,
    balance: aging.d0_30 + aging.d31_60 + aging.d61_90 + aging.d90p,
    propertyName: propertyName(t.propertyId),
  };
});
const tenantById = Object.fromEntries(tenants.map((t) => [t.id, t]));

export const paymentsThisMonth = paymentsRaw.map((p) => ({ ...p, time: shift(p.date), tenant: tenantById[p.tenantId] }));
const paymentsLastMonth = lastMonthRaw.map((p) => ({ ...p, time: shift(p.date), tenant: tenantById[p.tenantId] }));

/* ---------- Tasks ---------- */
export const STATUS_ORDER = ['Stuck', 'Waiting on vendor', 'Working on it', 'Not started', 'Done'];
const tasks = tasksRaw.map((t) => {
  const time = shift(t.due);
  const open = t.status !== 'Done';
  return { ...t, time, open, overdue: open && time < asOfTime, propertyName: propertyName(t.propertyId) };
});
const openTasks = tasks.filter((t) => t.open);

/* ---------- Overview ---------- */
const totalSf = properties.reduce((s, p) => s + p.sf, 0);
const vacantSf = properties.reduce((s, p) => s + p.vacant, 0);

export const keyFigures = {
  occupancy: ((totalSf - vacantSf) / totalSf) * 100,
  collected: paymentsThisMonth.reduce((s, p) => s + p.amount, 0),
  pastDue: tenants.reduce((s, t) => s + t.balance, 0),
  openTasks: openTasks.length,
  overdueTasks: openTasks.filter((t) => t.overdue).length,
};

export const propertyRows = properties.map((p) => {
  const ts = tenants.filter((t) => t.propertyId === p.id);
  const ids = new Set(ts.map((t) => t.id));
  const pt = openTasks.filter((t) => t.propertyId === p.id);
  return {
    ...p,
    occupancy: ((p.sf - p.vacant) / p.sf) * 100,
    collected: paymentsThisMonth.filter((x) => ids.has(x.tenantId)).reduce((s, x) => s + x.amount, 0),
    pastDue: ts.reduce((s, t) => s + t.balance, 0),
    openTasks: pt.length,
    overdueTasks: pt.filter((t) => t.overdue).length,
  };
});

/* Collected this month vs last month: cumulative by day of month */
function cumulative(list: { time: number; amount: number }[], days: number) {
  const perDay = Array.from({ length: days }, () => 0);
  for (const p of list) perDay[Math.min(new Date(p.time).getUTCDate(), days) - 1] += p.amount;
  let run = 0;
  return perDay.map((v) => (run += v));
}
export const cumulativeThisMonth = cumulative(paymentsThisMonth, AS_OF_DAY);
export const cumulativeLastMonth = cumulative(paymentsLastMonth, LAST_MONTH_DAYS);
export const lastMonthAtSameDay = cumulativeLastMonth[Math.min(AS_OF_DAY, LAST_MONTH_DAYS) - 1];

/* ---------- Collections ---------- */
export const receivables = tenants
  .filter((t) => t.balance > 0)
  .sort((a, b) => b.aging.d90p - a.aging.d90p || b.aging.d61_90 - a.aging.d61_90 || b.balance - a.balance);

export const agingTotals = Object.fromEntries(BUCKETS.map(([k]) => [k, receivables.reduce((s, t) => s + t.aging[k], 0)])) as Aging;

/* ---------- Leases: critical dates in the next 180 days ---------- */
export const criticalDates = criticalRaw
  .map((c) => {
    const time = shift(c.date);
    const t = tenantById[c.tenantId];
    return { ...c, time, days: Math.round((time - asOfTime) / DAY), tenant: t.name, property: t.propertyName, suite: t.suite };
  })
  .filter((c) => c.days >= 0 && c.days <= 180)
  .sort((a, b) => a.time - b.time);

/* ---------- Tasks views ---------- */
export const tasksByProperty = properties.map((p) => ({
  property: p,
  open: openTasks.filter((t) => t.propertyId === p.id).length,
  overdue: openTasks.filter((t) => t.propertyId === p.id && t.overdue).length,
  tasks: tasks
    .filter((t) => t.propertyId === p.id)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.time - b.time),
}));
export const openTasksByDue = [...openTasks].sort((a, b) => a.time - b.time);
export const taskCounts = STATUS_ORDER.map((s) => ({ status: s, count: tasks.filter((t) => t.status === s).length }));

/* ---------- Pipeline ---------- */
export const STAGES = ['Under review', 'LOI', 'Under contract', 'Closed'];
export const pipeline = STAGES.map((stage) => {
  const deals = pipelineRaw
    .filter((d) => d.stage === stage)
    .map((d) => ({ ...d, pricePerSf: Math.round(d.price / d.sf), nextTime: shift(d.nextDate.date) }));
  return { stage, deals, volume: deals.reduce((s, d) => s + d.price, 0), sf: deals.reduce((s, d) => s + d.sf, 0) };
});

/* ---------- Tie-out (runs on every build; a mismatch fails the build) ---------- */
{
  const problems: string[] = [];
  const tie = (label: string, total: number, parts: number[]) => {
    const sum = parts.reduce((s, x) => s + x, 0);
    // Compare both the exact cents and the figures as displayed.
    if (sum !== total || fmt.usd(sum) !== fmt.usd(total)) problems.push(`${label}: ${fmt.usd(sum)} vs ${fmt.usd(total)}`);
  };
  const whole = (label: string, cents: number) => {
    if (!Number.isInteger(cents) || cents % 100 !== 0) problems.push(`${label} is not whole dollars`);
  };
  for (const t of tenants) {
    Object.values(t.aging).forEach((v) => whole(`${t.name} aging`, v));
    tie(`${t.name} balance`, t.balance, BUCKETS.map(([k]) => t.aging[k]));
  }
  for (const p of [...paymentsThisMonth, ...paymentsLastMonth]) whole(`payment ${p.tenantId}`, p.amount);
  tie('aging buckets vs past due', keyFigures.pastDue, BUCKETS.map(([k]) => agingTotals[k]));
  tie('tenant balances vs past due', keyFigures.pastDue, receivables.map((t) => t.balance));
  tie('properties past due vs portfolio', keyFigures.pastDue, propertyRows.map((p) => p.pastDue));
  tie('properties collected vs portfolio', keyFigures.collected, propertyRows.map((p) => p.collected));
  tie('payments vs collected', keyFigures.collected, paymentsThisMonth.map((p) => p.amount));
  if (cumulativeThisMonth[cumulativeThisMonth.length - 1] !== keyFigures.collected) problems.push('chart end vs collected this month');
  if (propertyRows.reduce((s, p) => s + p.openTasks, 0) !== keyFigures.openTasks) problems.push('property open tasks vs total');
  if (tasksByProperty.reduce((s, p) => s + p.overdue, 0) !== keyFigures.overdueTasks) problems.push('property overdue vs total');
  if (fmt.pct(keyFigures.occupancy) !== '94.2%' || fmt.usd(keyFigures.collected) !== '$412,860' || fmt.usd(keyFigures.pastDue) !== '$18,240' || keyFigures.openTasks !== 37)
    problems.push('headline figures no longer match the homepage hero');
  if (problems.length) throw new Error('Demo data does not tie out:\n  ' + problems.join('\n  '));
}
