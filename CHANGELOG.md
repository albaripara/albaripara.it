# Registro delle versioni

## 2026-10-23 · correzioni dopo il controllo del sito (online: deploy `6adbd714235065d94783ff7b`, rollback senza Metricool: `6adbd4f3bd2a4c17bf1c546e`)
- Tolta la campagna «Check batteria» (richiesta di Jack): pagine, script e stile eliminati; i vecchi link (`/check-batteria*`) portano con un 301 a `sostituzione-batteria-iphone-altopascio.html`. Privacy senza riferimenti a Netlify Forms.
- Nuova pagina d'errore `404.html` in italiano, con percorsi assoluti (funziona anche su indirizzi annidati).
- Contatti: tolte le menzioni di Samsung, Xiaomi e altre marche.
- Ricambi e garanzia: «regola d'arte» sostituito con «fatta bene».
- Trasferimento dati: i tre riquadri e il messaggio WhatsApp ora parlano di passaggio dati, non di ricambi.
- Sitemap: lastmod 2026-10-23.
- Ripristinato `disponibili.js`, presente online ma mancante nel repository.

## 2026-10-23 · allineamento con il sito online
- Scoperto che www.albaripara.it è servito dal progetto Netlify `albaripara-sito`, caricato a mano il 21/10/2026 (deploy `6ad86f04a455a9570dd0d01c`, rollback: ripubblicare questo), e non da GitHub. La versione online aveva modifiche mai salvate su GitHub (indirizzi senza .html, banner cookie semplificato, listino usato del 19/10 con telefono 3D, filtri disponibili, nuovi `disponibili.css` e `valutazione-3d.css`): ora copiate nel repository.
- Testi su Metricool di banner cookie, cookie e privacy riapplicati sulla versione online.

## 2026-10-23 · statistiche Metricool
- Aggiunto il tracciamento visite di Metricool (brand albaripara): conta visite e provenienza (Instagram, Facebook, Google…) nella sezione «Sito web» di Metricool. Si attiva solo dopo il consenso «Statistiche», come Google Analytics; non usa cookie.
- Banner cookie, informativa cookie e privacy aggiornati con Metricool. Il banner viene richiesto di nuovo una volta a tutti i visitatori, perché la lista dei servizi è cambiata.
- `_headers`: `tracker.metricool.com` consentito nella Content-Security-Policy (script e immagini).

## 2026-10-19 · preventivatore retro e scocca
- Preventivatore: nuovo problema «Retro» con vetro posteriore, scocca completa e telaio, prezzi letti dal gestionale (chiavi `vetroPosteriore`, `scocca`, `telaio`). Senza prezzo per il modello compare «Preventivo in negozio».
- Hero: i guasti «Vetro dietro» e «Scocca» mostrano il prezzo «a partire da» e portano al problema «Retro» del preventivatore.

## 2026-10-18 · PR #5 (rollback: ripubblicare il deploy `6ac3bcec199aea00085b4b61`)
- Valutatore usato: una memoria più grande non dà più un valore di ritiro più basso (es. iPhone 13 512GB valutato meno del 256GB).
- Aggiunti CLAUDE.md, README, registro versioni, problemi aperti, inventario infrastruttura, skill di progetto, test e script di controllo.
- Footer della home: aggiunto il link «Ricambi e garanzia», come nelle altre pagine.
- File interni del repository bloccati sul sito pubblico tramite `_redirects`.

## 2026-10-05 · (deploy Netlify `6ac3bcec199aea00085b4b61`, commit `b25774f`)
- Hero: la «g» di «regola» non è più tagliata (PR #4).

## 2026-10 · PR #3
- Nuova home, pagina «Ricambi e garanzia», SEO locale.

## 2026-10 · PR #1
- Preventivatore: «Preventivo in negozio» e prezzi letti dal gestionale.

## 2026-09-19
- Importazione del sito com'era online (pubblicazione Netlify del 19/09/2026).
