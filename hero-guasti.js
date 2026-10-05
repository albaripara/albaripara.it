// Hero «Che cosa si è rotto?» — ALBA Ripara
// Tocchi un guasto: la foto vera del banco ingrandisce quel pezzo e sopra compare la scheda
// con sintomi, tempi, prezzo «a partire da» e il pulsante che porta al preventivatore.
(function () {
  var hero = document.querySelector('[data-hg]');
  if (!hero) return;

  // Dove si trova ogni pezzo nella foto (percentuali) e quanto ingrandire.
  // Se cambia la foto o arriva il video, basta aggiornare questi numeri.
  var FOCUS = {
    display:  { x: 20, y: 55, z: 1.5 },
    batteria: { x: 68, y: 62, z: 1.9 },
    ricarica: { x: 66, y: 88, z: 2.4 },
    camera:   { x: 66, y: 22, z: 2.6 },
    retro:    { x: 62, y: 50, z: 1.25 },
    scocca:   { x: 88, y: 50, z: 1.8 },
    scheda:   { x: 74, y: 28, z: 2.1 }
  };
  var PRICE_KEY = { display: 'displayRigenerato', batteria: 'batteria', camera: 'camera', ricarica: 'ricarica' };
  var PROBLEM = { display: 'display', batteria: 'battery', camera: 'camera', ricarica: 'charge' };

  var chips = [].slice.call(hero.querySelectorAll('[data-part]'));
  var cards = [].slice.call(hero.querySelectorAll('[data-card]'));
  var sheet = hero.querySelector('.hg-sheet');
  var frame = hero.querySelector('.hg-frame');
  var media = hero.querySelector('.hg-photo, .hg-video');
  var priceEl = hero.querySelector('.hg-price');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var selected = null;

  function minPrice(key) {
    var all = window.albaIphonePrices;
    if (!all || !key) return null;
    var best = null;
    Object.keys(all).forEach(function (name) {
      var v = all[name] && Number(all[name][key]);
      if (isFinite(v) && v > 0 && (best === null || v < best)) best = v;
    });
    return best;
  }

  function select(part) {
    selected = part && part !== selected ? part : null;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-part') === selected ? 'true' : 'false'); });
    cards.forEach(function (c) { c.hidden = c.getAttribute('data-card') !== selected; });
    sheet.hidden = !selected;
    hero.classList.toggle('hg-on', !!selected);

    var f = selected ? FOCUS[selected] : null;
    if (media) {
      media.style.transformOrigin = f ? f.x + '% ' + f.y + '%' : '50% 50%';
      media.style.transform = f ? 'scale(' + f.z + ')' : '';
    }
    if (!selected) return;

    var price = minPrice(PRICE_KEY[selected]);
    priceEl.innerHTML = price
      ? 'A partire da <strong>' + price + ' €</strong> · il prezzo esatto dipende dal modello'
      : 'Prezzo dopo una verifica gratuita in negozio';

    // la foto con la scheda deve essere tutta a schermo (soprattutto su telefono)
    var r = frame.getBoundingClientRect();
    if (r.top < 60 || r.bottom > window.innerHeight) {
      frame.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
    if (typeof window.albaTrack === 'function') window.albaTrack('hero_guasto_selected', { part: selected });
  }

  chips.forEach(function (c) { c.addEventListener('click', function () { select(c.getAttribute('data-part')); }); });
  hero.querySelector('.hg-close').addEventListener('click', function () {
    var was = selected; select(null);
    var chip = chips.filter(function (c) { return c.getAttribute('data-part') === was; })[0];
    if (chip) chip.focus({ preventScroll: true });
  });
  hero.addEventListener('keydown', function (e) { if (e.key === 'Escape' && selected) select(null); });

  // «Vedi il prezzo»: vai al preventivatore; scelto il modello, il problema è già selezionato
  hero.querySelector('.hg-go').addEventListener('click', function () {
    window.albaPendingProblem = PROBLEM[selected] || 'other';
    var target = document.getElementById('comparatore');
    if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
})();
