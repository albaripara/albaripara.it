(() => {
  "use strict";

  const PENDING_KEY = "alba_battery_lead_pending_v1";
  const params = new URLSearchParams(window.location.search);
  const referralCode = (params.get("ref") || "").trim().toLowerCase();
  const config = window.ALBA_BATTERY_CAMPAIGN || { partners: {} };
  const partner = config.partners?.[referralCode];

  const gate = document.getElementById("campaign-gate");
  const landing = document.getElementById("campaign-landing");
  const form = document.getElementById("battery-lead-form");

  const showGate = () => {
    document.body.classList.add("campaign-is-locked");
    gate?.removeAttribute("hidden");
    landing?.setAttribute("hidden", "");
  };

  if (!partner || !referralCode) {
    showGate();
    return;
  }

  document.body.classList.add("campaign-is-open");
  landing?.removeAttribute("hidden");
  gate?.setAttribute("hidden", "");

  const sourceInput = document.getElementById("campaign-ref");
  const sourceLabelInput = document.getElementById("campaign-source-label");
  const modeInput = document.getElementById("campaign-mode");
  const landingUrlInput = document.getElementById("campaign-landing-url");
  const campaignBadge = document.getElementById("campaign-source-badge");
  const testBanner = document.getElementById("campaign-test-banner");

  if (sourceInput) sourceInput.value = referralCode;
  if (sourceLabelInput) sourceLabelInput.value = partner.label || referralCode;
  if (modeInput) modeInput.value = partner.mode === "test" ? "test" : "live";
  if (landingUrlInput) landingUrlInput.value = window.location.href;
  if (campaignBadge) campaignBadge.textContent = partner.mode === "test" ? "Accesso test interno" : "Offerta dedicata";

  if (partner.mode === "test") {
    document.body.classList.add("campaign-test-mode");
    testBanner?.removeAttribute("hidden");
  }

  const selectedModel = document.getElementById("iphone-model");
  const healthField = document.getElementById("battery-health");
  const submitSummary = document.getElementById("submit-summary");
  const nameInput = document.getElementById("lead-name");
  const phoneInput = document.getElementById("lead-phone");

  const updateSummary = () => {
    if (!submitSummary) return;
    const model = selectedModel?.value || "il tuo iPhone";
    const health = healthField?.value;
    submitSummary.textContent = health
      ? `Richiesta per ${model} · stato batteria: ${health}`
      : `Richiesta per ${model}`;
  };

  selectedModel?.addEventListener("change", updateSummary);
  healthField?.addEventListener("change", updateSummary);

  const normaliseName = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const normalisePhone = (value) => String(value || "").replace(/[^0-9+()\s-]/g, "").replace(/\s+/g, " ").trim();
  const digitCount = (value) => (String(value || "").match(/\d/g) || []).length;
  const letterCount = (value) => (String(value || "").match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []).length;

  nameInput?.addEventListener("input", () => nameInput.setCustomValidity(""));
  phoneInput?.addEventListener("input", () => {
    phoneInput.value = normalisePhone(phoneInput.value).slice(0, 22);
    phoneInput.setCustomValidity("");
  });

  const savePendingSuccess = () => {
    const pending = {
      createdAt: Date.now(),
      campaign_ref: referralCode,
      campaign_source: partner.label || referralCode,
      campaign_mode: partner.mode === "test" ? "test" : "live",
      device_model: selectedModel?.value || "",
      battery_health: healthField?.value || "",
      form_name: "check-batteria"
    };
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch (error) {}
  };

  form?.addEventListener("submit", (event) => {
    const privacy = document.getElementById("lead-privacy");
    const problemFields = Array.from(form.querySelectorAll('input[name="problemi"]'));
    const hasProblem = problemFields.some((field) => field.checked);
    const cleanName = normaliseName(nameInput?.value);
    const cleanPhone = normalisePhone(phoneInput?.value);

    if (nameInput) {
      nameInput.value = cleanName;
      nameInput.setCustomValidity(letterCount(cleanName) >= 2 ? "" : "Inserisci un nome reale.");
    }
    if (phoneInput) {
      phoneInput.value = cleanPhone;
      const digits = digitCount(cleanPhone);
      phoneInput.setCustomValidity(digits >= 8 && digits <= 15 ? "" : "Inserisci un numero con 8–15 cifre.");
    }
    problemFields.forEach((field, index) => {
      field.setCustomValidity(index === 0 && !hasProblem ? "Seleziona almeno un problema." : "");
    });

    if (!form.checkValidity() || !privacy?.checked || !hasProblem) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    // La conversione viene registrata solo nella pagina di conferma, dopo il successo Netlify.
    savePendingSuccess();
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = partner.mode === "test" ? "Invio test…" : "Invio richiesta…";
    }
  });

  window.addEventListener("pageshow", () => {
    const submitButton = form?.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Prenota il check gratuito";
    }
  });
})();
