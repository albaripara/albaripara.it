# Inventario infrastruttura (verificato il 2026-10-18)

| Voce | Stato verificato | Come |
|---|---|---|
| Dominio pubblico | https://www.albaripara.it risponde 200, servito da Netlify | richiesta HTTP |
| Progetto Netlify del dominio | `albaripara-sito`, id `8f1d44d5-04e6-4cb9-8ec5-ee5dac7af803`, team `6a02470578cd5767c2e47b7f`, deploy caricati a mano (non da GitHub). Verificato 2026-10-23 | connettore Netlify |
| Progetto Netlify collegato a GitHub | `albariparaaltopascio`, id `2c69ac34-4752-4e06-929a-714fc9e1bcba`: solo Deploy Preview, non serve il dominio | connettore Netlify |
| Altri progetti Netlify nel team | `alba-energia-fotovoltaico`, `alba-energia-crm` (non toccare) | connettore Netlify |
| Deploy in produzione | `6ac3bcec199aea00085b4b61`, 2026-10-05 15:06 UTC, branch `main`, commit `b25774f` | connettore Netlify |
| Build | nessun framework, nessun comando, 0 funzioni, 0 edge functions, 9 redirect + 1 regola header | riepilogo deploy |
| Netlify Forms | **disattivati**; nessun modulo registrato; POST del modulo check-batteria → 404 | connettore + prova POST |
| Variabili d'ambiente | non lette (nessuna necessaria: il sito non ha build né funzioni) | — |
| Repository | `albaripara/albaripara.it`, **pubblico**, `main` = produzione | GitHub |
| Codice vs produzione | identici: CSS/JS byte per byte; HTML uguale salvo la riscrittura link di Netlify (Pretty URLs) | confronto file per file |
| ZIP `albaripara-2026-10-02-preventivo-in-negozio` | versione più vecchia: manca il collegamento al listino del gestionale (PR #1) | confronto con la storia git |
| Listino prezzi | `gestionale-riparazioni.vercel.app/api/public/listino` risponde `ok:true` | richiesta HTTP |
| GA4 | ID `G-6NVQ86GFXF` configurato, si carica dopo consenso | codice + browser |
| Search Console, proprietà GA4 | **non verificabili**: nessun accesso disponibile | — |
| DNS Aruba | non verificato (nessun accesso; non va modificato senza autorizzazione) | — |
