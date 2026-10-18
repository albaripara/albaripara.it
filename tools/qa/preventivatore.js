// Prova tutti i modelli x problemi del preventivatore. Avvio: NODE_PATH=$(npm root -g) node tools/qa/preventivatore.js <url-home>
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto(process.argv[2] || 'https://www.albaripara.it/', { waitUntil: 'networkidle' });
  const models = await p.$$eval('#model option', o => o.map(x => x.value).filter(Boolean));
  const out = [];
  for (const m of models) {
    for (const pr of ['display','battery','charge','camera']) {
      const r = await p.evaluate(([m,pr]) => {
        const sel = document.getElementById('model'); sel.value = m; sel.dispatchEvent(new Event('change'));
        document.querySelector(`#problems button[data-problem="${pr}"]`).click();
        const res = document.getElementById('result');
        const cards = [...res.querySelectorAll('.solution-card')].map(c => c.querySelector('strong').textContent + '=' + c.querySelector('b').textContent);
        const q = res.querySelector('.quote-in-store') ? 'QUOTE-IN-STORE' : '';
        return cards.join(' | ') + q;
      }, [m,pr]);
      out.push(`${m} :: ${pr} :: ${r}`);
    }
  }
  console.log(out.join('\n'));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
