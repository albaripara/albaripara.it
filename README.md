# albaripara.it

Sito pubblico di ALBA Ripara (riparazione iPhone e smartphone, Altopascio). HTML, CSS e JavaScript statici, pubblicati da Netlify a ogni merge su `main`.

## Struttura
- `index.html` + `script.js`: home e preventivatore riparazioni iPhone (prezzi dal gestionale, riserva in `script.js`).
- `valutazione-usato.html` + `valutazione-usato.js` + `valutazione-engine.js`: valutatore telefoni usati.
- `check-batteria*.{html,js,css}`: campagna check batteria su invito (`?ref=`), modulo Netlify Forms.
- `analytics.js`, `cookie-consent.js`, `tracking-config.js`: GA4 con consenso.
- `_headers`, `_redirects`: sicurezza e reindirizzamenti Netlify.

## Lavorare in locale
```
python3 -m http.server 8080        # poi apri http://localhost:8080
node tests/valutazione-engine.test.js
NODE_PATH=$(npm root -g) node tools/qa/layout.js http://localhost:8080
NODE_PATH=$(npm root -g) node tools/qa/preventivatore.js http://localhost:8080/
```
Gli script in `tools/qa/` richiedono Playwright installato.

## Pubblicazione
Branch → PR → Deploy Preview Netlify → controlli → ok del proprietario → merge. Dettagli in `CLAUDE.md` e `.claude/skills/rilascio-netlify`.
