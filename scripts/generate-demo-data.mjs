// Generates the fictional demo portfolio in src/data/demo/*.json. Node built-ins only.
// Run: npm run demo-data   (deterministic: the same seed always gives the same files)
//
// "Harbor & Pine Properties" is fictional and deliberately generic: mixed asset types (industrial,
// flex, a neighborhood retail center, a small office building) spread across Texas, Arizona, the
// Midwest and the Southeast. Property, tenant and deal names are invented words; cities are city
// names only; there are no street addresses. Nothing here is modeled on any real firm.
//
// Money: every amount is a whole number of dollars stored as integer cents. Displayed figures are
// therefore exact, and every total can be checked to the cent. The script refuses to write unless
// every total ties out (tenant, bucket, property, portfolio, payments, daily series) and matches
// the hero: occupancy 94.2% by SF, collected this month $412,860, past due $18,240, 37 open tasks.
import { writeFileSync, mkdirSync } from 'node:fs';

/* ---------- Deterministic randomness ---------- */
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261120);
const between = (a, b) => a + (b - a) * rnd();
const int = (a, b) => Math.floor(between(a, b + 1));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const dollars = (n) => Math.round(n) * 100; // whole dollars, in cents

/* ---------- Dates ---------- */
const AS_OF = '2026-11-20';
const day = 86400000;
const asOf = Date.parse(AS_OF + 'T00:00:00Z');
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const addDays = (t, n) => t + n * day;
const addYears = (t, n) => {
  const d = new Date(t);
  d.setUTCFullYear(d.getUTCFullYear() + n);
  return d.getTime();
};
const monthStart = Date.parse('2026-11-01T00:00:00Z');
const lastMonthStart = Date.parse('2026-10-01T00:00:00Z');

/* ---------- Targets (cents) ---------- */
const TARGET = { occupancy: 94.2, collected: 412860_00, pastDue: 18240_00, openTasks: 37 };

/* ---------- Properties ---------- */
const MIDWEST = new Set(['OH', 'IN', 'MO']);
const properties = [
  { id: 'P01', name: 'Heronfield Logistics', type: 'Industrial', city: 'Dallas', state: 'TX', sf: 186000, vacant: 0, tenants: 4 },
  { id: 'P02', name: 'Pinewick Flex', type: 'Flex', city: 'Tempe', state: 'AZ', sf: 64000, vacant: 12000, tenants: 5 },
  { id: 'P03', name: 'Cedarholt Business Park', type: 'Industrial', city: 'Columbus', state: 'OH', sf: 88000, vacant: 9500, tenants: 6 },
  { id: 'P04', name: 'Tidemark Distribution', type: 'Industrial', city: 'Indianapolis', state: 'IN', sf: 142000, vacant: 0, tenants: 4 },
  { id: 'P05', name: 'Magnolia Reach Commerce Center', type: 'Flex', city: 'Nashville', state: 'TN', sf: 72000, vacant: 8160, tenants: 5 },
  { id: 'P06', name: 'Riverlace Crossing', type: 'Retail', city: 'Kansas City', state: 'MO', sf: 54000, vacant: 7000, tenants: 8 },
  { id: 'P07', name: 'Sawmere Industrial', type: 'Industrial', city: 'Charlotte', state: 'NC', sf: 118000, vacant: 0, tenants: 4 },
  { id: 'P08', name: 'Oakhaven Office', type: 'Office', city: 'Austin', state: 'TX', sf: 46000, vacant: 8000, tenants: 6 },
];
const totalSf = properties.reduce((s, p) => s + p.sf, 0);
const vacantSf = properties.reduce((s, p) => s + p.vacant, 0);

/* ---------- Tenants and leases ---------- */
const NAMES = {
  Industrial: shuffle([
    'Quillon Freight', 'Tarrow Fabrication', 'Vessa Medical Supply', 'Corvane Logistics', 'Ironvale Machine',
    'Palvane Packaging', 'Northwick Cold Storage', 'Rookwell Robotics', 'Selvane Auto Parts', 'Mirebank Millwork',
    'Fenlow Plumbing Supply', 'Gallowell Industrial Gas', 'Dunmere Display', 'Kinlow Cabinetry', 'Umberfield Solar',
    'Valemont Glass', 'Larkspur Event Rentals', 'Thistlewood Flooring',
  ]),
  Flex: shuffle([
    'Ondel Electric', 'Brindle Print Works', 'Kestrow Air Systems', 'Lumenrow Lighting', 'Juniper Crest Labs',
    'Halberry Signs', 'Zelmar Audio', 'Quarrystone Countertops', 'Elmsworth Mobility', 'Orrin Bay Marine Supply',
  ]),
  Retail: shuffle([
    'Ashby Lane Coffee', 'Pellmont Fitness', 'Wrenford Pet Supply', 'Yarrowby Bakery', 'Corbelle Dental Studio',
    'Tessmor Urgent Care', 'Larchmont Cleaners', 'Bramblecote Garden Shop',
  ]),
  Office: shuffle([
    'Northline Title', 'Selcroft Accounting', 'Kestrel Ridge Engineering', 'Brightvane Insurance Agency',
    'Marrowgate Design Studio', 'Foxglen Staffing',
  ]),
};
// Base rent ranges, $/SF/year. Retail and office carry higher rents on smaller suites.
const RATE = { Industrial: [4.8, 5.8], Flex: [7.8, 9.2], Retail: [14, 18], Office: [16, 20] };
const suiteName = (p, i) => (p.type === 'Industrial' && p.sf > 120000 ? `Bldg ${String.fromCharCode(65 + i)}` : `Ste ${100 + i * 10}`);

let tIndex = 0;
const tenants = [];
const vacancies = [];
for (const p of properties) {
  const leased = p.sf - p.vacant;
  const weights = Array.from({ length: p.tenants }, () => between(0.6, 1.6));
  const wsum = weights.reduce((a, b) => a + b, 0);
  let left = leased;
  weights.forEach((w, i) => {
    const sf = i === p.tenants - 1 ? left : Math.round((leased * w) / wsum / 100) * 100;
    left -= sf;
    const term = pick([3, 5, 5, 7]);
    const start = addDays(asOf, -int(120, 5 * 365));
    let end = addYears(start, term);
    while (end <= addDays(asOf, 30)) end = addYears(end, 3); // renewed
    tenants.push({
      id: `T${String(++tIndex).padStart(2, '0')}`,
      name: NAMES[p.type].pop(),
      propertyId: p.id,
      suite: suiteName(p, i),
      sf,
      rawRent: (sf * between(...RATE[p.type])) / 12,
      leaseStart: iso(start),
      leaseEnd: iso(end),
    });
  });
  if (p.vacant) vacancies.push({ propertyId: p.id, suite: suiteName(p, p.tenants), sf: p.vacant });
}

// Eight leases expire inside the next 180 days, so the Leases view has real decisions in it.
for (const t of shuffle(tenants).slice(0, 8)) {
  const end = addDays(asOf, int(12, 172));
  t.leaseEnd = iso(end);
  t.leaseStart = iso(addYears(end, -5));
}

/* ---------- Rent and receivables ---------- */
// Four small tenants carry balances. a and b have not paid this month.
const small = tenants.filter((t) => ['Retail', 'Flex'].includes(properties.find((p) => p.id === t.propertyId).type)).sort((x, y) => x.rawRent - y.rawRent);
const [a, b, c, d] = [small[0], small[2], small[4], small[6]];
const unpaid = new Set([a.id, b.id]);

// Rents are whole dollars; payers' rents are scaled so this month's payments total exactly $412,860.
const payers = tenants.filter((t) => !unpaid.has(t.id));
const factor = TARGET.collected / 100 / payers.reduce((s, t) => s + t.rawRent, 0);
for (const t of tenants) t.monthlyRent = dollars(unpaid.has(t.id) ? t.rawRent : t.rawRent * factor);
const drift = TARGET.collected - payers.reduce((s, t) => s + t.monthlyRent, 0);
payers[payers.length - 1].monthlyRent += drift; // drift is whole dollars, so this stays whole

for (const t of tenants) t.aging = { d0_30: 0, d31_60: 0, d61_90: 0, d90p: 0 };
a.aging.d0_30 = a.monthlyRent;
b.aging.d0_30 = b.monthlyRent;
b.aging.d31_60 = b.monthlyRent;
c.aging.d61_90 = 760_00; // disputed CAM reconciliation charge
d.aging.d90p = TARGET.pastDue - a.aging.d0_30 - b.aging.d0_30 - b.aging.d31_60 - c.aging.d61_90;
if (d.aging.d90p <= 0) throw new Error('past due split failed');
const notes = { [a.id]: 'Promised payment by Friday', [b.id]: 'Two months behind, notice sent', [c.id]: 'Disputing CAM reconciliation', [d.id]: 'Old balance, payment plan proposed' };
for (const t of tenants) if (notes[t.id]) t.collectionNote = notes[t.id];

/* Payments: this month (1st to the 20th) and all of last month */
const METHODS = ['ACH', 'ACH', 'ACH', 'Check', 'Wire'];
const payDate = (start, lastDay) => addDays(start, rnd() < 0.82 ? int(0, 4) : int(5, lastDay - 1));
const payments = payers
  .map((t) => ({ tenantId: t.id, date: iso(payDate(monthStart, 20)), amount: t.monthlyRent, method: pick(METHODS) }))
  .sort((x, y) => x.date.localeCompare(y.date));
// Last month everyone paid except b (that unpaid month is b's 31 to 60 balance).
const paymentsLastMonth = tenants
  .filter((t) => t.id !== b.id)
  .map((t) => ({ tenantId: t.id, date: iso(payDate(lastMonthStart, 31)), amount: t.monthlyRent, method: pick(METHODS) }))
  .sort((x, y) => x.date.localeCompare(y.date));

/* ---------- Tasks: generic property operations, 37 open ---------- */
// [title, owners, asset types it applies to ('*' = all), needs a vacant suite, Midwest only]
const T_ALL = '*';
const TASKS = [
  // Maintenance
  ['HVAC rooftop unit repair', ['Maintenance'], T_ALL],
  ['Replace parking lot light poles', ['Maintenance', 'Property manager'], T_ALL],
  ['Paving patch and restripe', ['Maintenance', 'Property manager'], T_ALL],
  ['Gutter and downspout cleaning', ['Maintenance'], T_ALL],
  ['Dock door repair', ['Maintenance'], ['Industrial', 'Flex']],
  ['Restroom plumbing repair', ['Maintenance'], ['Office', 'Retail']],
  ['Exterior paint touch-up', ['Maintenance'], T_ALL],
  // Inspections
  ['Fire sprinkler inspection', ['Maintenance', 'Property manager'], T_ALL],
  ['Backflow test', ['Maintenance'], T_ALL],
  ['Roof inspection', ['Property manager', 'Maintenance'], T_ALL],
  ['Elevator annual inspection', ['Property manager'], ['Office']],
  ['Fire alarm annual test', ['Maintenance'], ['Office', 'Retail']],
  // Vendors
  ['Landscaping bids', ['Property manager'], T_ALL],
  ['Janitorial contract renewal', ['Property manager'], ['Office']],
  ['Pest control contract', ['Property manager'], T_ALL],
  ['Trash and recycling rebid', ['Property manager'], T_ALL],
  ['Snow removal contract', ['Property manager'], T_ALL, false, true],
  // Leasing
  ['Lease renewal proposal', ['Leasing', 'Asset manager'], T_ALL],
  ['Signage approval for new tenant', ['Leasing', 'Property manager'], ['Retail']],
  ['Make-ready', ['Maintenance', 'Property manager'], T_ALL, true],
  ['Listing photos and flyer', ['Leasing'], T_ALL, true],
  ['Broker tour', ['Leasing'], T_ALL, true],
  // Tenant requests
  ['Tenant request: thermostat not holding temperature', ['Maintenance'], ['Office', 'Flex', 'Retail']],
  ['Tenant request: access cards for new staff', ['Property manager'], ['Office']],
  ['Tenant request: storefront door closer', ['Maintenance'], ['Retail']],
  ['Tenant request: parking lot light out', ['Maintenance'], T_ALL],
  ['Tenant request: water stain on ceiling tile', ['Maintenance'], ['Office', 'Flex', 'Retail']],
  // Accounting, insurance and lender (kept a small minority)
  ['CAM reconciliation', ['Accounting'], T_ALL],
  ['Collect renewed COI', ['Property manager'], T_ALL],
  ['Estoppel request from lender', ['Asset manager'], T_ALL],
];
const OPEN = ['Not started', 'Working on it', 'Working on it', 'Waiting on vendor', 'Stuck'];
const tasks = [];
const used = new Set();
const MINORITY = /COI|Estoppel/; // insurance and lender items: at most 4 of 52
let minority = 0;
for (let i = 0; i < 52; i++) {
  const p = properties[i % properties.length];
  const open = i < TARGET.openTasks;
  const vacancy = vacancies.find((x) => x.propertyId === p.id);
  const fits = TASKS.filter(([title, , types, needsVacancy, midwest]) =>
    (types === T_ALL || types.includes(p.type)) && (!needsVacancy || vacancy) && (!midwest || MIDWEST.has(p.state)) && !used.has(p.id + title) &&
    !(MINORITY.test(title) && minority >= 4),
  );
  const [base, owners, , needsVacancy] = pick(fits);
  used.add(p.id + base);
  if (MINORITY.test(base)) minority++;
  const title = needsVacancy ? `${base}, ${vacancy.suite}` : base;
  tasks.push({
    id: `K${String(i + 1).padStart(2, '0')}`,
    propertyId: p.id,
    title,
    status: open ? pick(OPEN) : 'Done',
    owner: pick(owners),
    due: iso(addDays(asOf, open ? int(-12, 45) : int(-40, -1))),
  });
}

/* ---------- Critical dates, next 180 days ---------- */
const horizon = addDays(asOf, 180);
const critical = [];
const within = (t) => t >= asOf && t <= horizon;
const coi = new Set(shuffle(tenants).slice(0, 6).map((t) => t.id));
for (const t of tenants) {
  const end = Date.parse(t.leaseEnd + 'T00:00:00Z');
  if (within(end)) critical.push({ date: t.leaseEnd, type: 'Lease expiration', tenantId: t.id, note: `${t.sf.toLocaleString('en-US')} SF` });
  const notice = addDays(end, -90);
  if (within(notice)) critical.push({ date: iso(notice), type: 'Renewal notice deadline', tenantId: t.id, note: '90 days before expiration' });
  let anniv = Date.parse(t.leaseStart + 'T00:00:00Z');
  while (anniv < asOf) anniv = addYears(anniv, 1);
  if (within(anniv) && anniv < end) critical.push({ date: iso(anniv), type: 'Rent increase', tenantId: t.id, note: '3% annual step' });
  if (coi.has(t.id)) critical.push({ date: iso(addDays(asOf, int(3, 170))), type: 'Insurance certificate expires', tenantId: t.id, note: 'Request renewed COI' });
}
critical.sort((x, y) => x.date.localeCompare(y.date));

/* ---------- Acquisitions pipeline: mixed types and markets ---------- */
const STAGE_DEALS = [
  ['Under review', 'Project Osprey', 'Fort Worth', 'TX', 'Industrial', 96000, 7.1],
  ['Under review', 'Project Wren', 'Mesa', 'AZ', 'Retail', 41000, 7.8],
  ['Under review', 'Project Kite', 'Cincinnati', 'OH', 'Flex', 52000, 7.4],
  ['LOI', 'Project Heron', 'St. Louis', 'MO', 'Industrial', 128000, 7.0],
  ['LOI', 'Project Plover', 'Scottsdale', 'AZ', 'Office', 38500, 8.3],
  ['Under contract', 'Project Egret', 'Raleigh', 'NC', 'Flex', 61000, 7.2],
  ['Under contract', 'Project Tern', 'Houston', 'TX', 'Industrial', 154000, 6.8],
  ['Closed', 'Project Avocet', 'Dayton', 'OH', 'Retail', 44000, 7.9],
  ['Closed', 'Project Curlew', 'Knoxville', 'TN', 'Industrial', 110000, 7.0],
];
const PPSF = { Industrial: [78, 96], Flex: [105, 128], Retail: [140, 175], Office: [150, 190] };
const NEXT = {
  'Under review': ['Underwriting due', 7, 21],
  LOI: ['LOI response due', 2, 10],
  'Under contract': ['Due diligence ends', 10, 40],
  Closed: ['Closed on', -60, -10],
};
const pipeline = STAGE_DEALS.map(([stage, name, city, state, type, sf, cap], i) => {
  const price = Math.round((sf * between(...PPSF[type])) / 25000) * 25000;
  const [label, lo, hi] = NEXT[stage];
  return {
    id: `D${i + 1}`,
    name,
    city,
    state,
    type,
    sf,
    price: price * 100,
    capRate: cap,
    occupancy: Math.round(between(82, 100)),
    stage,
    nextDate: { label, date: iso(addDays(asOf, int(lo, hi))) },
  };
});

/* ---------- Tie-out: every total, every level, to the cent ---------- */
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
const fail = [];
const tie = (label, x, y) => {
  if (x !== y) fail.push(`${label}: ${x} vs ${y}`);
};
const isWhole = (cents) => Number.isInteger(cents) && cents % 100 === 0;

for (const t of tenants) {
  if (!isWhole(t.monthlyRent)) fail.push(`${t.name} rent not whole dollars`);
  for (const k of Object.keys(t.aging)) if (!isWhole(t.aging[k])) fail.push(`${t.name} ${k} not whole dollars`);
  t.balance = t.aging.d0_30 + t.aging.d31_60 + t.aging.d61_90 + t.aging.d90p;
}
const buckets = ['d0_30', 'd31_60', 'd61_90', 'd90p'].map((k) => sum(tenants, (t) => t.aging[k]));
const pastDue = sum(tenants, (t) => t.balance);
tie('buckets vs tenant balances', buckets.reduce((s, x) => s + x, 0), pastDue);
tie('portfolio past due', pastDue, TARGET.pastDue);
const collected = sum(payments, (p) => p.amount);
tie('payments this month', collected, TARGET.collected);
let propCollected = 0;
let propPastDue = 0;
for (const p of properties) {
  const ids = new Set(tenants.filter((t) => t.propertyId === p.id).map((t) => t.id));
  propCollected += sum(payments.filter((x) => ids.has(x.tenantId)), (x) => x.amount);
  propPastDue += sum(tenants.filter((t) => ids.has(t.id)), (t) => t.balance);
  tie(`${p.name} SF`, sum(tenants.filter((t) => ids.has(t.id)), (t) => t.sf) + p.vacant, p.sf);
}
tie('sum of property collected', propCollected, collected);
tie('sum of property past due', propPastDue, pastDue);
tie('unpaid this month = 0 to 30 bucket', sum(tenants.filter((t) => unpaid.has(t.id)), (t) => t.monthlyRent), buckets[0]);
tie('occupancy', Math.round(((totalSf - vacantSf) / totalSf) * 1000) / 10, TARGET.occupancy);
tie('open tasks', tasks.filter((t) => t.status !== 'Done').length, TARGET.openTasks);
for (const p of [...payments, ...paymentsLastMonth]) if (!isWhole(p.amount)) fail.push(`payment ${p.tenantId} not whole dollars`);
if (fail.length) throw new Error('Demo data does not tie out:\n  ' + fail.join('\n  '));

/* ---------- Write ---------- */
for (const t of tenants) {
  delete t.rawRent;
  delete t.balance;
}
const out = new URL('../src/data/demo/', import.meta.url);
mkdirSync(out, { recursive: true });
const write = (name, data) => writeFileSync(new URL(name, out), JSON.stringify(data, null, 2) + '\n');
write('portfolio.json', {
  name: 'Harbor & Pine Properties',
  asOf: AS_OF,
  fictional: true,
  money: 'All amounts are integer cents, whole dollars only.',
  properties: properties.map(({ tenants: _n, ...p }) => p),
  vacancies,
  tenants,
});
write('payments.json', payments);
write('payments-last-month.json', paymentsLastMonth);
write('tasks.json', tasks);
write('critical-dates.json', critical);
write('pipeline.json', pipeline);
console.log(
  `Demo data written and tied out: occupancy ${TARGET.occupancy}%, collected $${(collected / 100).toLocaleString('en-US')}, ` +
    `past due $${(pastDue / 100).toLocaleString('en-US')}, ${TARGET.openTasks} open tasks | ${tenants.length} tenants, ` +
    `${critical.length} critical dates, ${pipeline.length} deals, last month $${(sum(paymentsLastMonth, (p) => p.amount) / 100).toLocaleString('en-US')}`,
);
