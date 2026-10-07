// Country choices navigate to complete static collections, including later pages.
const form = document.querySelector('.index-search');
if (form) {
  const rows = [...document.querySelectorAll('tr.opportunity')];
  const status = document.querySelector('.filter-status');
  const empty = document.querySelector('.no-results');
  const filter = () => {
    const query = form.elements.q.value.trim().toLocaleLowerCase();
    const country = form.elements.country.value;
    let count = 0;
    for (const row of rows) {
      const basis = form.elements.country.selectedOptions[0]?.dataset.basis;
      const countries = (basis === 'destination' ? row.dataset.destinations : row.dataset.countries).split(' ').filter(Boolean);
      const matches = row.textContent.toLocaleLowerCase().includes(query) && (!country || (country === 'unknown' ? !countries.length : countries.includes(country)));
      row.hidden = !matches;
      if (matches) count++;
    }
    status.textContent = `${count} of ${rows.length} listings shown`;
    empty.hidden = count !== 0;
  };
  form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  form.addEventListener('input', filter);
  form.addEventListener('change', event => {
    if (event.target === form.elements.country) {
      const route = form.elements.country.selectedOptions[0]?.dataset.route;
      if (route && route !== window.location.pathname) { window.location.assign(route); return; }
    }
    filter();
  });
}
