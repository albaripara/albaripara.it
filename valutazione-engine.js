(function (global) {
  "use strict";

  // Listino usato ricalcolato il 2026-10-19 sul mercato di ottobre 2026 (Back Market, TrenDevice).
  // resale = prezzo a cui ALBA Ripara rivende il telefono in negozio (IVA a margine, passaggio dati compreso),
  // taglio di memoria più piccolo, condizioni buone, batteria sopra l'85%. storage = differenza per gli altri tagli.
  // look = come disegnare il telefono 3D (fotocamere, notch, tasto Home).
  // onRequest = niente prezzo automatico (decisione di Jack 19/10: serie 17 e 18 solo su richiesta, se capita l'occasione).
  const priceData = {
    iphone: {
      "iPhone SE 2020": { resale: 129, storage: {64:0,128:20,256:40}, demand: "low", look: "se" },
      "iPhone SE 2022": { resale: 199, storage: {64:0,128:30,256:50}, demand: "low", look: "se" },
      "iPhone 11": { resale: 189, storage: {64:0,128:30,256:50}, demand: "low", look: "dual-square" },
      "iPhone 11 Pro": { resale: 199, storage: {64:0,256:40,512:65}, demand: "low", look: "pro-notch" },
      "iPhone 11 Pro Max": { resale: 239, storage: {64:0,256:45,512:70}, demand: "low", look: "pro-notch" },
      "iPhone 12 mini": { resale: 219, storage: {64:0,128:25,256:50}, demand: "low", look: "dual-square" },
      "iPhone 12": { resale: 249, storage: {64:0,128:30,256:55}, demand: "medium", look: "dual-square" },
      "iPhone 12 Pro": { resale: 299, storage: {128:0,256:35,512:65}, demand: "medium", look: "pro-notch" },
      "iPhone 12 Pro Max": { resale: 359, storage: {128:0,256:40,512:75}, demand: "medium", look: "pro-notch" },
      "iPhone 13 mini": { resale: 299, storage: {128:0,256:35,512:65}, demand: "medium", look: "dual-diagonal" },
      "iPhone 13": { resale: 319, storage: {128:0,256:40,512:70}, demand: "high", look: "dual-diagonal" },
      "iPhone 13 Pro": { resale: 389, storage: {128:0,256:40,512:80,1024:110}, demand: "high", look: "pro-notch" },
      "iPhone 13 Pro Max": { resale: 419, storage: {128:0,256:45,512:90,1024:120}, demand: "high", look: "pro-notch" },
      "iPhone 14": { resale: 369, storage: {128:0,256:45,512:100}, demand: "high", look: "dual-diagonal" },
      "iPhone 14 Plus": { resale: 399, storage: {128:0,256:45,512:90}, demand: "medium", look: "dual-diagonal" },
      "iPhone 14 Pro": { resale: 479, storage: {128:0,256:40,512:80,1024:120}, demand: "high", look: "pro-island" },
      "iPhone 14 Pro Max": { resale: 539, storage: {128:0,256:50,512:90,1024:150}, demand: "high", look: "pro-island" },
      "iPhone 15": { resale: 479, storage: {128:0,256:60,512:140}, demand: "high", look: "dual-diagonal-island" },
      "iPhone 15 Plus": { resale: 519, storage: {128:0,256:60,512:120}, demand: "medium", look: "dual-diagonal-island" },
      "iPhone 15 Pro": { resale: 569, storage: {128:0,256:50,512:100,1024:160}, demand: "high", look: "pro-island" },
      "iPhone 15 Pro Max": { resale: 649, storage: {256:0,512:80,1024:150}, demand: "high", look: "pro-island" },
      "iPhone 16e": { resale: 499, storage: {128:0,256:60,512:150}, demand: "medium", look: "single-notch" },
      "iPhone 16": { resale: 619, storage: {128:0,256:70,512:150}, demand: "high", look: "dual-vertical" },
      "iPhone 16 Plus": { resale: 679, storage: {128:0,256:70,512:150}, demand: "medium", look: "dual-vertical" },
      "iPhone 16 Pro": { resale: 729, storage: {128:0,256:70,512:150,1024:240}, demand: "high", look: "pro-island" },
      "iPhone 16 Pro Max": { resale: 819, storage: {256:0,512:90,1024:180}, demand: "high", look: "pro-island" },
      "iPhone 17e": { resale: 569, storage: {256:0,512:110}, demand: "medium", look: "single-island", onRequest: true },
      "iPhone 17": { resale: 819, storage: {256:0,512:110}, demand: "high", look: "dual-vertical", onRequest: true },
      "iPhone Air": { resale: 789, storage: {256:0,512:100,1024:190}, demand: "medium", look: "air", onRequest: true },
      "iPhone 17 Pro": { resale: 1049, storage: {256:0,512:140,1024:280}, demand: "high", look: "pro-plateau", onRequest: true },
      "iPhone 17 Pro Max": { resale: 1149, storage: {256:0,512:140,1024:300,2048:560}, demand: "high", look: "pro-plateau", onRequest: true },
      "iPhone 18 Pro": { resale: 1249, storage: {256:0,512:150,1024:450,2048:900}, demand: "high", look: "pro-plateau", onRequest: true },
      "iPhone 18 Pro Max": { resale: 1399, storage: {256:0,512:150,1024:450,2048:900}, demand: "high", look: "pro-plateau", onRequest: true }
    }
  };

  const config = Object.freeze({
    pricingVersion: "2026-10-19",
    marketReferenceDate: "2026-10-19",
    minimumRecoveryOffer: 20,
    motherboardOffer: 50,
    motherboardLabCost: 100,
    labCandidateMinRetail: 280,
    minimumLabMarginAfterReserves: 70,
    // Regola di Jack: rivende a +150/200 € sul prezzo d'acquisto (IVA a margine e passaggio dati compresi).
    resaleMarginMin: 150,
    resaleMarginMax: 200,
    tradeInDiscount: 20,
    cashOnlyRate: 0.1,
    cashOnlyMinGap: 30
  });

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function euro(value) {
    return Math.max(0, Math.round(Number(value || 0) / 5) * 5);
  }

  function formatStorage(value) {
    const gb = Number(value || 0);
    if (!gb) return "";
    if (gb >= 1024 && gb % 1024 === 0) return `${gb / 1024} TB`;
    return `${gb} GB`;
  }

  function currentRetail(item, storage) {
    return Number(item.resale || 0) + Number(item.storage?.[storage] ?? 0);
  }

  function reserveProfile(retail, demand) {
    let margin;
    let preparation;
    let warranty;
    let depreciation;

    if (retail <= 180) {
      margin = 25; preparation = 10; warranty = 15; depreciation = 10;
    } else if (retail <= 350) {
      margin = 45; preparation = 15; warranty = 20; depreciation = 15;
    } else if (retail <= 600) {
      margin = 75; preparation = 20; warranty = 30; depreciation = 25;
    } else if (retail <= 900) {
      margin = 120; preparation = 25; warranty = 40; depreciation = 40;
    } else {
      margin = 180; preparation = 30; warranty = 55; depreciation = 65;
    }

    if (demand === "medium") { margin += 10; depreciation += 5; }
    if (demand === "low") { margin += 20; depreciation += 10; }

    // Riserva prudenziale sul margine. Non sostituisce il calcolo fiscale del commercialista.
    const marginTaxReserve = Math.max(10, margin * 0.18);
    return { margin, preparation, warranty, depreciation, marginTaxReserve };
  }

  // Quanto resta ad ALBA Ripara tra acquisto e rivendita: 150 € fino a 500 € di rivendita,
  // poi sale piano fino a 200 € (telefoni da 1000 € in su).
  function resaleMargin(retail) {
    return clamp(config.resaleMarginMin + (retail - 500) * 0.1, config.resaleMarginMin, config.resaleMarginMax);
  }

  function healthyPurchaseValue(retail) {
    return euro(retail - resaleMargin(retail));
  }

  function repairCost(problemId, retail) {
    const costs = {
      screen: clamp(retail * 0.22, 70, 320),
      cameras: clamp(retail * 0.12, 55, 180),
      charging: clamp(retail * 0.11, 60, 140),
      audio: clamp(retail * 0.08, 45, 110),
      controls: clamp(retail * 0.15, 70, 200),
      network: clamp(retail * 0.18, 90, 240),
      faceid: clamp(retail * 0.15, 70, 200),
      buttons: clamp(retail * 0.08, 40, 120),
      backglass: clamp(retail * 0.12, 60, 150)
    };
    return Number(costs[problemId] || 0);
  }

  function tradeExtra(demand, retail, recoveryMode) {
    if (recoveryMode === "motherboard") return 20;
    if (recoveryMode === "recovery") return 10;
    let value = demand === "high" ? 30 : demand === "medium" ? 20 : 10;
    if (demand === "high" && retail >= 700) value += 10;
    return value;
  }

  function computeEstimate(input) {
    const state = Object.assign({
      brand: "", model: "", storage: "", tests: {}, displayHistory: "",
      condition: "", battery: "", account: ""
    }, input || {});
    const item = priceData[state.brand]?.[state.model];

    if (!item) {
      return {
        status: "Valutazione in negozio", tone: "medium", cashValue: config.minimumRecoveryOffer,
        cash: `da ${config.minimumRecoveryOffer}€`, bonusValue: 10, bonus: "+10€", diagnosis: true,
        resultType: "store_only", cashLabel: "Possibile ritiro recupero", bonusLabel: "Extra permuta possibile",
        note: `Il modello non è nel listino automatico. Se è completo, di tua proprietà, con account rimovibile e IMEI regolare, lo controlliamo comunque: il ritiro può partire da ${config.minimumRecoveryOffer}€.`,
        reasons: ["Controllo gratuito in negozio", "Nessun obbligo di acquisto prima della verifica"]
      };
    }

    if (item.onRequest) {
      return {
        status: "Valutazione su richiesta", tone: "high", cashValue: 0, cash: "Su richiesta", bonusValue: 0, bonus: "Su richiesta",
        diagnosis: false, resultType: "on_request", cashLabel: "Vendita", bonusLabel: "Permuta",
        note: "Per gli iPhone 17 e 18 non abbiamo un prezzo fisso: li prendiamo quando capita l'occasione giusta. Scrivici modello, memoria e com'è messo su WhatsApp e ti facciamo un'offerta a parte.",
        reasons: []
      };
    }

    const retail = currentRetail(item, state.storage);
    const tests = state.tests || {};
    const problemIds = Object.keys(tests).filter((key) => tests[key] === "problem");
    const unknownIds = Object.keys(tests).filter((key) => tests[key] === "unknown");
    const reasons = [];

    if (item.demand === "high") reasons.push("Modello con buona richiesta nel mercato locale");
    else if (item.demand === "medium") reasons.push("Modello acquistabile con margine e condizioni corrette");
    else reasons.push("Modello a rotazione più lenta: acquisto molto selettivo");

    if (state.account !== "yes") {
      return {
        status: "Account da rimuovere", tone: "blocked", cashValue: 0, cash: "Non acquistabile",
        bonusValue: 0, bonus: "Non disponibile", diagnosis: true, resultType: "account_blocked",
        cashLabel: "Acquisto diretto", bonusLabel: "Permuta",
        note: "Non possiamo acquistare iPhone ancora legati a iCloud o a Trova il mio iPhone. Recupera la password e rimuovi l’account prima della verifica.",
        reasons: ["Proprietà e account devono essere verificabili", "L’IMEI deve risultare regolare"]
      };
    }

    const powerProblem = tests.power === "problem";
    const otherProblems = problemIds.filter((id) => id !== "power");
    const swollenBattery = false;
    const labReserves = reserveProfile(retail, item.demand);
    const labRiskReserve = labReserves.preparation + labReserves.warranty + labReserves.depreciation + labReserves.marginTaxReserve;
    const otherRepairCost = otherProblems.reduce((total, problemId) => total + repairCost(problemId, retail) + 20, 0);
    const laboratoryPotential = retail - config.motherboardOffer - config.motherboardLabCost - labRiskReserve - otherRepairCost;
    const labCandidate = powerProblem && item.demand === "high" && retail >= config.labCandidateMinRetail &&
      laboratoryPotential >= config.minimumLabMarginAfterReserves && state.condition !== "worn" && !swollenBattery && otherProblems.length <= 1;

    if (powerProblem) {
      const cashValue = labCandidate ? config.motherboardOffer : config.minimumRecoveryOffer;
      const mode = labCandidate ? "motherboard" : "recovery";
      return {
        status: labCandidate ? "Candidato laboratorio" : "Ritiro recupero", tone: labCandidate ? "lab" : "recovery",
        cashValue, cash: labCandidate ? `circa ${cashValue}€` : `${cashValue}€ minimo`,
        bonusValue: tradeExtra(item.demand, retail, mode), bonus: `+${tradeExtra(item.demand, retail, mode)}€`,
        diagnosis: true, resultType: labCandidate ? "motherboard_candidate" : "recovery_floor",
        cashLabel: labCandidate ? "Valore indicativo tecnico" : "Valore minimo recupero",
        bonusLabel: "Extra permuta possibile",
        note: labCandidate
          ? "Il telefono non si accende o non resta stabile, ma il modello può meritare una diagnosi di scheda. La cifra viene confermata solo dopo controllo di account, IMEI, telaio, completezza e costi degli eventuali altri difetti."
          : swollenBattery
            ? `Possibile ritiro tecnico da ${config.minimumRecoveryOffer}€ dopo verifica. Non ricaricare il telefono e non premere la scocca: scrivici prima di trasportarlo.`
            : `Anche se non conviene ripararlo per la rivendita, possiamo valutarlo per recupero tecnico a partire da ${config.minimumRecoveryOffer}€, dopo controllo di account, IMEI e proprietà.`,
        reasons: [
          labCandidate ? "Modello con valore sufficiente per valutare una diagnosi in laboratorio" : "Valore calcolato per recupero parti e riciclo tecnico",
          ...(otherProblems.length ? [`Altri problemi dichiarati: ${otherProblems.length}`] : [])
        ]
      };
    }

    let offer = healthyPurchaseValue(retail);

    if (state.condition === "excellent") offer += Math.min(20, retail * 0.02);
    if (state.condition === "marked") offer -= Math.max(25, retail * 0.07);
    if (state.condition === "worn") offer -= Math.max(60, retail * 0.18);

    if (state.displayHistory === "official") offer -= 10;
    if (state.displayHistory === "unknown") offer -= 20;
    if (state.displayHistory === "compatible" && !problemIds.includes("screen")) {
      offer -= clamp(retail * 0.10, 50, 120) + 20;
      reasons.push("Display compatibile: maggior rischio di preparazione e garanzia");
    }

    // Sotto l'80% la batteria va cambiata prima di rivendere: si toglie il costo del cambio.
    if (state.battery === "iphone_low") offer -= 25;
    if (state.battery === "iphone_bad") offer -= Math.max(50, retail * 0.07);
    if (state.battery === "iphone_unknown") offer -= 20;

    let technicalDeduction = 0;
    otherProblems.forEach((problemId) => {
      technicalDeduction += repairCost(problemId, retail) + 20;
    });
    offer -= technicalDeduction;
    offer -= unknownIds.length * 15;

    if (problemIds.length >= 4 || swollenBattery) offer = config.minimumRecoveryOffer;
    else if (problemIds.length >= 3) offer = Math.min(offer, 50);

    const cashValue = Math.max(config.minimumRecoveryOffer, euro(offer));
    const recoveryMode = cashValue === config.minimumRecoveryOffer ? "recovery" : "normal";
    const bonusValue = tradeExtra(item.demand, retail, recoveryMode);

    if (!problemIds.length && !unknownIds.length) reasons.push("Test dichiarato completo e funzionante");
    if (problemIds.length) reasons.push(`Problemi tecnici dichiarati: ${problemIds.length}`);
    if (unknownIds.length) reasons.push(`Funzioni da verificare in negozio: ${unknownIds.length}`);
    if (state.condition === "worn") reasons.push("Danni estetici importanti considerati nel valore");
    if (state.battery === "iphone_bad") reasons.push("Batteria considerata nei costi di preparazione");

    let status;
    let tone;
    let resultType;
    if (cashValue === config.minimumRecoveryOffer) {
      status = "Ritiro recupero"; tone = "recovery"; resultType = "recovery_floor";
    } else if (problemIds.length || unknownIds.length || state.condition === "worn" || state.displayHistory === "compatible") {
      status = "Valutazione con difetti"; tone = "lab"; resultType = "technical_offer";
    } else if (item.demand === "high" && state.condition !== "marked" && state.battery !== "iphone_bad") {
      status = "Interesse alto"; tone = "high"; resultType = "high_interest";
    } else if (item.demand === "low") {
      status = "Acquisto selettivo"; tone = "low"; resultType = "selective_low";
    } else {
      status = "Valutazione interessante"; tone = "medium"; resultType = "selective";
    }

    const minimumText = cashValue === config.minimumRecoveryOffer ? `${cashValue}€ minimo` : `circa ${cashValue}€`;
    const note = swollenBattery
      ? `Possibile ritiro tecnico da ${config.minimumRecoveryOffer}€ dopo verifica. Non ricaricare il telefono e non premere la scocca: scrivici prima di trasportarlo.`
      : cashValue === config.minimumRecoveryOffer
        ? `Il dispositivo conserva un valore minimo per recupero tecnico. I ${config.minimumRecoveryOffer}€ sono confermabili solo se il telefono è completo, di tua proprietà, senza blocchi account e con IMEI regolare.`
        : "La cifra è prudente e include margine, preparazione, possibile svalutazione e rischio garanzia. In negozio può essere confermata, ridotta o rifiutata se le condizioni reali sono diverse.";

    return {
      status, tone, cashValue, cash: minimumText, bonusValue, bonus: `+${bonusValue}€`,
      diagnosis: Boolean(problemIds.length || unknownIds.length || state.condition === "worn" || state.displayHistory === "compatible" || swollenBattery),
      resultType, reasons, note,
      cashLabel: cashValue === config.minimumRecoveryOffer ? "Valore minimo recupero" : "Valore indicativo di ritiro",
      bonusLabel: "Extra permuta possibile",
      retailReference: retail,
      technicalDeduction: euro(technicalDeduction)
    };
  }

  // Più memoria non deve mai valere meno: i gradini di reserveProfile possono far scendere
  // l'offerta quando il valore di rivendita supera una soglia. Si prende il massimo tra la
  // memoria scelta e i tagli inferiori dello stesso modello, a parità di altre risposte.
  const MONOTONIC_TYPES = ["high_interest", "selective", "selective_low", "technical_offer"];

  function estimate(input) {
    const result = computeEstimate(input);
    const item = priceData[input?.brand]?.[input?.model];
    if (!item || !MONOTONIC_TYPES.includes(result.resultType)) return result;
    const chosen = Number(input.storage);
    let best = result.cashValue;
    Object.keys(item.storage || {}).map(Number).filter((gb) => gb < chosen).forEach((gb) => {
      const lower = computeEstimate(Object.assign({}, input, { storage: gb }));
      if (MONOTONIC_TYPES.includes(lower.resultType) && lower.cashValue > best) best = lower.cashValue;
    });
    return splitOffer(result, best);
  }

  // Regola di Jack (19/10): in permuta 20 € sotto il valore calcolato; chi vende soltanto
  // prende ancora meno (10% in meno, almeno 30 €). bonusValue = differenza tra permuta e vendita.
  function splitOffer(result, base) {
    const trade = Math.max(config.minimumRecoveryOffer, euro(base - config.tradeInDiscount));
    const cash = Math.max(config.minimumRecoveryOffer, euro(trade - Math.max(config.cashOnlyMinGap, trade * config.cashOnlyRate)));
    return Object.assign({}, result, {
      cashValue: cash, cash: `circa ${cash}€`, tradeValue: trade,
      bonusValue: trade - cash, bonus: `+${trade - cash}€`
    });
  }

  const api = Object.freeze({ priceData, config, estimate, formatStorage, currentRetail, resaleMargin });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.ALBA_USED_ENGINE = api;
})(typeof window !== "undefined" ? window : globalThis);
