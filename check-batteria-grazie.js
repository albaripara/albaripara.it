(() => {
  "use strict";
  const PENDING_KEY = "alba_battery_lead_pending_v1";
  const SENT_KEY = "alba_battery_lead_sent_v1";
  const MAX_AGE_MS = 30 * 60 * 1000;
  let pending = null;

  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
  } catch (error) {
    pending = null;
  }

  if (!pending || !Number.isFinite(Number(pending.createdAt)) || Date.now() - Number(pending.createdAt) > MAX_AGE_MS) {
    try { sessionStorage.removeItem(PENDING_KEY); } catch (error) {}
    return;
  }

  const eventId = `${pending.createdAt}:${pending.campaign_ref || "unknown"}`;
  const alreadySent = () => {
    try { return sessionStorage.getItem(SENT_KEY) === eventId; } catch (error) { return false; }
  };

  const sendSuccess = () => {
    if (alreadySent()) return true;
    if (!window.albaCookieConsent?.hasAnalytics?.() || typeof window.albaTrack !== "function") return false;
    const isTest = pending.campaign_mode === "test";
    const sent = window.albaTrack(isTest ? "battery_check_test_success" : "generate_lead", {
      lead_type: "check_batteria",
      form_name: pending.form_name || "check-batteria",
      campaign_ref: pending.campaign_ref || "",
      campaign_source: pending.campaign_source || "",
      campaign_mode: isTest ? "test" : "live",
      device_model: pending.device_model || "",
      battery_health: pending.battery_health || "",
      success_page: true
    });
    if (sent) {
      try {
        sessionStorage.setItem(SENT_KEY, eventId);
        sessionStorage.removeItem(PENDING_KEY);
      } catch (error) {}
    }
    return sent;
  };

  sendSuccess();
  window.addEventListener("alba-consent-updated", (event) => {
    if (event.detail?.analytics) sendSuccess();
  });
})();
