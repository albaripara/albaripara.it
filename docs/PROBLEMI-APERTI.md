# Problemi aperti (ordinati per gravità)

Aggiornato: 2026-10-23.

## Alta
1. **Valutatore usato: più memoria = valore più basso** in 15 modelli. *Corretto nel branch `audit/presa-in-carico`.*

## Media
- **Sito pubblicato fuori da GitHub.** Il dominio è servito da `albaripara-sito`, caricato a mano: un merge su `main` non pubblica nulla. Per ogni rilascio confrontare online e `main`, poi caricare `main` su `albaripara-sito`. Valutare con Jack se collegare `albaripara-sito` a GitHub.
2. **Valutatore: modelli superiori valutati meno di quelli inferiori**, es. iPhone 16 Pro Max 256GB 570€ contro iPhone 16 Pro 128GB 575€; iPhone 12 Pro Max 195€ contro 12 Pro 205€. Deriva dai prezzi di rivendita in `valutazione-engine.js`: da rivedere con il proprietario, non si cambiano i valori da soli.
3. **Repository pubblico.** Va reso privato (GitHub → Settings → Change visibility). Netlify continua a pubblicare se l'app Netlify ha accesso al repository.
4. **Foto della vetrina con orari vecchi** (lun–ven 9.30–13.30 / 15.30–19.00). La foto è vecchia: non usarla su sito e social; verificare che la vetrina reale riporti gli orari attuali.

- **Immagini in `assets/` diverse da quelle online**: stessi nomi, ma i file su www.albaripara.it pesano circa 5,7 KB in più (es. `favicon-32.png` 6649 byte online contro 879 nel repository). Da capire quale versione tenere prima del prossimo caricamento.

## Bassa
5. ~~**Campagna «Check batteria» non ancora lanciata**~~ Pagina tolta il 23/10/2026 su richiesta di Jack (i vecchi link portano alla pagina batteria). Testo originale: (idea, confermato da Jack il 18/10). Netlify Forms è disattivato: prima del lancio va attivato (Netlify → Forms → Enable), ripubblicato e provato con un invio in modalità `test-interno`, altrimenti le richieste vanno perse (oggi l'invio risponde 404).
6. ~~Preventivatore: per iPhone 8, 8 Plus, SE 2020 e SE 2022 compare «Display rigenerato: Preventivo in negozio».~~ Risolto il 19/10/2026: prezzi aggiunti nel gestionale.
7. iPhone 16e e serie 17 senza prezzi nel listino: mostrano «Preventivo in negozio» (comportamento corretto, prezzi da aggiungere nel gestionale se disponibili).
8. Conversioni: GA4 registra clic su WhatsApp/telefono (`click_whatsapp`, `click_phone`), non i contatti effettivi. I contatti reali si riconoscono dal codice «Rif. sito:» nei messaggi WhatsApp e dall'invio del modulo (pagina di conferma). Search Console e proprietà GA4 non verificate per mancanza di accesso. Dal 23/10/2026 anche Metricool conta visite e sorgenti, ma solo per chi accetta le statistiche nel banner: i numeri saranno più bassi delle visite reali.

## Verificati e a posto (2026-10-18)
- Responsive: 18 pagine × 5 schermi (320, 390, 412, 768, 1440 px) senza scorrimento orizzontale né errori JavaScript.
- Footer: testi centrati, email interamente visibile su tutti gli schermi.
- Orari: identici in tutte le pagine con footer e nei dati strutturati.
- Header e navigazione uguali su tutte le pagine (escluse le pagine campagna, che hanno un header dedicato).
- Preventivatore: 37 modelli × 4 problemi, prezzi uguali al listino del gestionale, nessun errore.
- Link WhatsApp: numero corretto ovunque, codice di riferimento aggiunto ai messaggi.
