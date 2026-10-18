---
name: audit-sito
description: Audit completo di www.albaripara.it (infrastruttura Netlify, codice vs produzione, dati aziendali, preventivatore, valutatore, moduli, tracking, sicurezza). Usare quando si chiede un audit, un controllo generale o una verifica dello stato del sito.
---

# Audit del sito

Non dichiarare un controllo fatto se non è stato eseguito: per ogni voce annota come l'hai verificata.

1. **Netlify** (connettore): progetto `albariparaaltopascio` → deploy corrente, commit, data, funzioni, redirect/header, stato Forms (`get-forms-for-project`).
2. **Codice vs produzione**: scarica ogni file di `git ls-files` da https://www.albaripara.it e confronta. Gli HTML differiscono solo per la riscrittura link di Netlify (`index.html` → `/`, `x.html` → `/x`, apici singoli): normalizza prima di confrontare. CSS/JS devono essere identici.
3. **Dati aziendali**: nome, indirizzo, telefono, email, orari in ogni footer e nel JSON-LD (vedi CLAUDE.md). `grep -L "Mattina chiuso" *.html` deve elencare solo le pagine campagna.
4. **Header/footer**: hash dell'`<header>` e del `<footer>` per pagina; devono coincidere salvo pagine campagna.
5. **Preventivatore**: `tools/qa/preventivatore.js` su produzione o preview; confronta con il listino `gestionale-riparazioni.vercel.app/api/public/listino`.
6. **Valutatore**: `node tests/valutazione-engine.test.js`; segnala inversioni tra modelli senza cambiare i prezzi.
7. **Moduli**: POST con solo `form-name` e `bot-field` compilato (honeypot, non crea richieste reali) → atteso 200/303, 404 = Forms spento.
8. **Responsive**: skill `qa-responsive`.
9. **Tracking**: GA4 caricato solo dopo consenso; eventi `click_whatsapp`, `click_phone`, `preventivo_*`, conversione modulo nella pagina di conferma.
10. **Sicurezza**: `_headers` (CSP, HSTS), nessun segreto nel repository, `_redirects` blocca i file interni.

Risultato: aggiorna `docs/PROBLEMI-APERTI.md` (ordinati per gravità) e `docs/INFRASTRUTTURA.md`.
