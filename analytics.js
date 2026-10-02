(function () {
  "use strict";

  const config = window.ALBA_TRACKING_CONFIG || {};
  const GA_ID = String(config.ga4MeasurementId || "").trim();
  const CLARITY_ID = String(config.clarityProjectId || "").trim();
  const DEBUG = Boolean(config.debug);
  let analyticsLoaded = false;
  let clarityLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Consenso predefinito negato: nessun dato statistico viene inviato prima della scelta.
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  function consentGranted() {
    try {
      return Boolean(window.albaCookieConsent && window.albaCookieConsent.hasAnalytics());
    } catch (error) {
      return false;
    }
  }

  function safeValue(value, maxLength) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, maxLength || 100);
  }

  function pageSlug() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    if (!path || path === "index.html") return "home";
    return path.replace(/\.html$/i, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  }

  function sectionName(element) {
    const section = element && element.closest ? element.closest("section, header, footer, main") : null;
    if (!section) return "pagina";
    if (section.id) return safeValue(section.id, 60);
    const className = String(section.className || "").split(/\s+/).filter(Boolean)[0];
    return safeValue(className || section.tagName.toLowerCase(), 60);
  }

  function inferIntent(anchor) {
    let decodedHref = "";
    try { decodedHref = decodeURIComponent(anchor.href || ""); } catch (error) { decodedHref = anchor.href || ""; }
    const haystack = `${anchor.textContent || ""} ${decodedHref}`.toLowerCase();
    const rules = [
      ["batter", "batteria"],
      ["display", "display"],
      ["schermo", "display"],
      ["ricaric", "ricarica"],
      ["connettore", "ricarica"],
      ["trasferimento", "trasferimento-dati"],
      ["backup", "backup"],
      ["ripristino", "ripristino"],
      ["valut", "valutazione-usato"],
      ["ritiro", "valutazione-usato"],
      ["disponibil", "dispositivi-disponibili"],
      ["ricondiz", "ricondizionati"],
      ["iphone", "iphone"],
      ["samsung", "samsung"],
      ["fibra", "telefonia"],
      ["sim", "telefonia"],
      ["accessor", "accessori"],
      ["cover", "accessori"],
      ["recension", "recensioni"],
      ["preventiv", "preventivo"],
      ["appuntament", "appuntamento"]
    ];
    const match = rules.find(([needle]) => haystack.includes(needle));
    return match ? match[1] : "contatto-generico";
  }

  function referenceCode(anchor) {
    return `${pageSlug()}-${inferIntent(anchor)}`.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 55);
  }

  function isWhatsApp(anchor) {
    try {
      const url = new URL(anchor.href, window.location.href);
      return /(^|\.)wa\.me$/i.test(url.hostname) || /(^|\.)whatsapp\.com$/i.test(url.hostname);
    } catch (error) {
      return false;
    }
  }

  function addWhatsAppReference(anchor) {
    if (!config.whatsappReference || !isWhatsApp(anchor)) return;
    try {
      const url = new URL(anchor.href, window.location.href);
      const currentText = url.searchParams.get("text") || "Ciao ALBA Ripara, vi contatto dal sito.";
      if (/Rif\. sito:/i.test(currentText)) return;
      url.searchParams.set("text", `${currentText}\n\nRif. sito: ${referenceCode(anchor)}`);
      anchor.href = url.toString();
    } catch (error) {
      if (DEBUG) console.warn("Riferimento WhatsApp non aggiunto", error);
    }
  }

  function eventParams(params) {
    const clean = {
      page_path: window.location.pathname,
      page_title: document.title,
      page_code: pageSlug()
    };
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      clean[key] = typeof value === "number" ? value : safeValue(value, 100);
    });
    return clean;
  }

  window.albaTrack = function (eventName, params) {
    const name = safeValue(eventName, 40).replace(/[^a-zA-Z0-9_]/g, "_");
    const payload = eventParams(params);
    if (DEBUG) console.info("[ALBA tracking]", name, payload);
    if (!consentGranted() || !GA_ID || typeof window.gtag !== "function") return false;
    window.gtag("event", name, Object.assign({ transport_type: "beacon" }, payload));
    return true;
  };

  function loadScript(src, id, onload) {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.async = true;
    script.id = id;
    script.src = src;
    if (typeof onload === "function") script.addEventListener("load", onload, { once: true });
    document.head.appendChild(script);
  }

  function updateGoogleConsent(granted) {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function loadGA4() {
    if (!GA_ID) return;
    updateGoogleConsent(true);
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`, "alba-ga4");
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function loadClarity() {
    if (!CLARITY_ID || clarityLoaded) return;
    clarityLoaded = true;
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    loadScript(`https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`, "alba-clarity", function () {
      if (typeof window.clarity === "function") {
        window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
      }
    });
  }

  function clearCookie(name) {
    const domains = ["", window.location.hostname, `.${window.location.hostname.replace(/^www\./, "")}`];
    domains.forEach((domain) => {
      try {
        document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""} SameSite=Lax`;
      } catch (error) {
        if (DEBUG) console.warn("Cookie Analytics non eliminabile in questo contesto", name, error);
      }
    });
  }

  function revokeAnalytics() {
    updateGoogleConsent(false);
    if (typeof window.clarity === "function") {
      window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
      window.clarity("consent", false);
    }
    ["_ga", "_gid", "_gat", "_clck", "_clsk", "CLID", "ANONCHK", "MR", "MUID", "SM"].forEach(clearCookie);
  }

  window.albaLoadAnalytics = function () {
    loadGA4();
    loadClarity();
  };

  window.albaUpdateAnalyticsConsent = function (granted) {
    if (granted) window.albaLoadAnalytics();
    else revokeAnalytics();
  };

  function trackLink(anchor) {
    const href = anchor.getAttribute("href") || "";
    const common = {
      link_text: safeValue(anchor.textContent || anchor.getAttribute("aria-label") || "link", 80),
      link_section: sectionName(anchor),
      intent: inferIntent(anchor)
    };

    if (isWhatsApp(anchor)) {
      addWhatsAppReference(anchor);
      window.albaTrack("click_whatsapp", common);
      return;
    }
    if (/^tel:/i.test(href)) {
      window.albaTrack("click_phone", common);
      return;
    }
    if (/^mailto:/i.test(href)) {
      window.albaTrack("click_email", common);
      return;
    }
    if (/share\.google|google\.[^/]+\/(?:maps\/place\/)?[^?#]*review|recension/i.test(href + " " + (anchor.textContent || ""))) {
      window.albaTrack("click_reviews", common);
      return;
    }
    if (/maps|google\.[^/]+\/maps/i.test(href)) {
      window.albaTrack("click_directions", common);
      return;
    }
    if (/comparatore|preventivo/i.test(href + " " + (anchor.textContent || ""))) {
      window.albaTrack("click_preventivo", common);
    }
  }

  document.addEventListener("click", function (event) {
    const anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (anchor) trackLink(anchor);
  }, true);

  window.ALBA_TRACKING_STATUS = Object.freeze({
    ga4Configured: /^G-[A-Z0-9]+$/i.test(GA_ID),
    clarityConfigured: Boolean(CLARITY_ID),
    whatsappReference: Boolean(config.whatsappReference)
  });
})();
