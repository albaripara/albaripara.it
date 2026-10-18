---
name: qa-responsive
description: Controllo responsive e visivo di albaripara.it su iPhone, Android, tablet e desktop con Playwright. Usare prima di ogni rilascio e quando si toccano CSS, header, footer o layout.
---

# QA responsive

1. Avvia il controllo su produzione o sulla Deploy Preview:
   `NODE_PATH=$(npm root -g) node tools/qa/layout.js <url-base> <cartella-screenshot>`
   Schermi: 320, 390, 412, 768, 1440 px. Pagine: tutte quelle pubbliche.
2. Ogni riga deve iniziare con `ok`. `!!` indica scorrimento orizzontale, email del footer tagliata o errori JavaScript.
3. Guarda gli screenshot di home, contatti e valutazione usato (salvati nella cartella indicata) almeno a 320 e 1440 px.
4. Se tocchi il preventivatore: `NODE_PATH=$(npm root -g) node tools/qa/preventivatore.js <url-home>`, nessun errore e prezzi uguali al listino.
5. Se Playwright non trova il browser usa `executablePath: '/opt/pw-browsers/chromium'`; non lanciare `playwright install`.
