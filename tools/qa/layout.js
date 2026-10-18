// Controllo layout su 5 schermi e 18 pagine. Avvio: NODE_PATH=$(npm root -g) node tools/qa/layout.js <url-base> [cartella-screenshot]
const { chromium, devices } = require('playwright');
const base = process.argv[2] || 'https://www.albaripara.it';
const pages = ['/', '/riparazioni', '/disponibili', '/valutazione-usato', '/cover-accessori', '/telefonia', '/recensioni', '/contatti', '/ricambi-e-garanzia', '/riparazione-iphone-altopascio', '/riparazione-samsung-altopascio', '/sostituzione-display-iphone-altopascio', '/sostituzione-batteria-iphone-altopascio', '/trasferimento-dati-altopascio', '/telefoni-ricondizionati', '/privacy', '/cookie', '/condizioni-servizio'];
const vps = { 'iPhone SE 320': {width:320,height:568}, 'iPhone 390': {width:390,height:844}, 'Android 412': {width:412,height:915}, 'iPad 768': {width:768,height:1024}, 'Desktop 1440': {width:1440,height:900} };
(async () => {
  const b = await chromium.launch();
  const shotDir = process.argv[3];
  for (const [vn, vp] of Object.entries(vps)) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    for (const path of pages) {
      const errs = [];
      p.removeAllListeners('pageerror'); p.on('pageerror', e => errs.push(String(e).slice(0,120)));
      const r = await p.goto(base + path, { waitUntil: 'networkidle' }).catch(e => null);
      const info = await p.evaluate(() => {
        const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
        const over = [];
        document.querySelectorAll('body *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && (r.right > cw + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed') { const s=el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:''); if (over.length<4 && !over.includes(s)) over.push(s);} });
        const f = document.querySelector('footer');
        const fi = {};
        if (f) {
          const mails = [...f.querySelectorAll('a[href^="mailto:"]')];
          fi.mailClipped = mails.some(a => a.scrollWidth > a.clientWidth + 1 || a.getBoundingClientRect().right > cw);
          fi.mailCount = mails.length;
          const ta = new Set([...f.querySelectorAll('p,li,a,span,div,h2,h3,h4,strong')].filter(e=>e.textContent.trim()&&e.children.length===0).map(e => getComputedStyle(e).textAlign));
          fi.align = [...ta].join(',');
        }
        const hdr = document.querySelector('header'); 
        return { sw, cw, over, fi, header: hdr ? hdr.className : 'NONE', wa: [...document.querySelectorAll('a[href*="wa.me"],a[href*="/whatsapp"]')].length, ga: typeof window.gtag === 'function' };
      });
      const bad = info.sw > info.cw || info.fi.mailClipped || errs.length;
      console.log(`${bad?'!!':'ok'} ${vn} ${path} status=${r&&r.status()} sw=${info.sw}/${info.cw} over=${info.over.join(' ')} footer=${JSON.stringify(info.fi)} hdr=${info.header} wa=${info.wa} gtag=${info.ga} errs=${errs.join(';')}`);
      if (shotDir && (path === '/' || path === '/contatti' || path === '/valutazione-usato')) await p.screenshot({ path: `${shotDir}/${vn.replace(/ /g,'_')}${path.replace(/\//g,'_')||'_home'}.png`, fullPage: true });
    }
    await ctx.close();
  }
  await b.close();
})();
