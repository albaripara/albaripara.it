document.addEventListener("DOMContentLoaded", () => {
  const evaluatorEngine = window.ALBA_USED_ENGINE;
  const priceData = evaluatorEngine?.priceData || {};

  const testDefinitions = [
    { id: "power", icon: "⏻", action: "Accendi il telefono", title: "Accensione e stabilità", instruction: "Accendilo e aspetta circa 30 secondi. Deve restare acceso senza spegnersi o riavviarsi da solo." },
    { id: "screen", icon: "▣", action: "Prova schermo e touch", title: "Schermo e tocco", instruction: "Alza la luminosità, apri la tastiera e tocca vari punti. L'immagine deve essere pulita e il touch deve rispondere ovunque." },
    { id: "cameras", icon: "◎", action: "Apri Fotocamera", title: "Fotocamere anteriore e posteriore", instruction: "Passa dalla fotocamera posteriore a quella anteriore e scatta una foto. Entrambe devono aprirsi e mettere a fuoco." },
    { id: "charging", icon: "⚡", action: "Collega il caricatore", title: "Ricarica", instruction: "Collega il cavo e muovilo leggermente. Il simbolo di ricarica deve comparire e restare stabile." },
    { id: "audio", icon: "♪", action: "Riproduci e registra", title: "Altoparlanti e microfono", instruction: "Riproduci un audio, poi registra 5 secondi con il registratore. Devi sentire bene sia l'audio sia la registrazione." },
    { id: "controls", icon: "●", action: "Prova tasti e sblocco", title: "Tasti, Face ID o impronta", instruction: "Prova accensione, volume e lo sblocco con volto o impronta. Tutto deve rispondere normalmente." },
    { id: "network", icon: "⌁", action: "Controlla le connessioni", title: "Wi-Fi, Bluetooth e rete", instruction: "Attiva Wi-Fi e Bluetooth e controlla che la SIM prenda la rete. Se una funzione non compare o non aggancia, segnala un problema." }
  ];

  const labels = {
    brand: { iphone: "Apple iPhone", samsung: "Samsung Galaxy", other: "Altra marca" },
    condition: { excellent: "Come nuovo", good: "Buono", marked: "Segnato", worn: "Danneggiato" },
    display: { original: "Originale", official: "Sostituito originale", compatible: "Sostituito compatibile", unknown: "Da controllare" },
    account: { yes: "Rimovibile", no: "Password non disponibile", unknown: "Da verificare" },
    testStatus: { ok: "Funziona", problem: "Problema", unknown: "Non provato" },
    testName: { power: "Accensione", screen: "Schermo/touch", cameras: "Fotocamere", charging: "Ricarica", audio: "Audio/microfono", controls: "Tasti/biometria", network: "Rete/connessioni" },
    battery: {
      iphone_high: "90% o più", iphone_mid: "85–89%", iphone_low: "80–84%", iphone_bad: "Sotto 80%", iphone_unknown: "Da controllare",
      samsung_good: "Durata normale", samsung_weak: "Si scarica presto", samsung_swollen: "Gonfia o scocca sollevata", samsung_unknown: "Da controllare"
    }
  };

  const state = {
    brand: "", model: "", storage: "", tests: {}, displayHistory: "", condition: "", battery: "", account: "", storeOnly: false
  };
  let currentStep = 0;
  let currentTest = 0;
  const stepTitles = ["Che telefono vuoi valutare?", "Qual è il modello?", "Quanta memoria ha?", "Test guidato delle funzioni", "Com'è esteticamente?", "Batteria e account"];

  const wizard = document.getElementById("tradeWizard");
  if (!wizard) return;
  const steps = [...document.querySelectorAll(".trade-v34-step")];
  const progressBars = [...document.querySelectorAll(".trade-v34-progress i")];
  const next = document.getElementById("tradeNext");
  const back = document.getElementById("tradeBack");
  const reset = document.getElementById("tradeReset");
  const navigation = document.getElementById("tradeNavigation");
  const result = document.getElementById("tradeFinalResult");
  const modelSearch = document.getElementById("tradeModelSearch");
  const modelChoices = document.getElementById("tradeModelChoices");
  const storageChoices = document.getElementById("tradeStorageChoices");
  const batteryChoices = document.getElementById("tradeBatteryChoices");
  const displayHistory = document.getElementById("tradeDisplayHistory");

  const summaries = {
    brand: document.getElementById("summaryBrand"), model: document.getElementById("summaryModel"), storage: document.getElementById("summaryStorage"),
    tests: document.getElementById("summaryTests"), display: document.getElementById("summaryDisplay"), condition: document.getElementById("summaryCondition"),
    battery: document.getElementById("summaryBattery"), account: document.getElementById("summaryAccount")
  };

  function track(name, payload = {}) {
    if (typeof window.albaTrack === "function") window.albaTrack(name, payload);
  }
  function euro(value) { return Math.max(0, Math.round(value / 5) * 5); }
  function formatStorage(value) {
    return evaluatorEngine?.formatStorage ? evaluatorEngine.formatStorage(value) : (value ? `${value} GB` : "");
  }
  function clearSelected(container) {
    container?.querySelectorAll("button.selected, button.is-selected").forEach((button) => button.classList.remove("selected", "is-selected"));
  }
  function resetDownstream(level) {
    const resetTests = () => {
      state.tests = {}; state.displayHistory = ""; state.condition = ""; state.battery = ""; state.account = ""; state.storeOnly = false;
      currentTest = 0;
      clearSelected(document.getElementById("tradeTestAnswers"));
      clearSelected(document.getElementById("tradeDisplayChoices"));
      clearSelected(document.getElementById("tradeConditionChoices"));
      clearSelected(batteryChoices);
      clearSelected(document.getElementById("tradeAccountChoices"));
      if (displayHistory) displayHistory.hidden = true;
      if (batteryChoices) batteryChoices.innerHTML = "";
    };
    if (level === "brand") {
      state.model = ""; state.storage = "";
      if (modelSearch) modelSearch.value = "";
      if (modelChoices) modelChoices.innerHTML = "";
      if (storageChoices) storageChoices.innerHTML = "";
      clearSelected(modelChoices); clearSelected(storageChoices);
      resetTests();
    } else if (level === "model") {
      state.storage = "";
      if (storageChoices) storageChoices.innerHTML = "";
      clearSelected(storageChoices);
      resetTests();
    }
    lastResult = null;
    if (result) result.hidden = true;
    updateSummary();
  }
  function selectButton(container, value) {
    container.querySelectorAll("button[data-value]").forEach(btn => btn.classList.toggle("selected", btn.dataset.value === value));
  }
  function testEntries(status) {
    return testDefinitions.filter(item => state.tests[item.id] === status);
  }
  function testSummaryText() {
    const problems = testEntries("problem");
    const unknown = testEntries("unknown");
    if (!Object.keys(state.tests).length) return "—";
    if (!problems.length && !unknown.length) return "Tutto dichiarato funzionante";
    const parts = [];
    if (problems.length) parts.push(`${problems.length} ${problems.length === 1 ? "problema" : "problemi"}`);
    if (unknown.length) parts.push(`${unknown.length} ${unknown.length === 1 ? "prova incerta" : "prove incerte"}`);
    return parts.join(" • ");
  }
  function updateSummary() {
    summaries.brand.textContent = labels.brand[state.brand] || "—";
    summaries.model.textContent = state.model || "—";
    summaries.storage.textContent = state.storage ? formatStorage(state.storage) : "—";
    summaries.tests.textContent = testSummaryText();
    summaries.display.textContent = labels.display[state.displayHistory] || "—";
    summaries.condition.textContent = labels.condition[state.condition] || "—";
    summaries.battery.textContent = labels.battery[state.battery] || "—";
    summaries.account.textContent = labels.account[state.account] || "—";
  }
  function allTestsAnswered() {
    return testDefinitions.every(item => Boolean(state.tests[item.id]));
  }
  function stepComplete(step) {
    if (step === 0) return Boolean(state.brand);
    if (step === 1) return Boolean(state.model) || state.storeOnly;
    if (step === 2) return Boolean(state.storage) || state.storeOnly;
    if (step === 3) return state.storeOnly || (allTestsAnswered() && Boolean(state.displayHistory));
    if (step === 4) return Boolean(state.condition) || state.storeOnly;
    if (step === 5) return state.storeOnly || (Boolean(state.battery) && Boolean(state.account));
    return false;
  }
  function updateNav() {
    back.disabled = currentStep === 0;
    next.disabled = !stepComplete(currentStep);
    next.textContent = currentStep === 5 ? "Mostra il risultato" : "Continua";
  }
  function showStep(index, shouldScroll = true) {
    currentStep = Math.max(0, Math.min(5, index));
    result.hidden = true;
    navigation.hidden = false;
    steps.forEach((el, i) => el.classList.toggle("active", i === currentStep));
    progressBars.forEach((bar, i) => bar.classList.toggle("active", i <= currentStep));
    document.getElementById("tradeStepCounter").textContent = `Passaggio ${currentStep + 1} di 6`;
    document.getElementById("tradeStepHeading").textContent = stepTitles[currentStep];
    if (currentStep === 3) renderTest();
    if (currentStep === 5) renderBatteryChoices();
    updateNav();
    if (shouldScroll) requestAnimationFrame(() => wizard.scrollIntoView({ behavior: "smooth", block: "start" }));
    track("valutazione_step_viewed", { step: currentStep + 1, brand: state.brand || undefined, device_model: state.model || undefined });
  }
  function advanceTo(index, delay = 180) {
    window.setTimeout(() => showStep(index), delay);
  }

  function renderModels(filter = "") {
    modelChoices.innerHTML = "";
    if (!priceData[state.brand]) return;
    const names = Object.keys(priceData[state.brand]).reverse().filter(name => name.toLowerCase().includes(filter.trim().toLowerCase()));
    if (!names.length) {
      modelChoices.innerHTML = '<p class="trade-v34-empty">Nessun modello trovato. Prova a scrivere solo il numero oppure scegli “Non trovo il modello”.</p>';
      return;
    }
    names.forEach(name => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.value = name;
      button.innerHTML = `<span class="trade-v34-phone-icon" aria-hidden="true"></span><b>${name}</b><small>Tocca per scegliere</small>`;
      if (state.model === name) button.classList.add("selected");
      button.addEventListener("click", () => {
        const changedModel = state.model !== name;
        if (changedModel) resetDownstream("model");
        state.model = name;
        selectButton(modelChoices, name);
        renderStorage();
        updateSummary();
        track("valutazione_model_selected", { brand: state.brand, device_model: name });
        advanceTo(2);
      });
      modelChoices.appendChild(button);
    });
  }
  function renderStorage() {
    storageChoices.innerHTML = "";
    const item = priceData[state.brand]?.[state.model];
    if (!item) return;
    Object.keys(item.storage).map(Number).sort((a,b)=>a-b).forEach(gb => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.value = String(gb);
      button.innerHTML = `<b>${formatStorage(gb)}</b><span>Memoria</span>`;
      if (String(state.storage) === String(gb)) button.classList.add("selected");
      button.addEventListener("click", () => {
        state.storage = String(gb);
        selectButton(storageChoices, String(gb));
        updateSummary();
        track("valutazione_storage_selected", { brand: state.brand, device_model: state.model, storage_gb: gb });
        advanceTo(3);
      });
      storageChoices.appendChild(button);
    });
  }

  function renderTestProgress() {
    const progress = document.getElementById("tradeTestProgress");
    progress.innerHTML = testDefinitions.map((item, index) => {
      const status = state.tests[item.id];
      const cls = status ? `done ${status}` : index === currentTest ? "current" : "";
      return `<i class="${cls}"></i>`;
    }).join("\n");
  }
  function renderTest() {
    currentTest = Math.max(0, Math.min(testDefinitions.length - 1, currentTest));
    const item = testDefinitions[currentTest];
    document.getElementById("tradeTestCounter").textContent = `Prova ${currentTest + 1} di ${testDefinitions.length}`;
    document.getElementById("tradeTestIcon").textContent = item.icon;
    document.getElementById("tradeTestAction").textContent = item.action;
    document.getElementById("tradeTestTitle").textContent = item.title;
    document.getElementById("tradeTestInstruction").textContent = item.instruction;
    selectButton(document.getElementById("tradeTestAnswers"), state.tests[item.id] || "");
    document.getElementById("tradeTestBack").disabled = currentTest === 0;
    const problems = testEntries("problem").length;
    const unknown = testEntries("unknown").length;
    document.getElementById("tradeTestIssueCount").textContent = problems ? `${problems} ${problems === 1 ? "problema segnalato" : "problemi segnalati"}${unknown ? ` • ${unknown} da provare` : ""}` : unknown ? `${unknown} ${unknown === 1 ? "prova da verificare" : "prove da verificare"}` : "Nessun problema segnalato";
    displayHistory.hidden = !allTestsAnswered();
    renderTestProgress();
    updateSummary();
    updateNav();
  }

  document.getElementById("tradeTestAnswers").addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    const item = testDefinitions[currentTest];
    state.tests[item.id] = button.dataset.value;
    selectButton(document.getElementById("tradeTestAnswers"), button.dataset.value);
    track("valutazione_test_answered", { test: item.id, result: button.dataset.value, brand: state.brand, device_model: state.model });
    if (currentTest < testDefinitions.length - 1) {
      currentTest += 1;
      window.setTimeout(renderTest, 160);
    } else {
      renderTest();
      displayHistory.hidden = false;
      window.setTimeout(() => displayHistory.scrollIntoView({ behavior: "smooth", block: "nearest" }), 180);
    }
  });
  document.getElementById("tradeTestBack").addEventListener("click", () => {
    if (currentTest > 0) { currentTest -= 1; renderTest(); }
  });
  document.getElementById("tradeDisplayChoices").addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state.displayHistory = button.dataset.value;
    selectButton(document.getElementById("tradeDisplayChoices"), state.displayHistory);
    updateSummary();
    updateNav();
    track("valutazione_display_history_selected", { value: state.displayHistory });
  });

  document.getElementById("tradeBrandChoices").addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    const nextBrand = button.dataset.value;
    if (state.brand !== nextBrand) resetDownstream("brand");
    state.brand = nextBrand;
    state.storeOnly = state.brand === "other";
    selectButton(document.getElementById("tradeBrandChoices"), state.brand);
    updateSummary();
    track("valutazione_started", { brand: state.brand });
    if (state.storeOnly) showStoreOnlyResult();
    else { renderModels(); advanceTo(1); }
  });

  modelSearch.addEventListener("input", () => renderModels(modelSearch.value));
  document.getElementById("tradeMissingModel").addEventListener("click", () => {
    state.storeOnly = true;
    state.model = "Modello non presente";
    updateSummary();
    showStoreOnlyResult();
  });

  document.getElementById("tradeConditionChoices").addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state.condition = button.dataset.value;
    selectButton(document.getElementById("tradeConditionChoices"), state.condition);
    updateSummary();
    track("valutazione_condition_selected", { value: state.condition });
    advanceTo(5);
  });

  function renderBatteryChoices() {
    batteryChoices.innerHTML = "";
    const options = state.brand === "iphone" ? [
      ["iphone_high", "90% o più", "Ottima"], ["iphone_mid", "85–89%", "Buona"], ["iphone_low", "80–84%", "Da considerare"], ["iphone_bad", "Sotto 80%", "Da sostituire"], ["iphone_unknown", "Non lo so", "La controlleremo noi"]
    ] : [
      ["samsung_good", "Dura normalmente", "Nessun problema evidente"], ["samsung_weak", "Si scarica presto", "Autonomia ridotta"], ["samsung_swollen", "È gonfia", "Scocca o display sollevati"], ["samsung_unknown", "Non lo so", "La controlleremo noi"]
    ];
    document.getElementById("tradeBatteryLabel").textContent = state.brand === "iphone" ? "Capacità massima della batteria" : "Come si comporta la batteria?";
    options.forEach(([value, title, subtitle]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.value = value;
      button.innerHTML = `<b>${title}</b><span>${subtitle}</span>`;
      if (state.battery === value) button.classList.add("selected");
      batteryChoices.appendChild(button);
    });
  }
  batteryChoices.addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state.battery = button.dataset.value;
    selectButton(batteryChoices, state.battery);
    updateSummary(); updateNav();
    track("valutazione_battery_selected", { value: state.battery });
  });
  document.getElementById("tradeAccountChoices").addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state.account = button.dataset.value;
    selectButton(document.getElementById("tradeAccountChoices"), state.account);
    updateSummary(); updateNav();
    track("valutazione_account_selected", { value: state.account });
  });

  next.addEventListener("click", () => {
    if (!stepComplete(currentStep)) return;
    if (state.storeOnly) { showStoreOnlyResult(); return; }
    if (currentStep === 5) { calculateAndShow(); return; }
    showStep(currentStep + 1);
  });
  back.addEventListener("click", () => showStep(currentStep - 1));
  reset.addEventListener("click", resetWizard);
  document.getElementById("tradeEditAnswers").addEventListener("click", () => showStep(0));

  let lastResult = null;

  function calculateAndShow() {
    if (!evaluatorEngine || typeof evaluatorEngine.estimate !== "function") {
      showResult({
        status: "Valutazione in negozio", tone: "medium", cash: "da 20€", bonus: "+10€",
        note: "Il motore automatico non è disponibile. Portalo in negozio e lo controlliamo senza impegno.",
        diagnosis: true, resultType: "engine_unavailable", reasons: ["Controllo manuale necessario"],
        cashLabel: "Possibile ritiro recupero", bonusLabel: "Extra permuta possibile"
      });
      return;
    }
    showResult(evaluatorEngine.estimate(state));
  }

  function diagnosticHtml() {
    const problems = testEntries("problem");
    const unknown = testEntries("unknown");
    const good = testEntries("ok");
    const pills = [];
    problems.forEach(item => pills.push(`<span class="problem">${labels.testName[item.id]}: problema</span>`));
    unknown.forEach(item => pills.push(`<span class="unknown">${labels.testName[item.id]}: da provare</span>`));
    if (!problems.length && !unknown.length && good.length) pills.push('<span class="ok">Test dichiarato tutto funzionante</span>');
    return `<strong>Riepilogo test</strong><div>${pills.join("")}</div>`;
  }

  function showResult(config) {
    const { status, tone, cash, bonus, note, diagnosis, resultType, reasons = [], cashLabel = "Ritiro diretto", bonusLabel = "Bonus cambio telefono" } = config;
    lastResult = { status, cash, bonus, resultType };
    steps.forEach(el => el.classList.remove("active"));
    result.hidden = false;
    navigation.hidden = true;
    document.getElementById("tradeStepCounter").textContent = "Test completato";
    document.getElementById("tradeStepHeading").textContent = diagnosis ? "Abbiamo raccolto i dati utili" : "La valutazione preliminare è pronta";
    progressBars.forEach(bar => bar.classList.add("active"));
    document.getElementById("tradeResultModel").textContent = `${state.model} ${state.storage ? `• ${formatStorage(state.storage)}` : ""}`.trim();
    document.getElementById("tradeInterestBadge").textContent = status;
    document.getElementById("tradeInterestBadge").className = `trade-v35-interest-badge ${tone || "medium"}`;
    document.getElementById("tradeCashLabel").textContent = cashLabel;
    document.getElementById("tradeBonusLabel").textContent = bonusLabel;
    document.getElementById("tradeCashOffer").textContent = cash;
    document.getElementById("tradeBonusOffer").textContent = bonus;
    document.getElementById("tradeResultNote").textContent = note;
    document.getElementById("tradeDiagnosticSummary").innerHTML = diagnosticHtml();
    document.getElementById("tradeInterestReasons").innerHTML = reasons.length ? `<strong>Perché questo esito</strong><ul>${reasons.map(reason => `<li>${reason}</li>`).join("")}</ul>` : "";
    document.getElementById("tradeResultIntro").textContent = diagnosis
      ? "Il motore ha applicato una stima prudente per difetti, recupero tecnico o laboratorio. La conferma avviene in negozio."
      : "Stima preliminare calcolata con margine di sicurezza, non un'offerta vincolante.";
    setWhatsapp(status, cash, bonus);
    track("valutazione_result_viewed", {
      brand: state.brand, device_model: state.model, storage_gb: Number(state.storage || 0), issue_count: testEntries("problem").length,
      unknown_count: testEntries("unknown").length, display_history: state.displayHistory, condition: state.condition, battery: state.battery,
      account: state.account, estimated_cash: cash, estimated_bonus: bonus, diagnosis_required: diagnosis, result_type: resultType, interest_status: status
    });
    requestAnimationFrame(() => wizard.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function showStoreOnlyResult() {
    state.storeOnly = true;
    const modelText = state.model || "Telefono di altra marca";
    state.model = modelText;
    updateSummary();
    const estimate = evaluatorEngine?.estimate ? evaluatorEngine.estimate(state) : {
      status: "Valutazione in negozio", tone: "medium", cash: "da 20€", bonus: "+10€", diagnosis: true, resultType: "store_only",
      reasons: ["Controllo gratuito in negozio"], note: "Il modello viene verificato manualmente.",
      cashLabel: "Possibile ritiro recupero", bonusLabel: "Extra permuta possibile"
    };
    showResult(estimate);
  }

  function setWhatsapp(status, cash, bonus) {
    const testLines = testDefinitions.map(item => `- ${labels.testName[item.id]}: ${labels.testStatus[state.tests[item.id]] || "da verificare"}`).join("\n");
    const baseMessage = `Ciao ALBA Ripara, ho completato il test guidato per la valutazione.

Marca: ${labels.brand[state.brand] || state.brand}
Modello: ${state.model}
Memoria: ${state.storage ? formatStorage(state.storage) : "da verificare"}

TEST FUNZIONI
${testLines}

Display sostituito: ${labels.display[state.displayHistory] || "da verificare"}
Estetica: ${labels.condition[state.condition] || "da verificare"}
Batteria: ${labels.battery[state.battery] || "da verificare"}
Account rimovibile: ${labels.account[state.account] || "da verificare"}

Esito: ${status}
Stima indicativa ritiro: ${cash}
Extra permuta possibile: ${bonus}`;
    document.getElementById("tradeWhatsappSell").href = "https://wa.me/3905831797237?text=" + encodeURIComponent(baseMessage + "\n\nVorrei vendere il telefono e prenotare il controllo gratuito in negozio.");
    document.getElementById("tradeWhatsappTrade").href = "https://wa.me/3905831797237?text=" + encodeURIComponent(baseMessage + "\n\nVorrei usarlo come permuta per acquistare un altro telefono.");
  }


  function resetWizard() {
    Object.assign(state, { brand: "", model: "", storage: "", tests: {}, displayHistory: "", condition: "", battery: "", account: "", storeOnly: false });
    currentTest = 0;
    document.querySelectorAll(".trade-v34-wizard button.selected, .trade-v34-wizard button.is-selected").forEach(btn => btn.classList.remove("selected", "is-selected"));
    modelSearch.value = "";
    modelChoices.innerHTML = "";
    storageChoices.innerHTML = "";
    batteryChoices.innerHTML = "";
    displayHistory.hidden = true;
    lastResult = null;
    result.hidden = true;
    navigation.hidden = false;
    updateSummary();
    showStep(0);
    track("valutazione_restarted");
  }

  updateSummary();
  showStep(0, false);
});