document.addEventListener("DOMContentLoaded", () => {
  const gallerySlides = document.querySelectorAll(".gallery-image");
  if (gallerySlides.length > 1) {
    let currentSlide = 0;
    setInterval(() => {
      gallerySlides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % gallerySlides.length;
      gallerySlides[currentSlide].classList.add("active");
    }, 3200);
  }

  const models = {
    iphone: [
      "iPhone 8",
      "iPhone 8 Plus",
      "iPhone X",
      "iPhone XS",
      "iPhone XS Max",
      "iPhone XR",
      "iPhone SE 2020",
      "iPhone SE 2022",
      "iPhone 11",
      "iPhone 11 Pro",
      "iPhone 11 Pro Max",
      "iPhone 12",
      "iPhone 12 mini",
      "iPhone 12 Pro",
      "iPhone 12 Pro Max",
      "iPhone 13",
      "iPhone 13 mini",
      "iPhone 13 Pro",
      "iPhone 13 Pro Max",
      "iPhone 14",
      "iPhone 14 Plus",
      "iPhone 14 Pro",
      "iPhone 14 Pro Max",
      "iPhone 15",
      "iPhone 15 Plus",
      "iPhone 15 Pro",
      "iPhone 15 Pro Max",
      "iPhone 16",
      "iPhone 16 Plus",
      "iPhone 16 Pro",
      "iPhone 16 Pro Max",
      "iPhone 16e",
      "iPhone 17",
      "iPhone Air",
      "iPhone 17 Pro",
      "iPhone 17 Pro Max",
      "Altro iPhone"
    ]
  };

  const iphonePrices = {
    "iPhone 8": { displayRigenerato: null, displayOriginale: 80, batteria: 59, batteriaOriginale: null, ricarica: 55, camera: 55 },
    "iPhone 8 Plus": { displayRigenerato: null, displayOriginale: 90, batteria: 69, batteriaOriginale: null, ricarica: 60, camera: 60 },
    "iPhone X": { displayRigenerato: 90, displayOriginale: 120, batteria: 79, batteriaOriginale: null, ricarica: 70, camera: 70 },
    "iPhone XS": { displayRigenerato: 95, displayOriginale: 125, batteria: 79, batteriaOriginale: null, ricarica: 70, camera: 75 },
    "iPhone XS Max": { displayRigenerato: 110, displayOriginale: 140, batteria: 79, batteriaOriginale: null, ricarica: 80, camera: 80 },
    "iPhone SE 2020": { displayRigenerato: null, displayOriginale: 90, batteria: 69, batteriaOriginale: null, ricarica: 60, camera: 60 },
    "iPhone SE 2022": { displayRigenerato: null, displayOriginale: 100, batteria: 79, batteriaOriginale: null, ricarica: 60, camera: 60 },
    "iPhone XR": { displayRigenerato: 90, displayOriginale: 110, batteria: 79, batteriaOriginale: null, ricarica: 70, camera: 70 },

    "iPhone 11": { displayRigenerato: 90, displayOriginale: 110, batteria: 79, batteriaOriginale: null, ricarica: 70, camera: 80 },
    "iPhone 11 Pro": { displayRigenerato: 100, displayOriginale: 130, batteria: 79, batteriaOriginale: null, ricarica: 80, camera: 100 },
    "iPhone 11 Pro Max": { displayRigenerato: 110, displayOriginale: 140, batteria: 79, batteriaOriginale: null, ricarica: 80, camera: 100 },

    "iPhone 12": { displayRigenerato: 110, displayOriginale: 140, batteria: 79, batteriaOriginale: 120, ricarica: 79, camera: 130 },
    "iPhone 12 mini": { displayRigenerato: 110, displayOriginale: 140, batteria: 79, batteriaOriginale: 120, ricarica: 79, camera: 100 },
    "iPhone 12 Pro": { displayRigenerato: 110, displayOriginale: 140, batteria: 79, batteriaOriginale: 120, ricarica: 79, camera: 130 },
    "iPhone 12 Pro Max": { displayRigenerato: 150, displayOriginale: 200, batteria: 79, batteriaOriginale: 120, ricarica: 79, camera: 130 },

    "iPhone 13": { displayRigenerato: 120, displayOriginale: 160, batteria: 79, batteriaOriginale: 130, ricarica: 79, camera: 100 },
    "iPhone 13 mini": { displayRigenerato: 140, displayOriginale: 180, batteria: 79, batteriaOriginale: 130, ricarica: 79, camera: 90 },
    "iPhone 13 Pro": { displayRigenerato: 140, displayOriginale: 200, batteria: 79, batteriaOriginale: 130, ricarica: 79, camera: 130 },
    "iPhone 13 Pro Max": { displayRigenerato: 150, displayOriginale: 220, batteria: 79, batteriaOriginale: 130, ricarica: 79, camera: 130 },

    "iPhone 14": { displayRigenerato: 130, displayOriginale: 170, batteria: 89, batteriaOriginale: 130, ricarica: 89, camera: 110 },
    "iPhone 14 Plus": { displayRigenerato: 140, displayOriginale: 210, batteria: 89, batteriaOriginale: 130, ricarica: 89, camera: 110 },
    "iPhone 14 Pro": { displayRigenerato: 170, displayOriginale: 240, batteria: 89, batteriaOriginale: 130, ricarica: 89, camera: 130 },
    "iPhone 14 Pro Max": { displayRigenerato: 180, displayOriginale: 300, batteria: 89, batteriaOriginale: 130, ricarica: 89, camera: 130 },

    "iPhone 15": { displayRigenerato: 160, displayOriginale: 240, batteria: 89, batteriaOriginale: 130, ricarica: 89, camera: 120 },
    "iPhone 15 Plus": { displayRigenerato: 170, displayOriginale: 250, batteria: 89, batteriaOriginale: 130, ricarica: 100, camera: 120 },
    "iPhone 15 Pro": { displayRigenerato: 190, displayOriginale: 300, batteria: 89, batteriaOriginale: 130, ricarica: 110, camera: 140 },
    "iPhone 15 Pro Max": { displayRigenerato: 200, displayOriginale: 350, batteria: 89, batteriaOriginale: 130, ricarica: 110, camera: 140 },

    "iPhone 16": { displayRigenerato: 180, displayOriginale: 260, batteria: 115, batteriaOriginale: 135, ricarica: 120, camera: 140 },
    "iPhone 16 Plus": { displayRigenerato: 190, displayOriginale: 270, batteria: 115, batteriaOriginale: 135, ricarica: 120, camera: 140 },
    "iPhone 16 Pro": { displayRigenerato: 260, displayOriginale: 350, batteria: 115, batteriaOriginale: 135, ricarica: 130, camera: 140 },
    "iPhone 16 Pro Max": { displayRigenerato: 290, displayOriginale: 400, batteria: 115, batteriaOriginale: 135, ricarica: 140, camera: 150 }
  };

  // Listino collegato al gestionale: i prezzi sopra sono la riserva se il gestionale non risponde.
  const LISTINO_URL = "https://gestionale-riparazioni.vercel.app/api/public/listino";
  window.albaIphonePrices = iphonePrices; // usato dal telefono 3D per i prezzi "a partire da"
  const PRICE_KEYS = ["displayRigenerato", "displayOriginale", "batteria", "batteriaOriginale", "ricarica", "camera"];
  (function loadListino() {
    if (typeof fetch !== "function") return;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 4000) : null;
    fetch(LISTINO_URL, { signal: controller ? controller.signal : undefined, credentials: "omit" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload || payload.ok !== true || !payload.prices || typeof payload.prices !== "object") return;
        Object.keys(payload.prices).forEach((name) => {
          const row = payload.prices[name];
          if (!row || typeof row !== "object") return;
          const next = {};
          PRICE_KEYS.forEach((key) => {
            const value = Number(row[key]);
            next[key] = Number.isFinite(value) && value > 0 ? value : null;
          });
          iphonePrices[name] = next;
        });
      })
      .catch(() => {})
      .finally(() => { if (timer) clearTimeout(timer); });
  })();

  const problemNames = {
    display: "Display",
    battery: "Batteria",
    charge: "Ricarica",
    camera: "Fotocamera",
    transfer: "Trasferimento dati",
    reset: "Ripristino",
    backup: "Backup + aggiornamento",
    other: "Altro problema"
  };

  const problemDescriptions = {
    display: "Schermo, vetro o touch da sostituire.",
    battery: "Batteria che dura poco, telefono che si spegne o percentuale instabile.",
    charge: "Telefono che non carica bene o connettore allentato.",
    camera: "Fotocamera posteriore da sostituire o verificare.",
    transfer: "Passaggio dati da un telefono all'altro.",
    reset: "Ripristino dati di fabbrica.",
    backup: "Backup e aggiornamento software.",
    other: "Problema non in elenco: lo verifichiamo in negozio."
  };

  const brand = document.getElementById("brand");
  const model = document.getElementById("model");
  const modelSearch = document.getElementById("model-search");
  const modelQuick = document.getElementById("model-quick");
  const modelCards = document.getElementById("model-cards");
  const problems = document.getElementById("problems");
  const problemPanel = document.getElementById("problem-panel");
  const problemHelper = document.getElementById("problem-helper");
  const result = document.getElementById("result");
  const pricingLab = document.querySelector(".pricing-lab");
  let selectedModel = "";
  let selectedProblem = "";
  let activeFamily = "Tutti";

  function wa(text) {
    return `https://wa.me/3905831797237?text=${encodeURIComponent(text)}`;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function warrantyNote() {
    return `<p class="warranty-note">Prezzo e tempi indicativi con appuntamento e ricambio disponibile. Dopo l’intervento facciamo check di uscita sul funzionamento, salvo altri problemi rilevati.</p>`;
  }

  function changeButton() {
    return `<div class="comparator-back-row comparator-back-row--result">
      <button type="button" class="result-change">← Cambia problema</button>
      <button type="button" class="change-model">Cambia modello</button>
    </div>`;
  }

  function backButtons() {
    return `<div class="comparator-back-row">
      <button type="button" class="change-model">← Cambia modello</button>
    </div>`;
  }

  function setFlowStep(step) {
    if (!pricingLab) return;
    pricingLab.setAttribute("data-flow-step", String(step));
    document.querySelectorAll(".lab-step").forEach((item) => {
      const itemStep = Number(item.dataset.labStep || 0);
      item.classList.toggle("is-active", itemStep === step);
      item.classList.toggle("is-done", itemStep < step);
    });
  }

  function familyFor(deviceModel) {
    if (/17|Air/.test(deviceModel)) return "17";
    if (/16/.test(deviceModel)) return "16";
    if (/15/.test(deviceModel)) return "15";
    if (/14/.test(deviceModel)) return "14";
    if (/13/.test(deviceModel)) return "13";
    if (/12/.test(deviceModel)) return "12";
    if (/11/.test(deviceModel)) return "11";
    return "SE / X / 8";
  }

  function populateRepairModels() {
    if (!model) return;
    model.innerHTML = '<option value="">Seleziona modello iPhone</option>';
    (models.iphone || []).forEach((deviceModel) => {
      const option = document.createElement("option");
      option.value = deviceModel;
      option.textContent = deviceModel;
      model.appendChild(option);
    });
  }

  function renderFamilyFilters() {
    if (!modelQuick) return;
    const families = ["Tutti", "17", "16", "15", "14", "13", "12", "11", "SE / X / 8"];
    modelQuick.innerHTML = families.map((family) => {
      const label = family === "Tutti" ? "Tutti" : family === "SE / X / 8" ? "SE / X / 8" : `Serie ${family}`;
      return `<button type="button" class="${family === activeFamily ? "is-active" : ""}" data-family="${escapeHTML(family)}">${escapeHTML(label)}</button>`;
    }).join("");

    modelQuick.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeFamily = button.dataset.family || "Tutti";
        renderFamilyFilters();
        renderModelCards();
      });
    });
  }

  function renderModelCards() {
    if (!modelCards) return;
    const query = (modelSearch?.value || "").trim().toLowerCase();
    // i più recenti per primi (sono i più cercati), «Altro iPhone» sempre in fondo
    const allModels = (models.iphone || []).filter((m) => !/^Altro/i.test(m)).reverse()
      .concat((models.iphone || []).filter((m) => /^Altro/i.test(m)));
    const filteredModels = allModels.filter((deviceModel) => {
      const familyMatch = activeFamily === "Tutti" || familyFor(deviceModel) === activeFamily;
      const queryMatch = !query || deviceModel.toLowerCase().includes(query);
      return familyMatch && queryMatch;
    });

    if (!filteredModels.length) {
      modelCards.innerHTML = `<div class="model-empty">Nessun modello trovato. <a href="${wa("Ciao ALBA Ripara, non trovo il mio modello nel preventivatore. Potete aiutarmi?")}" target="_blank" rel="noopener noreferrer">Scrivici su WhatsApp</a> e lo verifichiamo.</div>`;
      return;
    }

    modelCards.innerHTML = filteredModels.map((deviceModel) => {
      const selected = deviceModel === selectedModel;
      const family = familyFor(deviceModel);
      return `<button type="button" class="model-card ${selected ? "is-selected" : ""}" data-model="${escapeHTML(deviceModel)}">
        <span>${escapeHTML(family === "SE / X / 8" ? "iPhone" : "Serie " + family)}</span>
        <strong>${escapeHTML(deviceModel)}</strong>
      </button>`;
    }).join("");

    modelCards.querySelectorAll(".model-card").forEach((button) => {
      button.addEventListener("click", () => chooseModel(button.dataset.model || ""));
    });
  }

  function chooseModel(deviceModel) {
    selectedModel = deviceModel;
    selectedProblem = "";
    if (typeof window.albaTrack === "function") {
      window.albaTrack("preventivo_model_selected", { device_model: deviceModel });
    }
    if (model) model.value = deviceModel;
    renderModelCards();
    document.querySelectorAll("#problems button").forEach((button) => button.classList.remove("selected"));
    if (problemPanel) problemPanel.classList.remove("is-locked");
    if (problems) problems.classList.remove("hidden");
    if (problemHelper) problemHelper.textContent = `${deviceModel} selezionato. Ora scegli il problema.`;
    setFlowStep(2);
    setResult("Scegli il problema", `${deviceModel} selezionato. Ora scegli l'intervento per vedere solo le soluzioni disponibili.`, backButtons());
    // problema già scelto dalla hero: lo applichiamo subito (un solo scorrimento, niente timer in gara)
    const pending = window.albaPendingProblem;
    window.albaPendingProblem = null;
    if (pending && applyProblem(pending)) return;
    if (window.innerWidth < 760 && problemPanel) {
      setTimeout(() => problemPanel.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    }
  }

  let resultScrollTimer = 0;
  function scrollToResult() {
    if (window.innerWidth >= 760 || !result) return;
    clearTimeout(resultScrollTimer);
    resultScrollTimer = setTimeout(() => result.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  function applyProblem(problem) {
    const btn = document.querySelector(`#problems button[data-problem="${problem}"]`);
    if (!btn || !selectedModel) return false;
    btn.click();
    return true;
  }

  // Chiamata dalla hero («Vedi il prezzo per il mio iPhone»), quante volte si vuole.
  window.albaPreventivo = {
    setProblem(problem) {
      if (selectedModel) {            // modello già scelto: risultato subito
        window.albaPendingProblem = null;
        if (applyProblem(problem)) return "result";
      }
      window.albaPendingProblem = problem; // altrimenti si applica appena sceglie il modello
      const label = problemNames[problem] || "Problema";
      setFlowStep(1);
      setResult("Ora scegli il modello", `Problema già scelto: ${label}. Tocca il tuo iPhone qui sotto e vedi subito il prezzo.`);
      return "model";
    }
  };

  function setResult(title, text, extra = "") {
    if (!result) return;
    result.classList.remove("flash");
    result.innerHTML = `<small>Soluzione</small><strong>${escapeHTML(title)}</strong><p>${escapeHTML(text)}</p>${extra}`;
    requestAnimationFrame(() => requestAnimationFrame(() => result.classList.add("flash")));
  }

  function showFixed(label, price) {
    if (typeof window.albaTrack === "function") {
      window.albaTrack("preventivo_result_viewed", { device_model: selectedModel, problem: selectedProblem, result_type: label, value: price, currency: "EUR" });
    }
    const msg = `Ciao ALBA Ripara, vorrei prenotare ${label} per ${selectedModel}. Prezzo visualizzato sul sito: ${price}€.`;
    setResult(
      `${price}€`,
      `${label}. Prezzo indicativo. Tempi più veloci con appuntamento.`,
      `<div class="solution-actions"><a class="phone-book" href="${wa(msg)}" target="_blank" rel="noopener noreferrer">Scrivi su WhatsApp</a></div>${warrantyNote()}${changeButton()}`
    );
  }

  function showIphone(problem, label) {
    const data = iphonePrices[selectedModel] || {};

    if (problem === "display") {
      if (typeof window.albaTrack === "function") window.albaTrack("preventivo_result_viewed", { device_model: selectedModel, problem: problem, result_type: "display" });
      return setResult("Display", "Circa 1 ora con appuntamento sui modelli gestiti in negozio.", buildOptions(label, [
        ["Display rigenerato", data.displayRigenerato, "Circa 1 ora con appuntamento"],
        ["Display pari originale", data.displayOriginale, "Circa 1 ora con appuntamento"]
      ]));
    }

    if (problem === "battery") {
      if (typeof window.albaTrack === "function") window.albaTrack("preventivo_result_viewed", { device_model: selectedModel, problem: problem, result_type: "battery" });
      return setResult("Batteria", "Circa 1 ora con appuntamento sui modelli gestiti in negozio.", buildOptions(label, [
        ["Batteria compatibile", data.batteria, "Circa 1 ora con appuntamento"],
        ["Batteria originale", data.batteriaOriginale, "Quando disponibile su appuntamento"]
      ]));
    }

    if (problem === "charge") {
      if (typeof window.albaTrack === "function") window.albaTrack("preventivo_result_viewed", { device_model: selectedModel, problem: problem, result_type: "charge" });
      return setResult("Ricarica", "Intervento su connettore o circuito di ricarica.", buildOptions(label, [
        ["Connettore/circuito di ricarica", data.ricarica, "Verifica al banco"]
      ]));
    }

    if (problem === "camera") {
      if (typeof window.albaTrack === "function") window.albaTrack("preventivo_result_viewed", { device_model: selectedModel, problem: problem, result_type: "camera" });
      return setResult("Fotocamera", "Sostituzione o verifica della fotocamera posteriore.", buildOptions(label, [
        ["Sostituzione fotocamera", data.camera, "Ricambio da verificare"]
      ]));
    }
  }

  function buildOptions(label, options) {
    const visibleOptions = options.filter(([name, price]) => !(name === "Batteria originale" && price == null));

    if (!visibleOptions.length) {
      const msg = `Ciao ALBA Ripara, vorrei un preventivo per ${selectedModel}. Problema: ${label}.`;
      return `<p class="quote-in-store"><b>Preventivo in negozio</b></p><div class="solution-actions"><a class="phone-book" href="${escapeHTML(wa(msg))}" target="_blank" rel="noopener noreferrer">Manda un messaggio</a></div>${warrantyNote()}`;
    }

    return `<div class="solution-list">` + visibleOptions.map(([name, price, note]) => {
      const priceText = price == null ? "Preventivo in negozio" : `${price}€`;
      const msg = price == null
        ? `Ciao ALBA Ripara, vorrei un preventivo per ${name} su ${selectedModel}. Problema: ${label}.`
        : `Ciao ALBA Ripara, vorrei prenotare la riparazione del mio ${selectedModel}. Problema: ${label}. Soluzione: ${name}. Prezzo visualizzato sul sito: ${price}€.`;

      return `<article class="solution-card">
        <div>
          <span>${escapeHTML(note || "Soluzione disponibile")}</span>
          <strong>${escapeHTML(name)}</strong>
        </div>
        <b class="${price == null ? "is-text" : ""}">${escapeHTML(priceText)}</b>
        <a href="${escapeHTML(wa(msg))}" target="_blank" rel="noopener noreferrer">${price == null ? "Manda un messaggio" : "WhatsApp"}</a>
      </article>`;
    }).join("") + `</div>${warrantyNote()}${changeButton()}`;
  }

  if (brand && model && modelCards && problems && result) {
    if (brand) brand.value = "iphone";
    populateRepairModels();
    renderFamilyFilters();
    renderModelCards();
    setFlowStep(1);
    setResult("Seleziona il modello", "Prima scegli il tuo iPhone. Poi ti mostriamo i problemi disponibili.");

    if (modelSearch) {
      modelSearch.addEventListener("input", () => renderModelCards());
    }
    model.addEventListener("change", () => {
      if (model.value) chooseModel(model.value);
    });

    document.querySelectorAll("#problems button").forEach((button) => {
      button.addEventListener("click", () => {
        if (!selectedModel) {
          setFlowStep(1);
          setResult("Prima il modello", "Scegli il modello iPhone prima del problema.");
          return;
        }

        document.querySelectorAll("#problems button").forEach((b) => b.classList.remove("selected"));
        button.classList.add("selected");
        selectedProblem = button.dataset.problem || "";
        if (typeof window.albaTrack === "function") {
          window.albaTrack("preventivo_problem_selected", { device_model: selectedModel, problem: selectedProblem });
        }
        setFlowStep(3);

        const label = problemNames[selectedProblem] || "Problema";
        if (problemHelper) problemHelper.textContent = `${label} selezionato. Guarda la soluzione.`;

        if (selectedProblem === "transfer") { showFixed(label, 25); return scrollToResult(); }
        if (selectedProblem === "reset") { showFixed(label, 10); return scrollToResult(); }
        if (selectedProblem === "backup") { showFixed(label, 20); return scrollToResult(); }

        if (selectedProblem === "other") {
          if (typeof window.albaTrack === "function") window.albaTrack("preventivo_result_viewed", { device_model: selectedModel, problem: selectedProblem, result_type: "manual_check" });
          const msg = `Ciao ALBA Ripara, vorrei verificare una riparazione per ${selectedModel}. Problema non in elenco.`;
          setResult("Da verificare", "Descrivici il problema su WhatsApp. Se puoi, aggiungi una foto.", `<div class="solution-actions"><a class="phone-book" href="${wa(msg)}" target="_blank" rel="noopener noreferrer">Scrivi su WhatsApp</a></div>${warrantyNote()}${changeButton()}`);
          scrollToResult();
          return;
        }

        showIphone(selectedProblem, label);
        scrollToResult();
      });
    });
  }



  document.addEventListener("click", (event) => {
    const changeModel = event.target.closest(".change-model");
    if (!changeModel || !pricingLab) return;

    selectedModel = "";
    selectedProblem = "";
    window.albaPendingProblem = null;
    if (model) model.value = "";
    if (modelSearch) modelSearch.value = "";
    activeFamily = "Tutti";
    renderFamilyFilters();
    renderModelCards();
    document.querySelectorAll("#problems button").forEach((button) => button.classList.remove("selected"));
    if (problems) problems.classList.add("hidden");
    if (problemPanel) problemPanel.classList.add("is-locked");
    if (problemHelper) problemHelper.textContent = "Scegli prima il modello. Poi compariranno solo gli interventi selezionabili.";
    setFlowStep(1);
    setResult("Seleziona il modello", "Prima scegli il tuo iPhone. Poi ti mostriamo i problemi disponibili.");
    const modelPanel = document.querySelector(".lab-panel--models");
    if (window.innerWidth < 760 && modelPanel) {
      setTimeout(() => modelPanel.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  });


  document.addEventListener("click", (event) => {
    const change = event.target.closest(".result-change");
    if (!change || !pricingLab) return;

    selectedProblem = "";
    document.querySelectorAll("#problems button").forEach((button) => button.classList.remove("selected"));
    if (selectedModel) {
      setFlowStep(2);
      if (problems) problems.classList.remove("hidden");
      if (problemPanel) problemPanel.classList.remove("is-locked");
      if (problemHelper) problemHelper.textContent = `${selectedModel} selezionato. Ora scegli un altro problema.`;
      setResult("Scegli il problema", `${selectedModel} selezionato. Ora scegli l'intervento.`);
      if (window.innerWidth < 760 && problemPanel) {
        setTimeout(() => problemPanel.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    } else {
      setFlowStep(1);
    }
  });


  document.addEventListener("click", (event) => {
    const stepButton = event.target.closest(".lab-step");
    if (!stepButton || !pricingLab) return;

    const requestedStep = Number(stepButton.dataset.labStep || 0);

    if (requestedStep === 1) {
      const btn = document.querySelector(".change-model");
      if (btn) btn.click();
      return;
    }

    if (requestedStep === 2 && selectedModel) {
      selectedProblem = "";
      document.querySelectorAll("#problems button").forEach((button) => button.classList.remove("selected"));
      if (problems) problems.classList.remove("hidden");
      if (problemPanel) problemPanel.classList.remove("is-locked");
      if (problemHelper) problemHelper.textContent = `${selectedModel} selezionato. Ora scegli il problema.`;
      setFlowStep(2);
      setResult("Scegli il problema", `${selectedModel} selezionato. Ora scegli l'intervento.`, backButtons());
      if (window.innerWidth < 760 && problemPanel) {
        setTimeout(() => problemPanel.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }
  });



  /* Movimento leggero e stato dell’header */
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /*
   * Reveal mirato: non nascondere mai hero o intere sezioni.
   * La V45 applicava opacity/blur anche ai contenuti above-the-fold dopo il primo paint,
   * creando lampi scuri e titoli quasi invisibili su Safari. Animiamo solo componenti
   * secondari e rendiamo visibile tutto ciò che è già nel viewport prima di attivare CSS.
   */
  const revealTargets = [...document.querySelectorAll([
    ".section-head",
    ".comparator-copy-head--final",
    ".simple-left",
    ".simple-card",
    ".trust-card",
    ".page-card",
    ".sales-card",
    ".info-card",
    ".stock-card",
    ".review-proof-card",
    ".hard-action-grid article",
    ".v28-steps-grid article",
    ".contact-action",
    ".local-card",
    ".review-teaser-card",
    ".pricing-lab",
    ".trade-v34-wizard"
  ].join(","))];

  const uniqueRevealTargets = [...new Set(revealTargets)].filter((element) => {
    return element &&
      !element.closest(".legal-content") &&
      !element.closest(".cookie-modal") &&
      !element.closest(".premium-hero") &&
      !element.closest(".page-hero") &&
      !element.closest(".hard-page-hero") &&
      !element.closest(".stock-hero") &&
      !element.closest(".sales-hero") &&
      !element.closest(".trade-v34-hero") &&
      !element.closest(".v28-contact-hero") &&
      !element.closest(".review-page-hero");
  });

  uniqueRevealTargets.forEach((element, index) => {
    element.classList.add("alba-reveal");
    const localIndex = index % 3;
    element.style.setProperty("--alba-reveal-delay", `${localIndex * 38}ms`);
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
      element.classList.add("is-visible");
    }
  });

  /* Attivare lo stato motion solo dopo aver marcato gli elementi già visibili evita il flash. */
  document.documentElement.classList.add("alba-motion-ready");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    uniqueRevealTargets.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -4% 0px" });

    uniqueRevealTargets.forEach((element) => {
      if (!element.classList.contains("is-visible")) revealObserver.observe(element);
    });
  }

  let scrollTicking = false;
  const updateHeaderState = () => {
    document.body.classList.toggle("alba-scrolled", window.scrollY > 18);
    scrollTicking = false;
  };
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateHeaderState);
  }, { passive: true });
  updateHeaderState();

  document.querySelectorAll(".faq-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const content = button.nextElementSibling;
      if (item) item.classList.toggle("open");
      button.classList.toggle("open");
      if (content) content.classList.toggle("open");
    });
  });

});
