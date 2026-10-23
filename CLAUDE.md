# ALBA Ripara · sito www.albaripara.it

Sito statico (HTML, CSS, JS senza build) del laboratorio ALBA Ripara, Piazza Tripoli 3, 55011 Altopascio (LU).
Proprietario: Jack (scrive in italiano: tutto ciò che legge va in italiano).

## Infrastruttura
- Hosting del dominio www.albaripara.it: Netlify, progetto `albaripara-sito` (site id `8f1d44d5-04e6-4cb9-8ec5-ee5dac7af803`, team `6a02470578cd5767c2e47b7f`). **Non è collegato a GitHub**: si pubblica caricando i file (deploy da API/CLI). Verificato il 2026-10-23.
- Progetto `albariparaaltopascio` (site id `2c69ac34-4752-4e06-929a-714fc9e1bcba`): collegato a GitHub, serve solo per le Deploy Preview delle PR (`albariparaaltopascio.netlify.app`, non è il dominio pubblico).
- Flusso: PR → Deploy Preview → ok di Jack → merge su `main` → caricare il contenuto di `main` su `albaripara-sito`. Nessun comando di build, cartella pubblicata = radice del repo. Prima di caricare, confrontare il sito online con `main`: se qualcuno ha caricato modifiche a mano, vanno prima riportate su GitHub.
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
