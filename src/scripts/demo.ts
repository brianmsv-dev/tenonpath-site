/*
  Demo behaviour (docs/SITE_SPEC.md > /demo). Pure DOM, no framework.
  - "Make it yours": company name (live, max 40 chars), theme, accent. Applied in the browser
    only. Nothing is stored (no cookies, no localStorage) and nothing is sent anywhere.
  - Tabs: WAI-ARIA tab pattern (arrow keys, Home, End). On /demo the view is kept in the URL
    hash so it can be shared (/demo#collections).
  - Collections: property filter hides rows and recomputes aging buckets, counts and totals.
  - Leases: sortable columns with aria-sort.
  - Row caps (embed): tables with data-cap show only their first N matching rows.
  initDemo() is called by /demo directly and by the homepage after the embed is fetched.
*/
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd = (cents: number) => usd0.format(cents / 100);

export function initDemo(root: HTMLElement) {
  if (root.dataset.ready) return;
  root.dataset.ready = 'true';
  initMakeItYours(root);
  initTabs(root, root.dataset.variant === 'full');
  initFilter(root);
  initSort(root);
}

/* ---------- Make it yours ---------- */
function initMakeItYours(root: HTMLElement) {
  const product = root.querySelector<HTMLElement>('[data-demo-product]');
  if (!product) return;
  const fallback = root.dataset.defaultName || '';

  const name = root.querySelector<HTMLInputElement>('[data-myo-name]');
  name?.addEventListener('input', () => {
    const value = name.value.slice(0, 40).trim() || fallback;
    root.querySelectorAll<HTMLElement>('[data-company-name]').forEach((el) => (el.textContent = value));
  });

  root.querySelectorAll<HTMLInputElement>('[data-myo-theme]').forEach((input) =>
    input.addEventListener('change', () => {
      if (input.checked) product.dataset.theme = input.value;
    }),
  );
  root.querySelectorAll<HTMLInputElement>('[data-myo-accent]').forEach((input) =>
    input.addEventListener('change', () => {
      if (input.checked) product.dataset.accent = input.value;
    }),
  );
}

/* ---------- Tabs ---------- */
function initTabs(root: HTMLElement, useHash: boolean) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];

  const select = (key: string, focus = false) => {
    const tab = tabs.find((t) => t.dataset.tab === key) ?? tabs[0];
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
    if (focus) tab.focus();
    if (useHash) history.replaceState(null, '', `#${tab.dataset.tab}`);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.tab!));
    tab.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const go = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
      if (go === undefined) return;
      e.preventDefault();
      select(tabs[(go + n) % n].dataset.tab!, true);
    });
  });

  if (useHash) {
    const fromHash = () => {
      const key = location.hash.slice(1);
      if (tabs.some((t) => t.dataset.tab === key)) select(key);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }
}

/* ---------- Row caps ---------- */
/** Show only the first `cap` rows that match; update the "Showing N of M" line if there is one. */
function applyCap(table: HTMLTableElement, matches: HTMLTableRowElement[], moreText?: HTMLElement | null) {
  const cap = Number(table.dataset.cap) || Infinity;
  matches.forEach((tr, i) => (tr.hidden = i >= cap));
  if (moreText) {
    moreText.textContent = matches.length > cap ? `Showing ${cap} of ${matches.length}.` : `Showing all ${matches.length}.`;
  }
}

/* ---------- Collections filter ---------- */
function initFilter(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>('[data-filter-property]');
  if (!select) return;
  const balances = root.querySelector<HTMLTableElement>('[data-table="balances"]');
  const paid = root.querySelector<HTMLTableElement>('[data-table="paid"]');
  const buckets = ['d0_30', 'd31_60', 'd61_90', 'd90p'];

  const apply = () => {
    const id = select.value;
    const matches = (tr: HTMLElement) => !id || tr.dataset.property === id;

    const sums: Record<string, number> = { d0_30: 0, d31_60: 0, d61_90: 0, d90p: 0 };
    const balanceRows = [...(balances?.querySelectorAll<HTMLTableRowElement>('tbody tr[data-property]') ?? [])];
    let balanceCount = 0;
    balanceRows.forEach((tr) => {
      const on = matches(tr);
      tr.hidden = !on;
      if (!on) return;
      balanceCount++;
      buckets.forEach((b) => (sums[b] += Number(tr.dataset[b as keyof DOMStringMap]) || 0));
    });
    const total = buckets.reduce((s, b) => s + sums[b], 0);
    buckets.forEach((b) => {
      const el = root.querySelector<HTMLElement>(`[data-sum="${b}"]`);
      if (el) {
        el.textContent = usd(sums[b]);
        el.classList.toggle('is-alert', sums[b] > 0);
      }
    });
    const totalEl = root.querySelector<HTMLElement>('[data-sum="total"]');
    if (totalEl) {
      totalEl.textContent = usd(total);
      totalEl.classList.toggle('is-alert', total > 0);
    }
    balances?.querySelector<HTMLElement>('[data-empty]')?.toggleAttribute('hidden', balanceCount > 0);
    const balCount = root.querySelector<HTMLElement>('[data-count="balances"]');
    if (balCount) balCount.textContent = `${balanceCount} ${balanceCount === 1 ? 'tenant' : 'tenants'}`;

    if (paid) {
      const rows = [...paid.querySelectorAll<HTMLTableRowElement>('tbody tr[data-property]')];
      const on = rows.filter(matches);
      rows.forEach((tr) => (tr.hidden = !matches(tr)));
      applyCap(paid, on, root.querySelector<HTMLElement>('[data-more="paid"] [data-more-text]'));
      const paidSum = on.reduce((s, tr) => s + (Number(tr.dataset.amount) || 0), 0);
      paid.querySelector<HTMLElement>('[data-empty]')?.toggleAttribute('hidden', on.length > 0);
      const paidCount = root.querySelector<HTMLElement>('[data-count="paid"]');
      if (paidCount) paidCount.textContent = `${on.length} ${on.length === 1 ? 'payment' : 'payments'}, ${usd(paidSum)}`;
    }
  };

  select.addEventListener('change', apply);
}

/* ---------- Sorting ---------- */
function initSort(root: HTMLElement) {
  root.querySelectorAll<HTMLTableElement>('table[data-sortable]').forEach((table) => {
    const body = table.tBodies[0];
    const buttons = [...table.querySelectorAll<HTMLButtonElement>('[data-sort-key]')];
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sortKey!;
        const th = btn.closest('th')!;
        const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        buttons.forEach((b) => b.closest('th')!.removeAttribute('aria-sort'));
        th.setAttribute('aria-sort', dir);

        const rows = [...body.rows];
        const numeric = key === 'date';
        rows.sort((a, b) => {
          const x = a.dataset[key] ?? '';
          const y = b.dataset[key] ?? '';
          const c = numeric ? Number(x) - Number(y) : x.localeCompare(y);
          const tie = Number(a.dataset.date) - Number(b.dataset.date); // ties read chronologically
          return (dir === 'ascending' ? c : -c) || tie;
        });
        body.append(...rows);
        if (table.dataset.cap) applyCap(table, rows);
      });
    });
  });
}

// Auto-init on the full /demo page.
document.querySelectorAll<HTMLElement>('[data-demo][data-variant="full"]').forEach(initDemo);
