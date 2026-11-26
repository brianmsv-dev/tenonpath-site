/*
  Demo dashboard behaviour (docs/SITE_SPEC.md > /demo). Pure DOM, no framework.
  - Tabs: WAI-ARIA tab pattern (arrow keys, Home, End). On /demo the view is kept in the URL
    hash so it can be shared (/demo#collections).
  - Collections: property filter hides rows and recomputes the aging buckets and counts.
  - Leases: sortable columns with aria-sort.
  initDemo() is called by /demo directly and by the homepage after the embed is fetched.
*/
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function initDemo(root: HTMLElement) {
  if (root.dataset.ready) return;
  root.dataset.ready = 'true';
  const useHash = root.dataset.variant === 'full';
  initTabs(root, useHash);
  initFilter(root);
  initSort(root);
}

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

function initFilter(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>('[data-filter-property]');
  if (!select) return;
  const balances = root.querySelector<HTMLTableElement>('[data-table="balances"]');
  const paid = root.querySelector<HTMLTableElement>('[data-table="paid"]');
  const buckets = ['d0_30', 'd31_60', 'd61_90', 'd90p'];

  const apply = () => {
    const id = select.value;
    const show = (tr: HTMLElement) => !id || tr.dataset.property === id;

    const sums: Record<string, number> = { d0_30: 0, d31_60: 0, d61_90: 0, d90p: 0 };
    let balanceRows = 0;
    balances?.querySelectorAll<HTMLTableRowElement>('tbody tr[data-property]').forEach((tr) => {
      const on = show(tr);
      tr.hidden = !on;
      if (!on) return;
      balanceRows++;
      buckets.forEach((b) => (sums[b] += Number(tr.dataset[b as keyof DOMStringMap]) || 0));
    });
    const total = buckets.reduce((s, b) => s + sums[b], 0);
    buckets.forEach((b) => {
      const el = root.querySelector<HTMLElement>(`[data-sum="${b}"]`);
      if (el) {
        el.textContent = usd0.format(sums[b]);
        el.classList.toggle('is-alert', sums[b] > 0);
      }
    });
    const totalEl = root.querySelector<HTMLElement>('[data-sum="total"]');
    if (totalEl) {
      totalEl.textContent = usd0.format(total);
      totalEl.classList.toggle('is-alert', total > 0);
    }
    balances?.querySelector<HTMLElement>('[data-empty]')?.toggleAttribute('hidden', balanceRows > 0);
    const balCount = root.querySelector<HTMLElement>('[data-count="balances"]');
    if (balCount) balCount.textContent = `${balanceRows} ${balanceRows === 1 ? 'tenant' : 'tenants'}`;

    let paidRows = 0;
    let paidSum = 0;
    paid?.querySelectorAll<HTMLTableRowElement>('tbody tr[data-property]').forEach((tr) => {
      const on = show(tr);
      tr.hidden = !on;
      if (on) {
        paidRows++;
        paidSum += Number(tr.dataset.amount) || 0;
      }
    });
    paid?.querySelector<HTMLElement>('[data-empty]')?.toggleAttribute('hidden', paidRows > 0);
    const paidCount = root.querySelector<HTMLElement>('[data-count="paid"]');
    if (paidCount) paidCount.textContent = `${paidRows} ${paidRows === 1 ? 'payment' : 'payments'}, ${usd0.format(paidSum)}`;
  };

  select.addEventListener('change', apply);
}

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
          // Ties keep date order so groups read chronologically
          const tie = Number(a.dataset.date) - Number(b.dataset.date);
          return (dir === 'ascending' ? c : -c) || tie;
        });
        body.append(...rows);
      });
    });
  });
}

// Auto-init on the full /demo page.
document.querySelectorAll<HTMLElement>('[data-demo][data-variant="full"]').forEach(initDemo);
