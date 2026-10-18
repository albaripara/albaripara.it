# ALBA Ripara · sito www.albaripara.it

Sito statico (HTML, CSS, JS senza build) del laboratorio ALBA Ripara, Piazza Tripoli 3, 55011 Altopascio (LU).
Proprietario: Jack (scrive in italiano: tutto ciò che legge va in italiano).

## Infrastruttura
- Hosting: Netlify, progetto `albariparaaltopascio` (site id `2c69ac34-4752-4e06-929a-714fc9e1bcba`), team `6a038cc5d75679cf87acc7ea`.
- Deploy: collegato a GitHub `albaripara/albaripara.it`, branch `main` = produzione. Nessun comando di build, cartella pubblicata = radice del repo.
- DNS: Aruba. **Non toccare i DNS senza autorizzazione esplicita di Jack.**
- Prezzi riparazioni: letti a runtime da `https://gestionale-riparazioni.vercel.app/api/public/listino`; i valori in `script.js` sono solo riserva. Il gestionale è un progetto separato: **non modificarlo da qui**.
- Tracking: GA4 `G-6NVQ86GFXF` in `tracking-config.js`, caricato solo dopo consenso cookie (`analytics.js`, `cookie-consent.js`).
- Netlify Forms: usati da `check-batteria.html`. Vedi `docs/PROBLEMI-APERTI.md`.

## Dati aziendali (fonte di verità)
- Nome: "ALBA Ripara". Tel/WhatsApp 0583 1797237 (`+3905831797237`). Email albaripara@gmail.com. P.IVA 02532170509 (ALBA-ENERGIA SRL).
- Orari: lunedì mattina chiuso, lunedì 15:30–19:30; martedì–venerdì 9:30–13:00 e 15:30–19:30; sabato 9:30–13:00; domenica chiuso.
- Gli orari compaiono nel footer di ogni pagina e nel JSON-LD di `index.html`: vanno cambiati ovunque insieme.

## Regole permanenti
1. Non inventare prezzi, listini, valori di ritiro o configurazioni: si chiedono a Jack.
2. Ogni modifica su un branch dedicato e una PR verso `main`; mai push diretto su `main`.
3. Prima di proporre il merge: `node tests/valutazione-engine.test.js`, poi i controlli in `tools/qa/` sulla Deploy Preview della PR.
4. Pubblicare in produzione (merge su `main`, modifiche alle impostazioni Netlify) solo dopo l'ok esplicito di Jack.
5. Rollback: in Netlify ripubblicare il deploy precedente (Deploys → deploy → "Publish deploy"), oppure `git revert` del merge.
6. Ad ogni rilascio aggiornare `CHANGELOG.md` e `docs/PROBLEMI-APERTI.md`.
7. Le funzioni operative (preventivatore, valutatore, WhatsApp, moduli, consenso cookie) non vanno rimosse né peggiorate.
8. I file interni (`CLAUDE.md`, `docs/`, `tests/`, `tools/`, `.claude/`) sono bloccati in `_redirects`: se ne aggiungi altri, aggiungi la regola.

## Procedure
Skill del progetto in `.claude/skills/`: `audit-sito`, `qa-responsive`, `rilascio-netlify`.
Per qualsiasi lavoro su funzioni, Forms o configurazione Netlify consultare prima il contesto ufficiale Netlify (`get-netlify-coding-context`).
