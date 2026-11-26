// Generates the fictional demo portfolio in src/data/demo/*.json. Node built-ins only.
// Run: npm run demo-data   (deterministic: the same seed always gives the same files)
//
// "Harbor & Pine Industrial" is fictional. Property and tenant names are invented words, cities
// are only city names, and there are no street addresses. Totals are forced to match the hero
// and SITE_SPEC exactly: occupancy 94.2% by SF, collected this month $412,860, past due $18,240,
// 37 open tasks.
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
const round2 = (n) => Math.round(n * 100) / 100;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- Dates ---------- */
const AS_OF = '2026-11-20'; // a Friday
const day = 86400000;
const asOf = Date.parse(AS_OF + 'T00:00:00Z');
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const addDays = (t, n) => t + n * day;
const addYears = (t, n) => {
  const d = new Date(t);
  d.setUTCFullYear(d.getUTCFullYear() + n);
  return d.getTime();
};

/* ---------- Targets ---------- */
const TARGET = { occupancy: 0.942, collected: 412860, pastDue: 18240, openTasks: 37 };

/* ---------- Properties ---------- */
const properties = [
  { id: 'P01', name: 'Heronfield Logistics', type: 'Industrial', city: 'Savannah', state: 'GA', sf: 186000, vacant: 0, tenants: 4 },
  { id: 'P02', name: 'Pinewick Flex', type: 'Flex', city: 'Charlotte', state: 'NC', sf: 64000, vacant: 12000, tenants: 5 },
  { id: 'P03', name: 'Cedarholt Business Park', type: 'Small bay', city: 'Greenville', state: 'SC', sf: 88000, vacant: 9500, tenants: 7 },
  { id: 'P04', name: 'Tidemark Distribution', type: 'Industrial', city: 'Jacksonville', state: 'FL', sf: 142000, vacant: 0, tenants: 4 },
  { id: 'P05', name: 'Magnolia Reach Commerce Center', type: 'Flex', city: 'Atlanta', state: 'GA', sf: 72000, vacant: 8160, tenants: 5 },
  { id: 'P06', name: 'Riverlace Small Bay', type: 'Small bay', city: 'Chattanooga', state: 'TN', sf: 54000, vacant: 7000, tenants: 6 },
  { id: 'P07', name: 'Sawmere Industrial', type: 'Industrial', city: 'Orlando', state: 'FL', sf: 118000, vacant: 0, tenants: 4 },
  { id: 'P08', name: 'Oakhaven Trade Center', type: 'Small bay', city: 'Charleston', state: 'SC', sf: 46000, vacant: 8000, tenants: 5 },
];
const totalSf = properties.reduce((s, p) => s + p.sf, 0);
const vacantSf = properties.reduce((s, p) => s + p.vacant, 0);
if (Math.abs((totalSf - vacantSf) / totalSf - TARGET.occupancy) > 1e-9) throw new Error('occupancy target missed');

/* ---------- Tenants and leases ---------- */
const NAMES = shuffle([
  'Quillon Freight', 'Tarrow Fabrication', 'Vessa Medical Supply', 'Ondel Electric', 'Brindle Print Works',
  'Kestrow Air Systems', 'Lumenrow Lighting', 'Carrowby Foods', 'Selvane Auto Parts', 'Mirebank Millwork',
  'Palvane Packaging', 'Northwick Cold Storage', 'Grenmoor Tile', 'Ashby Lane Coffee Roasters', 'Corvane Logistics',
  'Fenlow Plumbing Supply', 'Halberry Signs', 'Ironvale Machine', 'Juniper Crest Labs', 'Kinlow Cabinetry',
  'Larkspur Event Rentals', 'Marrowgate Brewing', 'Nettlefield Pharma Distribution', 'Orrin Bay Marine Supply',
  'Pellmont Fitness', 'Quarrystone Countertops', 'Rookwell Robotics', 'Sablecrest Apparel', 'Thistlewood Flooring',
  'Umberfield Solar', 'Valemont Glass', 'Wrenford Pet Supply', 'Yarrowby Bakery Wholesale', 'Zelmar Audio',
  'Bramblecote Garden Supply', 'Coldharbor Ice Co', 'Dunmere Display', 'Elmsworth Mobility', 'Foxglen Furniture',
  'Gallowell Industrial Gas',
]);
const RATE = { Industrial: [5.4, 6.6], Flex: [8.6, 10.2], 'Small bay': [7.4, 8.8] };

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
    const suite = p.type === 'Industrial' ? `Bldg ${String.fromCharCode(65 + i)}` : `Ste ${100 + i * 10}`;
    const rate = between(...RATE[p.type]);
    const term = pick([3, 5, 5, 7]);
    const start = addDays(asOf, -int(120, 5 * 365));
    let end = addYears(start, term);
    while (end <= addDays(asOf, 30)) end = addYears(end, 3); // renewed
    tenants.push({
      id: `T${String(++tIndex).padStart(2, '0')}`,
      name: NAMES[tIndex - 1],
      propertyId: p.id,
      suite,
      sf,
      rawRent: (sf * rate) / 12,
      leaseStart: iso(start),
      leaseEnd: iso(end),
    });
  });
  if (p.vacant) vacancies.push({ propertyId: p.id, suite: p.type === 'Industrial' ? `Bldg ${String.fromCharCode(65 + p.tenants)}` : `Ste ${100 + p.tenants * 10}`, sf: p.vacant });
}

// Eight leases expire inside the next 180 days, so the Leases view has real decisions in it.
for (const t of shuffle(tenants).slice(0, 8)) {
  const end = addDays(asOf, int(12, 172));
  t.leaseEnd = iso(end);
  t.leaseStart = iso(addYears(end, -5));
}

/* ---------- Receivables: exactly $412,860 collected and $18,240 past due ---------- */
const smallBay = tenants
  .filter((t) => properties.find((p) => p.id === t.propertyId).type === 'Small bay')
  .sort((a, b) => a.rawRent - b.rawRent);
const [a, b, c, d] = [smallBay[0], smallBay[2], smallBay[4], smallBay[6]];
const unpaid = new Set([a.id, b.id]); // have not paid this month

// Everyone else's rent is scaled so that this month's payments total exactly $412,860.
const payers = tenants.filter((t) => !unpaid.has(t.id));
const rawPaid = payers.reduce((s, t) => s + t.rawRent, 0);
const factor = TARGET.collected / rawPaid;
for (const t of tenants) t.monthlyRent = round2(unpaid.has(t.id) ? t.rawRent : t.rawRent * factor);
const drift = round2(TARGET.collected - payers.reduce((s, t) => s + t.monthlyRent, 0));
payers[payers.length - 1].monthlyRent = round2(payers[payers.length - 1].monthlyRent + drift);

for (const t of tenants) t.aging = { d0_30: 0, d31_60: 0, d61_90: 0, d90p: 0 };
a.aging.d0_30 = a.monthlyRent;
b.aging.d0_30 = b.monthlyRent;
b.aging.d31_60 = b.monthlyRent;
c.aging.d61_90 = 1862.4; // disputed CAM reconciliation
d.aging.d90p = round2(TARGET.pastDue - a.aging.d0_30 - b.aging.d0_30 - b.aging.d31_60 - c.aging.d61_90);
if (d.aging.d90p <= 0) throw new Error('past due split failed');
const notes = { [a.id]: 'Promised payment by Friday', [b.id]: 'Two months behind, notice sent', [c.id]: 'Disputing CAM reconciliation', [d.id]: 'Old balance, payment plan proposed' };
for (const t of tenants) if (notes[t.id]) t.collectionNote = notes[t.id];

/* Payments this month (Nov 1 to Nov 20) */
const monthStart = Date.parse('2026-11-01T00:00:00Z');
const payments = payers.map((t) => {
  const late = rnd() < 0.18;
  const date = addDays(monthStart, late ? int(6, 19) : int(0, 4));
  return { tenantId: t.id, date: iso(date), amount: t.monthlyRent, method: pick(['ACH', 'ACH', 'ACH', 'Check', 'Wire']) };
});
payments.sort((x, y) => x.date.localeCompare(y.date));

/* Weekly collections, 12 weeks ending Fridays, the last three from this month's payments */
const weeks = [];
for (let i = 11; i >= 0; i--) weeks.push(addDays(asOf, -7 * i));
const billed = TARGET.collected + a.monthlyRent + b.monthlyRent;
const weekly = weeks.map((end) => {
  const start = addDays(end, -6);
  if (end >= Date.parse('2026-11-06T00:00:00Z')) {
    const from = Math.max(start, monthStart);
    const total = payments.filter((p) => Date.parse(p.date) >= from && Date.parse(p.date) <= end).reduce((s, p) => s + p.amount, 0);
    return { weekEnding: iso(end), amount: round2(total) };
  }
  // Earlier weeks follow the same shape as this month: most rent lands in the week holding the 1st.
  const hasFirst = [0, 1, 2, 3, 4, 5, 6].some((k) => new Date(addDays(start, k)).getUTCDate() === 1);
  const share = hasFirst ? between(0.78, 0.86) : between(0.03, 0.07);
  return { weekEnding: iso(end), amount: round2(billed * share) };
});

/* ---------- Tasks: 37 open ---------- */
// [task, who would plausibly own it]. Building-level tasks can be tagged to a building at
// industrial sites; suite tasks only exist where a property has a vacant suite.
const TASKS = [
  ['Roof inspection', ['Property manager', 'Maintenance']],
  ['HVAC service contract renewal', ['Property manager']],
  ['Parking lot restripe', ['Property manager', 'Maintenance']],
  ['Collect renewed COI', ['Property manager']],
  ['Estoppel request from lender', ['Asset manager', 'Accounting']],
  ['Dock door repair', ['Maintenance']],
  ['Property tax appeal filing', ['Asset manager']],
  ['Landscaping bids', ['Property manager']],
  ['Fire sprinkler inspection', ['Maintenance', 'Property manager']],
  ['Update monument signage', ['Leasing', 'Property manager']],
  ['CAM reconciliation', ['Accounting']],
  ['Lease renewal proposal', ['Leasing', 'Asset manager']],
  ['LED lighting retrofit quote', ['Property manager', 'Maintenance']],
  ['Gutter cleaning', ['Maintenance']],
  ['Pest control contract', ['Property manager']],
  ['Security camera upgrade', ['Property manager']],
  ['Insurance renewal questionnaire', ['Asset manager', 'Property manager']],
  ['Budget variance review', ['Asset manager', 'Accounting']],
  ['Backflow test', ['Maintenance']],
  ['Paving patch', ['Maintenance', 'Property manager']],
];
const SUITE_TASKS = [
  ['Make-ready', ['Maintenance', 'Property manager']],
  ['Listing photos and flyer', ['Leasing']],
  ['Broker tour', ['Leasing']],
];
const BUILDING_LEVEL = new Set(['Roof inspection', 'Dock door repair', 'Fire sprinkler inspection', 'Gutter cleaning', 'Paving patch']);
const OPEN = ['Not started', 'Working on it', 'Working on it', 'Waiting on vendor', 'Stuck'];
const tasks = [];
const used = new Set();
for (let i = 0; i < 52; i++) {
  const p = properties[i % properties.length];
  const open = i < TARGET.openTasks;
  const vacancy = vacancies.find((x) => x.propertyId === p.id);
  let title;
  let owners;
  // Pick a task this property does not already have, so each list reads as real work.
  for (let tries = 0; tries < 50; tries++) {
    const useSuite = vacancy && rnd() < 0.2;
    const [base, who] = useSuite ? pick(SUITE_TASKS) : pick(TASKS);
    title = useSuite ? `${base}, ${vacancy.suite}` : base;
    if (!useSuite && p.type === 'Industrial' && BUILDING_LEVEL.has(base)) title = `${base}, Bldg ${String.fromCharCode(65 + int(0, 3))}`;
    owners = who;
    if (!used.has(p.id + title)) break;
  }
  used.add(p.id + title);
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
const coi = new Set(shuffle(tenants).slice(0, 9).map((t) => t.id));
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

/* ---------- Acquisitions pipeline ---------- */
const STAGE_DEALS = [
  ['Under review', 'Project Osprey', 'Macon', 'GA', 'Industrial', 96000, 7.1],
  ['Under review', 'Project Wren', 'Spartanburg', 'SC', 'Small bay', 41000, 7.6],
  ['Under review', 'Project Kite', 'Ocala', 'FL', 'Flex', 52000, 7.3],
  ['LOI', 'Project Heron', 'Knoxville', 'TN', 'Industrial', 128000, 6.9],
  ['LOI', 'Project Plover', 'Columbia', 'SC', 'Small bay', 38500, 7.4],
  ['Under contract', 'Project Egret', 'Augusta', 'GA', 'Flex', 61000, 7.0],
  ['Under contract', 'Project Tern', 'Lakeland', 'FL', 'Industrial', 154000, 6.7],
  ['Closed', 'Project Avocet', 'Wilmington', 'NC', 'Small bay', 44000, 7.2],
  ['Closed', 'Project Curlew', 'Huntsville', 'AL', 'Industrial', 110000, 6.8],
];
const NEXT = {
  'Under review': ['Underwriting due', 7, 21],
  LOI: ['LOI response due', 2, 10],
  'Under contract': ['Due diligence ends', 10, 40],
  Closed: ['Closed on', -60, -10],
};
const pipeline = STAGE_DEALS.map(([stage, name, city, state, type, sf, cap], i) => {
  const ppsf = type === 'Industrial' ? between(78, 96) : type === 'Flex' ? between(105, 128) : between(92, 112);
  const price = Math.round((sf * ppsf) / 25000) * 25000;
  const [label, lo, hi] = NEXT[stage];
  return {
    id: `D${i + 1}`,
    name,
    city,
    state,
    type,
    sf,
    price,
    pricePerSf: round2(price / sf),
    capRate: cap,
    occupancy: Math.round(between(82, 100)),
    stage,
    nextDate: { label, date: iso(addDays(asOf, int(lo, hi))) },
  };
});

/* ---------- Check the totals, then write ---------- */
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
const check = {
  occupancy: round2(((totalSf - vacantSf) / totalSf) * 100),
  collected: round2(sum(payments, (p) => p.amount)),
  pastDue: round2(sum(tenants, (t) => t.aging.d0_30 + t.aging.d31_60 + t.aging.d61_90 + t.aging.d90p)),
  openTasks: tasks.filter((t) => t.status !== 'Done').length,
  weeklyThisMonth: round2(sum(weekly.slice(-3), (w) => w.amount)),
};
if (check.occupancy !== 94.2 || check.collected !== TARGET.collected || check.pastDue !== TARGET.pastDue || check.openTasks !== TARGET.openTasks || check.weeklyThisMonth !== TARGET.collected)
  throw new Error('Totals do not reconcile: ' + JSON.stringify(check));

for (const t of tenants) delete t.rawRent;
const out = new URL('../src/data/demo/', import.meta.url);
mkdirSync(out, { recursive: true });
const write = (name, data) => writeFileSync(new URL(name, out), JSON.stringify(data, null, 2) + '\n');
write('portfolio.json', { name: 'Harbor & Pine Industrial', asOf: AS_OF, fictional: true, properties: properties.map(({ tenants: _n, ...p }) => p), vacancies, tenants });
write('payments.json', payments);
write('collections-weekly.json', weekly);
write('tasks.json', tasks);
write('critical-dates.json', critical);
write('pipeline.json', pipeline);
console.log('Demo data written. Totals:', check, `| ${tenants.length} tenants, ${critical.length} critical dates, ${pipeline.length} deals`);
