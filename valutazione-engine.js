(function (global) {
  "use strict";

  const priceData = {
    iphone: {
      "iPhone SE 2020": { resale: 120, storage: {64:0,128:20,256:40}, demand: "low" },
      "iPhone SE 2022": { resale: 180, storage: {64:0,128:25,256:45}, demand: "medium" },
      "iPhone XS": { resale: 150, storage: {64:0,256:35}, demand: "low" },
      "iPhone 11": { resale: 210, storage: {64:0,128:30}, demand: "medium" },
      "iPhone 11 Pro": { resale: 250, storage: {64:0,256:40,512:65}, demand: "medium" },
      "iPhone 11 Pro Max": { resale: 290, storage: {64:0,256:45,512:70}, demand: "medium" },
      "iPhone 12 mini": { resale: 210, storage: {64:0,128:25,256:50}, demand: "medium" },
      "iPhone 12": { resale: 230, storage: {64:0,128:30,256:55}, demand: "high" },
      "iPhone 12 Pro": { resale: 310, storage: {128:0,256:35,512:65}, demand: "high" },
      "iPhone 12 Pro Max": { resale: 360, storage: {128:0,256:40,512:75}, demand: "high" },
      "iPhone 13 mini": { resale: 290, storage: {128:0,256:35,512:65}, demand: "high" },
      "iPhone 13": { resale: 295, storage: {128:0,256:35,512:65}, demand: "high" },
      "iPhone 13 Pro": { resale: 410, storage: {128:0,256:40,512:80,1024:110}, demand: "high" },
      "iPhone 13 Pro Max": { resale: 465, storage: {128:0,256:45,512:90,1024:120}, demand: "high" },
      "iPhone 14": { resale: 305, storage: {128:0,256:45,512:105}, demand: "high" },
      "iPhone 14 Plus": { resale: 380, storage: {128:0,256:45,512:90}, demand: "high" },
      "iPhone 14 Pro": { resale: 490, storage: {128:0,256:25,512:65,1024:110}, demand: "high" },
      "iPhone 14 Pro Max": { resale: 550, storage: {128:0,256:35,512:70,1024:150}, demand: "high" },
      "iPhone 15": { resale: 420, storage: {128:0,256:75,512:160}, demand: "high" },
      "iPhone 15 Plus": { resale: 485, storage: {128:0,256:60,512:120}, demand: "high" },
      "iPhone 15 Pro": { resale: 590, storage: {128:0,256:25,512:80,1024:145}, demand: "high" },
      "iPhone 15 Pro Max": { resale: 700, storage: {256:0,512:70,1024:140}, demand: "high" },
      "iPhone 16": { resale: 610, storage: {128:0,256:60,512:135}, demand: "high" },
      "iPhone 16 Plus": { resale: 680, storage: {128:0,256:70,512:145}, demand: "high" },
      "iPhone 16 Pro": { resale: 820, storage: {128:0,256:80,512:160,1024:240}, demand: "high" },
      "iPhone 16 Pro Max": { resale: 930, storage: {256:0,512:95,1024:180}, demand: "high" },
      "iPhone 17": { resale: 740, storage: {256:0,512:100}, demand: "high" },
      "iPhone Air": { resale: 710, storage: {256:0,512:100,1024:190}, demand: "high" },
      "iPhone 17 Pro": { resale: 1120, storage: {256:0,512:130,1024:260}, demand: "high" },
      "iPhone 17 Pro Max": { resale: 1250, storage: {256:0,512:120,1024:390,2048:570}, demand: "high" }
    },
    samsung: {
      "Galaxy A16": { resale: 110, storage: {128:0,256:20}, demand: "low" },
      "Galaxy A34": { resale: 180, storage: {128:0,256:35}, demand: "low" },
      "Galaxy A54": { resale: 210, storage: {128:0,256:35}, demand: "medium" },
      "Galaxy S21": { resale: 180, storage: {128:0,256:25}, demand: "medium" },
      "Galaxy S22": { resale: 230, storage: {128:0,256:35}, demand: "medium" },
      "Galaxy S22 Ultra": { resale: 360, storage: {128:0,256:30,512:65}, demand: "high" },
      "Galaxy S23 FE": { resale: 250, storage: {128:0,256:55}, demand: "medium" },
      "Galaxy S23": { resale: 290, storage: {128:0,256:40}, demand: "high" },
      "Galaxy S23 Plus": { resale: 350, storage: {256:0,512:45}, demand: "high" },
      "Galaxy S23 Ultra": { resale: 470, storage: {256:0,512:55,1024:110}, demand: "high" },
      "Galaxy S24 FE": { resale: 340, storage: {128:0,256:45,512:90}, demand: "medium" },
      "Galaxy S24": { resale: 365, storage: {128:0,256:50,512:100}, demand: "high" },
      "Galaxy S24 Plus": { resale: 455, storage: {256:0,512:55}, demand: "high" },
      "Galaxy S24 Ultra": { resale: 610, storage: {256:0,512:70,1024:140}, demand: "high" },
      "Galaxy S25 FE": { resale: 430, storage: {128:0,256:80,512:150}, demand: "medium" },
      "Galaxy S25": { resale: 490, storage: {128:0,256:55,512:115}, demand: "high" },
      "Galaxy S25 Plus": { resale: 570, storage: {256:0,512:70}, demand: "high" },
      "Galaxy S25 Ultra": { resale: 715, storage: {256:0,512:85,1024:160}, demand: "high" }
    }
  };

  const config = Object.freeze({
    pricingVersion: "2026-08-21",
    marketReferenceDate: "2026-08-21",
    minimumRecoveryOffer: 20,
    motherboardOffer: 50,
    motherboardLabCost: 100,
    labCandidateMinRetail: 280,
    minimumLabMarginAfterReserves: 70
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

  function healthyPurchaseValue(retail, demand) {
    const reserves = reserveProfile(retail, demand);
    return euro(retail - reserves.margin - reserves.preparation - reserves.warranty - reserves.depreciation - reserves.marginTaxReserve);
  }

  function repairCost(problemId, retail) {
    const costs = {
      screen: clamp(retail * 0.22, 70, 320),
      cameras: clamp(retail * 0.12, 55, 180),
      charging: clamp(retail * 0.11, 60, 140),
      audio: clamp(retail * 0.08, 45, 110),
      controls: clamp(retail * 0.15, 70, 200),
      network: clamp(retail * 0.18, 90, 240)
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

  function estimate(input) {
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
        note: "Non possiamo acquistare dispositivi ancora legati a iCloud, Trova il mio iPhone, account Google o Samsung. Recupera la password e rimuovi l’account prima della verifica.",
        reasons: ["Proprietà e account devono essere verificabili", "L’IMEI deve risultare regolare"]
      };
    }

    const powerProblem = tests.power === "problem";
    const otherProblems = problemIds.filter((id) => id !== "power");
    const swollenBattery = state.battery === "samsung_swollen";
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

    let offer = healthyPurchaseValue(retail, item.demand);

    if (state.condition === "excellent") offer += Math.min(15, retail * 0.015);
    if (state.condition === "marked") offer -= Math.max(20, retail * 0.07);
    if (state.condition === "worn") offer -= Math.max(50, retail * 0.18);

    if (state.displayHistory === "official") offer -= 10;
    if (state.displayHistory === "unknown") offer -= 20;
    if (state.displayHistory === "compatible" && !problemIds.includes("screen")) {
      offer -= clamp(retail * 0.10, 50, 120) + 20;
      reasons.push("Display compatibile: maggior rischio di preparazione e garanzia");
    }

    if (state.battery === "iphone_high") offer += 10;
    if (state.battery === "iphone_low") offer -= 25;
    if (state.battery === "iphone_bad") offer -= Math.max(45, retail * 0.06);
    if (state.battery === "iphone_unknown") offer -= 15;
    if (state.battery === "samsung_weak") offer -= 35;
    if (state.battery === "samsung_unknown") offer -= 15;
    if (swollenBattery) offer = config.minimumRecoveryOffer;

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
    if (["iphone_bad", "samsung_weak", "samsung_swollen"].includes(state.battery)) reasons.push("Batteria considerata nei costi di preparazione");

    let status;
    let tone;
    let resultType;
    if (cashValue === config.minimumRecoveryOffer) {
      status = "Ritiro recupero"; tone = "recovery"; resultType = "recovery_floor";
    } else if (problemIds.length || unknownIds.length || state.condition === "worn" || state.displayHistory === "compatible") {
      status = "Valutazione con difetti"; tone = "lab"; resultType = "technical_offer";
    } else if (item.demand === "high" && state.condition !== "marked" && !["iphone_bad", "samsung_weak"].includes(state.battery)) {
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

  const api = Object.freeze({ priceData, config, estimate, formatStorage, currentRetail });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.ALBA_USED_ENGINE = api;
})(typeof window !== "undefined" ? window : globalThis);
