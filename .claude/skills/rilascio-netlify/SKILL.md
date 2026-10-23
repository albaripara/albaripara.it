---
name: rilascio-netlify
description: Procedura di rilascio di albaripara.it su Netlify (branch, PR, Deploy Preview, controlli, autorizzazione, merge, verifica, rollback). Usare per pubblicare qualsiasi modifica al sito.
---

# Rilascio su Netlify

1. Lavora su un branch dedicato da `main` aggiornato. Mai push diretto su `main`.
2. Aggiorna `CHANGELOG.md` (sezione «In preparazione») e `docs/PROBLEMI-APERTI.md`.
3. `node tests/valutazione-engine.test.js` deve passare.
4. Apri la PR: Netlify crea la Deploy Preview `https://deploy-preview-<n>--albariparaaltopascio.netlify.app` (il dominio vero è su `albaripara-sito`, vedi CLAUDE.md: dopo il merge va caricato lì). Se la preview non compare, controlla nel connettore Netlify e dillo al proprietario: non pubblicare senza preview.
5. Sulla preview esegui la skill `qa-responsive` e i controlli della parte modificata.
6. Chiedi l'ok esplicito a Jack con link alla preview. Senza ok non si fa merge.
7. Dopo il merge: verifica nel connettore che il nuovo deploy di produzione sia `ready` con il commit giusto, poi ricontrolla la produzione.
8. Annota in `CHANGELOG.md` data, id deploy Netlify e commit.

## Rollback
- Immediato: Netlify → Deploys → deploy precedente → «Publish deploy» (l'id del deploy precedente è nel CHANGELOG).
- Nel codice: `git revert -m 1 <merge>` su un branch, PR, merge.
- Le impostazioni del progetto (Forms, variabili, dominio) si cambiano solo con ok esplicito; i DNS Aruba mai senza autorizzazione.
