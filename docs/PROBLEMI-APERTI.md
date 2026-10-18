# Problemi aperti (ordinati per gravità)

Aggiornato: 2026-10-18.

## Alta
1. **Modulo «Check batteria» non riceve richieste.** Netlify Forms è disattivato sul progetto: l'invio risponde 404 e la richiesta va persa. I partner `vetrina-alba` e `toringhese` sono in modalità live. Correzione: attivare Forms (Netlify → Forms → Enable) e ripubblicare; poi un invio di prova in modalità `test-interno`. Serve l'ok del proprietario.
2. **Valutatore usato: più memoria = valore più basso** in 15 modelli. *Corretto nel branch `audit/presa-in-carico`.*

## Media
3. **Valutatore: modelli superiori valutati meno di quelli inferiori**, es. iPhone 16 Pro Max 256GB 570€ contro iPhone 16 Pro 128GB 575€; iPhone 12 Pro Max 195€ contro 12 Pro 205€. Deriva dai prezzi di rivendita in `valutazione-engine.js`: da rivedere con il proprietario, non si cambiano i valori da soli.
4. **Repository pubblico.** Va reso privato (GitHub → Settings → Change visibility). Netlify continua a pubblicare se l'app Netlify ha accesso al repository.
5. **Orari sulla vetrina diversi dal sito.** Sulla porta: lun–ven 9.30–13.30 / 15.30–19.00. Sul sito e su Google: lunedì mattina chiuso, 9:30–13:00 / 15:30–19:30. Da allineare.

## Bassa
6. Preventivatore: per iPhone 8, 8 Plus, SE 2020 e SE 2022 compare «Display rigenerato: Preventivo in negozio». Da decidere se nasconderlo quando il prezzo non c'è.
7. iPhone 16e e serie 17 senza prezzi nel listino: mostrano «Preventivo in negozio» (comportamento corretto, prezzi da aggiungere nel gestionale se disponibili).
8. Conversioni: GA4 registra clic su WhatsApp/telefono (`click_whatsapp`, `click_phone`), non i contatti effettivi. I contatti reali si riconoscono dal codice «Rif. sito:» nei messaggi WhatsApp e dall'invio del modulo (pagina di conferma). Search Console e proprietà GA4 non verificate per mancanza di accesso.

## Verificati e a posto (2026-10-18)
- Responsive: 18 pagine × 5 schermi (320, 390, 412, 768, 1440 px) senza scorrimento orizzontale né errori JavaScript.
- Footer: testi centrati, email interamente visibile su tutti gli schermi.
- Orari: identici in tutte le pagine con footer e nei dati strutturati.
- Header e navigazione uguali su tutte le pagine (escluse le pagine campagna, che hanno un header dedicato).
- Preventivatore: 37 modelli × 4 problemi, prezzi uguali al listino del gestionale, nessun errore.
- Link WhatsApp: numero corretto ovunque, codice di riferimento aggiunto ai messaggi.
