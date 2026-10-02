(function () {
  "use strict";
  const KEY = "alba_cookie_consent_v1";
  const VERSION = "2026-08-21-v45.7";
  const MAX_AGE_MS = 183 * 24 * 60 * 60 * 1000;
  let memoryConsent = null;
  let lastFocusedElement = null;

  const defaultConsent = {
    necessary: true, analytics: false, marketing: false, version: VERSION, updatedAt: null
  };

  function storageGet() {
    try { return localStorage.getItem(KEY); } catch (error) { return memoryConsent ? JSON.stringify(memoryConsent) : null; }
  }
  function storageSet(consent) {
    memoryConsent = consent;
    try { localStorage.setItem(KEY, JSON.stringify(consent)); return true; } catch (error) { return false; }
  }
  function storageRemove() {
    memoryConsent = null;
    try { localStorage.removeItem(KEY); } catch (error) {}
  }

  function readConsent() {
    try {
      const raw = storageGet();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const updated = Date.parse(parsed.updatedAt || "");
      if (parsed.version !== VERSION || !Number.isFinite(updated) || Date.now() - updated > MAX_AGE_MS) {
        storageRemove();
        return null;
      }
      return Object.assign({}, defaultConsent, parsed, { necessary: true });
    } catch (error) {
      storageRemove();
      return null;
    }
  }

  function applyConsent(consent) {
    window.albaCookieConsentState = consent;
    if (typeof window.albaUpdateAnalyticsConsent === "function") window.albaUpdateAnalyticsConsent(Boolean(consent.analytics));
    if (consent.marketing && typeof window.albaLoadMarketing === "function") window.albaLoadMarketing();
  }

  function focusableElements(container) {
    return [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter((element) => element instanceof HTMLElement && element.offsetParent !== null);
  }

  function setBackgroundInert(active, except) {
    [...document.body.children].forEach((child) => {
      if (child === except || child.classList?.contains("cookie-banner")) return;
      if ("inert" in child) child.inert = active;
    });
  }

  function removeBanner() {
    document.querySelector(".cookie-banner")?.remove();
    document.body.classList.remove("cookie-banner-open");
  }

  function removeModalOnly({ restoreFocus = true } = {}) {
    const modal = document.querySelector(".cookie-modal");
    if (modal) { setBackgroundInert(false, modal); modal.remove(); }
    document.body.classList.remove("cookie-modal-open");
    if (restoreFocus && lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus({ preventScroll: true });
    lastFocusedElement = null;
  }

  function closeConsentUi() { removeBanner(); removeModalOnly(); }

  function saveConsent(next) {
    const consent = Object.assign({}, defaultConsent, next, { necessary: true, version: VERSION, updatedAt: new Date().toISOString() });
    storageSet(consent);
    applyConsent(consent);
    window.dispatchEvent(new CustomEvent("alba-consent-updated", { detail: { analytics: Boolean(consent.analytics) } }));
    closeConsentUi();
    return consent;
  }

  function showBanner() {
    if (document.querySelector(".cookie-banner") || readConsent()) return;
    const banner = document.createElement("section");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Preferenze cookie");
    banner.innerHTML = `
      <div class="cookie-banner__content">
        <p class="cookie-banner__eyebrow">Privacy e cookie</p>
        <h2>Usiamo solo ciò che serve.</h2>
        <p>Il sito usa strumenti tecnici necessari. Google Analytics e Microsoft Clarity vengono caricati soltanto se autorizzi le statistiche. Puoi accettare, rifiutare o scegliere le preferenze.</p>
      </div>
      <div class="cookie-banner__actions">
        <button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-reject>Rifiuta</button>
        <button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-preferences>Preferenze</button>
        <button type="button" class="cookie-btn cookie-btn--primary" data-cookie-accept>Accetta statistiche</button>
      </div>`;
    document.body.appendChild(banner);
    document.body.classList.add("cookie-banner-open");
  }

  function showPreferences() {
    removeModalOnly({ restoreFocus: false });
    lastFocusedElement = document.activeElement;
    const current = readConsent() || defaultConsent;
    const modal = document.createElement("section");
    modal.className = "cookie-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Gestisci preferenze cookie");
    modal.innerHTML = `
      <div class="cookie-modal__box" tabindex="-1">
        <button class="cookie-modal__close" type="button" data-cookie-close aria-label="Chiudi preferenze">×</button>
        <p class="cookie-banner__eyebrow">Centro preferenze</p>
        <h2>Gestisci cookie e tracciamenti</h2>
        <p class="cookie-modal__intro">I cookie tecnici sono necessari. Le statistiche restano disattivate finché non le autorizzi.</p>
        <div class="cookie-choice cookie-choice--locked"><div><strong>Necessari</strong><p>Servono per sicurezza, preferenze e funzionamento base del sito.</p></div><span>Sempre attivi</span></div>
        <label class="cookie-choice"><div><strong>Statistiche</strong><p>Google Analytics e Microsoft Clarity per visite, conversioni e utilizzo delle pagine, solo dopo consenso.</p></div><input type="checkbox" data-cookie-analytics ${current.analytics ? "checked" : ""}></label>
        <div class="cookie-modal__actions"><button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-reject>Rifiuta tutto</button><button type="button" class="cookie-btn cookie-btn--primary" data-cookie-save>Salva preferenze</button></div>
        <p class="cookie-modal__small"><a href="cookie.html">Leggi la Cookie Policy</a> · <a href="privacy.html">Informativa Privacy</a></p>
      </div>`;
    document.body.appendChild(modal);
    document.body.classList.add("cookie-modal-open");
    setBackgroundInert(true, modal);
    requestAnimationFrame(() => modal.querySelector(".cookie-modal__box")?.focus({ preventScroll: true }));
  }

  document.addEventListener("keydown", (event) => {
    const modal = document.querySelector(".cookie-modal");
    if (!modal) return;
    if (event.key === "Escape") { event.preventDefault(); removeModalOnly(); if (!readConsent()) showBanner(); return; }
    if (event.key !== "Tab") return;
    const items = focusableElements(modal);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.matches("[data-cookie-accept]")) saveConsent({ analytics: true, marketing: false });
    else if (target.matches("[data-cookie-reject]")) saveConsent({ analytics: false, marketing: false });
    else if (target.matches("[data-cookie-preferences], [data-cookie-settings]")) { event.preventDefault(); showPreferences(); }
    else if (target.matches("[data-cookie-close]")) { removeModalOnly(); if (!readConsent()) showBanner(); }
    else if (target.matches("[data-cookie-save]")) {
      const modal = target.closest(".cookie-modal");
      saveConsent({ analytics: Boolean(modal?.querySelector("[data-cookie-analytics]")?.checked), marketing: false });
    } else if (target.classList.contains("cookie-modal")) removeModalOnly();
  });

  window.albaCookieConsent = {
    get: readConsent, open: showPreferences,
    reset() { storageRemove(); showBanner(); },
    hasAnalytics() { return Boolean(readConsent()?.analytics); },
    hasMarketing() { return Boolean(readConsent()?.marketing); }
  };
  window.albaLoadAnalytics = window.albaLoadAnalytics || function () {};
  window.albaLoadMarketing = window.albaLoadMarketing || function () {};

  const consent = readConsent();
  if (consent) applyConsent(consent);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBanner, { once: true });
  else showBanner();
})();
