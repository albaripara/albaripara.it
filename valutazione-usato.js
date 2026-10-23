// Valutazione usato iPhone — ALBA Ripara
// Tre passaggi: modello e memoria, cosa non funziona (sul telefono 3D), com'è messo. Poi la cifra.
// Il calcolo sta in valutazione-engine.js; qui c'è solo il percorso e il telefono 3D.
document.addEventListener("DOMContentLoaded", () => {
  const engine = window.ALBA_USED_ENGINE;
  const app = document.getElementById("vuApp");
  if (!app || !engine) return;
  const models = engine.priceData.iphone;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cosa può non funzionare. face = dove sta sul telefono, x/y = punto in percentuale sulla faccia.
  const FAULTS = [
    { id: "power", label: "Non si accende", short: "Non si accende" },
    { id: "screen", label: "Schermo o touch", short: "Schermo", face: "front", x: 78, y: 50 },
    { id: "faceid", label: "Face ID o fotocamera davanti", short: "Face ID", seLabel: "Tasto Home o Touch ID", seShort: "Touch ID", face: "front", x: 50, y: 5, seY: 89 },
    { id: "cameras", label: "Fotocamere dietro", short: "Fotocamere", face: "back" },
    { id: "backglass", label: "Vetro dietro rotto", short: "Vetro dietro", face: "back", x: 50, y: 62 },
    { id: "charging", label: "Non carica", short: "Ricarica", face: "front", x: 50, y: 99 },
    { id: "audio", label: "Audio o microfono", short: "Audio, micro", face: "front", x: 28, y: 99 },
    { id: "buttons", label: "Tasti", short: "Tasti", face: "front", x: 100, y: 25 },
    { id: "network", label: "Rete, Wi-Fi o Bluetooth", short: "Rete, Wi-Fi" }
  ];
  const LABELS = {
    condition: { excellent: "Come nuovo", good: "Buono", marked: "Segnato", worn: "Rovinato" },
    battery: { iphone_high: "90% o più", iphone_mid: "85–89%", iphone_low: "80–84%", iphone_bad: "Sotto 80%", iphone_unknown: "Da controllare" },
    displayHistory: { original: "Mai cambiato", official: "Cambiato, originale", compatible: "Cambiato, non originale", unknown: "Non lo so" }
  };
  // Dove stanno le fotocamere dietro, per ogni tipo di telefono (punto da toccare).
  const CAMERA_SPOT = { "pro-plateau": [30, 12], air: [24, 9], se: [17, 8] };
  const NOTCH_LOOKS = ["se", "dual-square", "dual-diagonal", "pro-notch", "single-notch"];
  const PRO_LOOKS = ["pro-notch", "pro-island", "pro-plateau"];

  const state = { model: "", storage: "", faults: new Set(), condition: "", battery: "", displayHistory: "", storeOnly: false };
  const $ = (id) => document.getElementById(id);
  const phone = $("vuPhone");
  const scene = $("vuScene");
  const floor = document.querySelector(".vu-floor");
  const steps = [...app.querySelectorAll(".vu-step")];
  const bars = [...app.querySelectorAll(".vu-progress i")];
  const ORDER = ["model", "faults", "details", "result"];

  function track(name, payload = {}) {
    if (typeof window.albaTrack === "function") window.albaTrack(name, payload);
  }
  const isSE = () => (models[state.model] || {}).look === "se";
  const powerOff = () => state.faults.has("power");

  /* ---------- telefono 3D ---------- */

  const crackSvg = '<svg class="vu-crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M62 38 L48 8 M62 38 L90 22 M62 38 L96 52 M62 38 L70 88 M62 38 L30 70 M62 38 L8 40 M48 8 L40 0 M30 70 L18 100 M70 88 L64 100 M90 22 L100 18 M55 52 L40 56 M66 54 L80 64"/></svg>';

  const LENS = '<i class="l"><s class="lr"></s><s class="lr lr2"></s></i>';
  const BUMP = '<s class="vu-bl k1"></s><s class="vu-bl k2"></s><s class="vu-bl k3"></s><s class="vu-bl k4"></s>';
  function lensHtml(look) {
    return BUMP + lensBase(look).replace(/<i class="l"><\/i>/g, LENS);
  }
  function lensBase(look) {
    if (look === "se" || look === "single-notch" || look === "single-island") return '<i class="l"></i><b class="fl"></b>';
    if (look === "air") return '<i class="l"></i><b class="fl"></b>';
    if (PRO_LOOKS.includes(look)) return '<i class="l"></i><i class="l"></i><i class="l"></i><b class="fl"></b><b class="li"></b>';
    return '<i class="l"></i><i class="l"></i><b class="fl"></b>';
  }

  // Logo Apple (forma classica della mela), disegnato in SVG
  const appleSvg = '<svg class="vu-apple" viewBox="0 0 814 1000" aria-hidden="true"><defs><linearGradient id="vuAppleG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity=".42"/></linearGradient></defs><path fill="url(#vuAppleG)" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>';
  const statusIcons = '<span class="vu-sb-icons"><i class="vu-sig"><b></b><b></b><b></b><b></b></i><svg class="vu-wifi" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.4 6.4 0 0 1 9 0l-1.4 1.4a4.4 4.4 0 0 0-6.2 0zM1.3 4.7a9.5 9.5 0 0 1 13.4 0l-1.4 1.4a7.5 7.5 0 0 0-10.6 0z"/></svg><i class="vu-bat"><b></b></i></span>';

  // tasti sui lati: [lato, inizio %, lunghezza %, tipo]
  function sideButtons(look) {
    const action = ["pro-plateau", "dual-vertical", "air", "single-island"].includes(look) || (look === "pro-island" && /1[56]/.test(state.model || previewModel));
    const list = look === "se"
      ? [["l", 15, 4, "mute"], ["l", 22, 7, "vol"], ["l", 31, 7, "vol"], ["r", 20, 9, "power"]]
      : [["l", 16, 4, action ? "action" : "mute"], ["l", 24, 8, "vol"], ["l", 34, 8, "vol"], ["r", 25, 12, "power"]];
    if (["dual-vertical", "pro-plateau", "air", "single-island"].includes(look)) list.push(["r", 60, 7, "cam"]);
    return list.map(([side, top, len, type]) => `<span class="vu-btn vu-btn-${side} vu-btn-${type}" data-top="${top}" data-len="${len}"></span>`).join("");
  }

  let previewModel = "";
  function buildPhone() {
    const shown = state.model || previewModel;
    const item = models[shown];
    const look = item ? item.look : "pro-island";
    phone.dataset.look = look;
    phone.dataset.front = look === "se" ? "home" : NOTCH_LOOKS.includes(look) ? "notch" : "island";
    phone.dataset.finish = PRO_LOOKS.includes(look) ? "pro" : "color";
    const layers = Array.from({ length: 17 }, (_, i) => `<span class="vu-edge" data-z="${i - 8}"></span>`).join("");
    const hot = (face) => FAULTS.filter((f) => f.face === face || (f.id === "cameras" && face === "back")).map((f) => {
      let x = f.x; let y = f.y;
      if (f.id === "cameras") [x, y] = CAMERA_SPOT[look] || [24, 12];
      if (f.id === "faceid" && look === "se") y = f.seY;
      return `<button class="vu-hot" data-fault="${f.id}" data-x="${x}" data-y="${y}" type="button" tabindex="-1" aria-hidden="true"><span>${f.id === "faceid" && look === "se" ? f.seLabel : f.label}</span></button>`;
    }).join("");
    const name = shown ? shown.replace("iPhone ", "") : "";
    const usbc = /^(dual-diagonal-island|dual-vertical|single-island|air|pro-plateau)$/.test(look) || (look === "pro-island" && /1[5-9]/.test(shown)) || look === "single-notch" && /16e/.test(shown);
    phone.innerHTML = `${layers}
      <span class="vu-side vu-side-l"></span><span class="vu-side vu-side-r"></span>
      <span class="vu-bottom"><i class="vu-grill"></i><i class="vu-port${usbc ? " usbc" : ""}"></i><i class="vu-grill"></i></span>
      ${sideButtons(look)}
      <div class="vu-face vu-backface"><div class="vu-cams">${lensHtml(look)}</div>${appleSvg}<span class="vu-sheen"></span><div class="vu-glass-crack">${crackSvg}</div>${hot("back")}</div>
      <div class="vu-face vu-frontface"><div class="vu-screen"><span class="vu-island"></span>
        <div class="vu-ui">
          <span class="vu-sb"><span class="vu-time">ALBA</span>${statusIcons}</span>
          <span class="vu-lock-date">lunedì 19 ottobre</span><span class="vu-lock-clock">9:41</span>
          <strong class="vu-ui-model">${name || "iPhone"}</strong><span class="vu-ui-status" id="vuUiStatus"></span>
          <span class="vu-lock-btn l"></span><span class="vu-lock-btn r"></span><span class="vu-homebar"></span>
        </div>
        <div class="vu-screen-crack">${crackSvg}</div></div><span class="vu-glare"></span><span class="vu-home"></span>${hot("front")}</div>`;
    phone.querySelectorAll(".vu-edge").forEach((el) => {
      const z = Number(el.dataset.z);
      el.style.setProperty("--k", (z / 17).toFixed(3));
      // bordo bombato: più chiaro vicino ai vetri, più scuro al centro
      el.style.setProperty("--l", (0.78 + Math.abs(z) / 8 * 0.42).toFixed(2));
    });
    phone.querySelectorAll(".vu-btn").forEach((el) => { el.style.top = el.dataset.top + "%"; el.style.height = el.dataset.len + "%"; });
    phone.querySelectorAll(".vu-hot").forEach((b) => {
      b.style.left = b.dataset.x + "%";
      b.style.top = b.dataset.y + "%";
      b.addEventListener("click", (e) => { e.stopPropagation(); if (!wasDrag) toggleFault(b.dataset.fault); });
    });
    paintPhone();
  }

  function paintPhone() {
    const off = powerOff();
    phone.classList.toggle("is-off", off);
    phone.classList.toggle("has-screen", state.faults.has("screen"));
    phone.classList.toggle("has-backglass", state.faults.has("backglass"));
    phone.querySelectorAll(".vu-hot").forEach((b) => b.classList.toggle("on", state.faults.has(b.dataset.fault)));
    const status = $("vuUiStatus");
    if (status) {
      const n = [...state.faults].filter((id) => id !== "power").length;
      status.textContent = currentStep === "faults" ? (n ? `${n} ${n === 1 ? "problema" : "problemi"}` : "Tocca cosa non va") : "";
    }
  }

  // rotazione: si trascina con dito o mouse; da fermo ondeggia piano
  let ry = reduce ? -24 : -200; let rx = 6; let targetRy = -24; let dragging = false; let wasDrag = false; let lastMove = 0;
  let startX = 0; let startY = 0; let baseRy = 0; let baseRx = 0;
  let visible = true; let looping = false;
  function loop() { if (!looping && visible && !document.hidden) { looping = true; requestAnimationFrame(render); } }
  if ("IntersectionObserver" in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; loop(); }).observe(scene);
  document.addEventListener("visibilitychange", loop);
  function render(t) {
    if (!visible || document.hidden) { looping = false; return; }
    if (!dragging) {
      const idle = !reduce && performance.now() - lastMove > 2500;
      const sway = idle ? Math.sin(t / 1400) * 10 : 0;
      ry += (targetRy + sway - ry) * (reduce ? 1 : 0.08);
      rx += (6 - rx) * (reduce ? 1 : 0.06);
    }
    phone.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    // riflesso della luce sul vetro e ombra a terra che seguono la rotazione
    const rad = (ry * Math.PI) / 180;
    phone.style.setProperty("--gx", (50 + Math.sin(rad) * 60).toFixed(1) + "%");
    phone.style.setProperty("--gy", (50 - rx * 2).toFixed(1) + "%");
    if (floor) floor.style.transform = `scaleX(${(0.55 + Math.abs(Math.cos(rad)) * 0.45).toFixed(3)})`;
    const facingBack = Math.cos((ry * Math.PI) / 180) < 0;
    phone.classList.toggle("show-back", facingBack);
    requestAnimationFrame(render);
  }
  function turnTo(face) {
    const want = face === "back" ? 180 : 0;
    const base = targetRy - (((targetRy % 360) + 360) % 360);
    let next = base + want - 24 * (face === "back" ? -1 : 1);
    if (next - targetRy > 180) next -= 360;
    if (targetRy - next > 180) next += 360;
    targetRy = next;
    lastMove = performance.now();
  }
  scene.addEventListener("pointerdown", (e) => {
    dragging = true; wasDrag = false; startX = e.clientX; startY = e.clientY; baseRy = ry; baseRx = rx;
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX; const dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) wasDrag = true;
    ry = baseRy + dx * 0.6; rx = Math.max(-25, Math.min(25, baseRx - dy * 0.3));
    targetRy = ry; lastMove = performance.now();
    $("vuHint").classList.add("gone");
  });
  const endDrag = () => { dragging = false; setTimeout(() => { wasDrag = false; }, 0); };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  $("vuFlip").addEventListener("click", () => turnTo(Math.cos((targetRy * Math.PI) / 180) < 0 ? "front" : "back"));

  /* ---------- passaggi ---------- */

  let currentStep = "model";
  function go(step, scroll = true) {
    currentStep = step;
    app.dataset.step = step;
    steps.forEach((el) => el.classList.toggle("active", el.dataset.step === step));
    const idx = ORDER.indexOf(step);
    bars.forEach((b, i) => b.classList.toggle("on", i <= idx));
    if (step === "faults") {
      turnTo("front");
      $("vuChosen").textContent = `${state.model.replace("iPhone ", "")} · ${engine.formatStorage(Number(state.storage))}`;
    }
    if (step === "details") showQuestion(0);
    paintPhone();
    if (scroll) {
      // telefono 3D e domande sempre insieme nella stessa schermata
      const top = app.getBoundingClientRect().top + window.scrollY - 74;
      if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }
    track("valutazione_step_viewed", { step: idx + 1, device_model: state.model || undefined });
  }
  app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));

  // 1. modello e memoria: rotella delle serie, poi modello e memoria. Niente lista lunga.
  const VARIANT_ORDER = ["mini", "", "e", "Plus", "Air", "Pro", "Pro Max", "2020", "2022"];
  function seriesOf(name) {
    const n = name.replace("iPhone ", "");
    if (n.startsWith("SE")) return "SE";
    if (n === "Air") return "17";
    return (n.match(/^\d+/) || [""])[0];
  }
  function variantOf(name) {
    const n = name.replace("iPhone ", "");
    if (n.startsWith("SE")) return n.replace("SE ", "");
    if (n === "Air") return "Air";
    return n.replace(/^\d+/, "").trim();
  }
  function variantLabel(name) {
    const v = variantOf(name);
    return v === "" ? seriesOf(name) : v === "e" ? seriesOf(name) + "e" : v;
  }
  const SERIES = [];
  Object.keys(models).forEach((n) => { const k = seriesOf(n); if (!SERIES.includes(k)) SERIES.push(k); });
  SERIES.push("altro");
  const variantsOf = (k) => Object.keys(models).filter((n) => seriesOf(n) === k)
    .sort((a, b) => VARIANT_ORDER.indexOf(variantOf(a)) - VARIANT_ORDER.indexOf(variantOf(b)));
  let series = "";

  const wheel = $("vuSeries");
  wheel.innerHTML = `<span class="vu-wheel-pad"></span>${SERIES.map((k) => `<button data-series="${k}" role="option" type="button">${k === "altro" ? "Altro" : k}${["17", "18"].includes(k) ? "<small>su richiesta</small>" : ""}</button>`).join("")}<span class="vu-wheel-pad"></span>`;
  let wheelTouched = false; let wheelTimer = 0;
  const centerOn = (k, smooth = true) => {
    const b = wheel.querySelector(`[data-series="${k}"]`);
    if (!b) return;
    wheel.scrollTo({ left: b.offsetLeft - wheel.clientWidth / 2 + b.offsetWidth / 2, behavior: smooth && !reduce ? "smooth" : "auto" });
  };
  function nearestSeries() {
    const mid = wheel.scrollLeft + wheel.clientWidth / 2;
    let best = null; let dist = Infinity;
    wheel.querySelectorAll("[data-series]").forEach((b) => {
      const d = Math.abs(b.offsetLeft + b.offsetWidth / 2 - mid);
      if (d < dist) { dist = d; best = b.dataset.series; }
    });
    return best;
  }
  // girando la rotella il telefono 3D cambia subito modello
  wheel.addEventListener("scroll", () => {
    const k = nearestSeries();
    wheel.querySelectorAll("[data-series]").forEach((b) => b.classList.toggle("near", b.dataset.series === k));
    if (!wheelTouched) return;
    if (k !== "altro" && !state.model) {
      const v = variantsOf(k);
      const base = v.find((n) => variantOf(n) === "") || v[0];
      if (previewModel !== base) { previewModel = base; buildPhone(); }
    }
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { if (nearestSeries() !== series) selectSeries(nearestSeries(), false); }, 160);
  }, { passive: true });
  ["pointerdown", "touchstart", "wheel"].forEach((ev) => wheel.addEventListener(ev, () => { wheelTouched = true; }, { passive: true }));
  wheel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-series]");
    if (!b) return;
    wheelTouched = true;
    selectSeries(b.dataset.series, true);
  });

  function resetAnswers() {
    state.storage = ""; state.storeOnly = false;
    state.faults.clear(); state.condition = ""; state.battery = ""; state.displayHistory = "";
    app.querySelectorAll("[data-field] button.selected").forEach((x) => x.classList.remove("selected"));
  }
  function selectSeries(k, scroll) {
    if (!k) return;
    series = k;
    if (scroll) centerOn(k);
    wheel.querySelectorAll("[data-series]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.series === k)));
    if (k === "altro") {
      state.model = "";
      $("vuVariant").innerHTML = '<button data-variant="altro" type="button">Il mio non c\'è: scrivici su WhatsApp</button>';
      $("vuStorage").hidden = true; $("vuOnRequestNote").hidden = true;
      return;
    }
    const list = variantsOf(k);
    const onRequest = models[list[0]].onRequest;
    $("vuVariant").innerHTML = list.map((n) => `<button data-variant="${n}" type="button">${variantLabel(n)}</button>`).join("");
    $("vuOnRequestNote").hidden = !onRequest;
    if (onRequest) {
      state.model = ""; previewModel = list.find((n) => variantOf(n) === "Pro") || list[0];
      $("vuStorage").hidden = true;
      buildPhone();
    } else {
      // il modello base è già scelto: si tocca solo se è Pro, Plus, mini...
      selectVariant(list.find((n) => variantOf(n) === "") || list[0], true);
    }
    track("valutazione_series_selected", { series: k });
  }
  function selectVariant(name, auto = false) {
    if (state.model !== name) resetAnswers();
    state.model = name;
    previewModel = name;
    $("vuVariant").querySelectorAll("button").forEach((b) => b.classList.toggle("selected", b.dataset.variant === name));
    if (models[name].onRequest) {
      buildPhone();
      track("valutazione_model_selected", { brand: "iphone", device_model: name, on_request: true });
      showResult();
      return;
    }
    renderStorage();
    $("vuStorage").hidden = false;
    renderFaults();
    buildPhone();
    if (!auto && !reduce) targetRy += 360;
    if (!auto) track("valutazione_model_selected", { brand: "iphone", device_model: name });
  }
  $("vuVariant").addEventListener("click", (e) => {
    const b = e.target.closest("[data-variant]");
    if (!b) return;
    if (b.dataset.variant === "altro") {
      state.storeOnly = true; state.model = "Modello non in elenco"; state.storage = "";
      showResult();
      return;
    }
    selectVariant(b.dataset.variant);
  });
  function renderStorage() {
    const item = models[state.model];
    $("vuStorage").innerHTML = Object.keys(item.storage).map(Number).sort((a, b) => a - b)
      .map((gb) => `<button data-value="${gb}" type="button"${String(gb) === state.storage ? ' class="selected"' : ""}>${engine.formatStorage(gb)}</button>`).join("");
  }
  $("vuStorage").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-value]");
    if (!b) return;
    state.storage = b.dataset.value;
    renderStorage();
    track("valutazione_started", { brand: "iphone" });
    track("valutazione_storage_selected", { brand: "iphone", device_model: state.model, storage_gb: Number(state.storage) });
    setTimeout(() => go("faults"), 160);
  });

  // Se la pagina è aperta da un iPhone, dalla misura dello schermo capiamo quali modelli può essere.
  const SCREENS = {
    "375x667": ["iPhone SE 2022", "iPhone SE 2020"], "375x812": ["iPhone 13 mini", "iPhone 12 mini", "iPhone 11 Pro"],
    "390x844": ["iPhone 14", "iPhone 13", "iPhone 13 Pro", "iPhone 12", "iPhone 12 Pro", "iPhone 16e"],
    "428x926": ["iPhone 14 Plus", "iPhone 13 Pro Max", "iPhone 12 Pro Max"],
    "393x852": ["iPhone 16", "iPhone 15", "iPhone 15 Pro", "iPhone 14 Pro"],
    "430x932": ["iPhone 16 Plus", "iPhone 15 Plus", "iPhone 15 Pro Max", "iPhone 14 Pro Max"],
    "402x874": ["iPhone 16 Pro", "iPhone 17", "iPhone 17 Pro"], "440x956": ["iPhone 16 Pro Max", "iPhone 17 Pro Max"],
    "420x912": ["iPhone Air"]
  };
  function detectIphone() {
    if (!/iPhone/.test(navigator.userAgent || "")) return [];
    const w = Math.min(screen.width, screen.height); const h = Math.max(screen.width, screen.height);
    if (w === 414 && h === 896) return window.devicePixelRatio >= 3 ? ["iPhone 11 Pro Max"] : ["iPhone 11"];
    return (SCREENS[`${w}x${h}`] || []).filter((n) => models[n]);
  }
  const guesses = detectIphone();
  // la ruota parte già sulla serie più probabile
  previewModel = guesses[0] || "iPhone 15 Pro";

  // 2. cosa non funziona
  function renderFaults() {
    $("vuFaults").innerHTML = FAULTS.map((f) => {
      const label = f.id === "faceid" && isSE() ? f.seLabel : f.label;
      const on = state.faults.has(f.id);
      const dim = powerOff() && f.id !== "power";
      const short = f.id === "faceid" && isSE() ? f.seShort : f.short;
      return `<button aria-pressed="${on}" aria-label="${label}" data-fault="${f.id}" type="button"${dim ? " disabled" : ""}>${short}</button>`;
    }).join("");
    const n = state.faults.size;
    $("vuFaultsNext").textContent = !n ? "✓ Funziona tutto, avanti" : powerOff() ? "Avanti" : `Avanti · ${n} ${n === 1 ? "problema" : "problemi"}`;
    $("vuFaultsNext").classList.toggle("is-ok", !n);
  }
  function toggleFault(id) {
    if (currentStep !== "faults") go("faults", false);
    if (powerOff() && id !== "power") return;
    if (state.faults.has(id)) state.faults.delete(id);
    else {
      if (id === "power") state.faults.clear();
      state.faults.add(id);
      const def = FAULTS.find((f) => f.id === id);
      if (def && def.face) turnTo(def.face);
      if (id === "cameras") turnTo("back");
    }
    renderFaults();
    paintPhone();
    track("valutazione_test_answered", { test: id, result: state.faults.has(id) ? "problem" : "ok", brand: "iphone", device_model: state.model });
  }
  $("vuFaults").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-fault]");
    if (b) toggleFault(b.dataset.fault);
  });
  $("vuFaultsNext").addEventListener("click", () => {
    if (!state.faults.size) track("valutazione_all_ok", { device_model: state.model });
    go("details");
  });

  // 3. com'è messo: una domanda alla volta. Toccata la risposta si passa alla prossima.
  const rows = [...app.querySelectorAll(".vu-row[data-q]")];
  // se non si accende, batteria e schermo li controlliamo noi
  const questions = () => rows.filter((r) => !powerOff() || r.dataset.q === "condition");
  let qIndex = 0;
  let qTimer = 0;
  function showQuestion(i) {
    clearTimeout(qTimer);
    const list = questions();
    qIndex = Math.max(0, Math.min(i, list.length - 1));
    rows.forEach((r) => { r.hidden = r !== list[qIndex]; });
    $("vuDetailsQ").textContent = list[qIndex].dataset.title;
    $("vuQCount").textContent = list.length > 1 ? `${qIndex + 1} di ${list.length}` : "";
  }
  $("vuDetailsBack").addEventListener("click", () => {
    if (qIndex > 0) showQuestion(qIndex - 1);
    else go("faults");
  });
  app.querySelectorAll(".vu-seg[data-field]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-value]");
      if (!b) return;
      const field = group.dataset.field;
      state[field] = b.dataset.value;
      group.querySelectorAll("button").forEach((x) => x.classList.toggle("selected", x === b));
      const names = { condition: "valutazione_condition_selected", battery: "valutazione_battery_selected", displayHistory: "valutazione_display_history_selected" };
      track(names[field], { value: state[field] });
      // un attimo per vedere la risposta segnata, poi avanti
      clearTimeout(qTimer);
      qTimer = setTimeout(() => {
        if (qIndex < questions().length - 1) showQuestion(qIndex + 1);
        else if (detailsDone()) showResult();
      }, reduce ? 0 : 280);
    });
  });
  function detailsDone() {
    return Boolean(state.condition) && (powerOff() || (Boolean(state.battery) && Boolean(state.displayHistory)));
  }

  /* ---------- risultato ---------- */

  function engineInput() {
    const tests = {};
    FAULTS.forEach((f) => { tests[f.id] = state.faults.has(f.id) ? "problem" : "ok"; });
    return {
      brand: state.storeOnly ? "" : "iphone", model: state.model, storage: state.storage, tests,
      displayHistory: powerOff() ? "unknown" : state.displayHistory, condition: state.condition,
      battery: powerOff() ? "iphone_unknown" : state.battery, account: "yes"
    };
  }
  const MINIMUM = ["store_only", "recovery_floor"];
  function countUp(el, to, prefix) {
    if (reduce || !to) { el.textContent = `${prefix}${to} €`; return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 900);
      el.textContent = `${prefix}${Math.round((to * (1 - Math.pow(1 - k, 3))) / 5) * 5} €`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  let last = null;
  function showResult() {
    const r = engine.estimate(engineInput());
    last = r;
    app.dataset.result = r.resultType;
    $("vuSell").textContent = r.resultType === "on_request" ? "Chiedi un'offerta" : "Voglio venderlo";
    const onReq = r.resultType === "on_request";
    $("vuBadge").textContent = onReq ? "Su richiesta" : "La tua stima";
    $("vuBadge").className = "trade-v35-interest-badge medium";
    $("vuResultModel").textContent = `${state.model}${state.storage ? " · " + engine.formatStorage(state.storage) : ""}`;
    const numeric = !onReq;
    const atLeast = MINIMUM.includes(r.resultType);
    $("vuCashLabel").textContent = atLeast ? "Te lo paghiamo almeno" : "Te lo paghiamo circa";
    $("vuTradeLabel").textContent = atLeast ? "In permuta almeno" : "In permuta vale circa";
    if (numeric) {
      countUp($("vuCash"), r.cashValue, "");
      countUp($("vuTrade"), r.cashValue + r.bonusValue, "");
    } else {
      $("vuCash").textContent = r.cash;
      $("vuTrade").textContent = r.bonus;
    }
    const pills = [];
    const broken = FAULTS.filter((f) => state.faults.has(f.id));
    broken.forEach((f) => pills.push(`<span class="problem">${f.id === "faceid" && isSE() ? f.seLabel : f.label}</span>`));
    if (!broken.length && !state.storeOnly && r.resultType !== "on_request") pills.push('<span class="ok">Funziona tutto</span>');
    if (state.condition) pills.push(`<span>Estetica: ${LABELS.condition[state.condition]}</span>`);
    if (state.battery && !powerOff()) pills.push(`<span>Batteria: ${LABELS.battery[state.battery]}</span>`);
    $("vuPills").innerHTML = pills.join("");
    $("vuNote").textContent = onReq
      ? "Per gli iPhone 17 e 18 non c'è un prezzo fisso: scrivici su WhatsApp e ti facciamo un'offerta. Ci riserviamo di provarlo in negozio."
      : state.storeOnly
        ? "Il tuo modello non è nel listino: questa è una stima minima. Ci riserviamo di provarlo in negozio prima di confermare il prezzo."
        : "Questa è una stima. Ci riserviamo di provare il telefono in negozio prima di confermare il prezzo.";
    setWhatsapp(r);
    go("result");
    track("valutazione_result_viewed", {
      brand: "iphone", device_model: state.model, storage_gb: Number(state.storage || 0), issue_count: broken.length,
      condition: state.condition, battery: state.battery, display_history: state.displayHistory,
      estimated_cash: r.cash, estimated_bonus: r.bonus, result_type: r.resultType, interest_status: r.status
    });
  }
  function setWhatsapp(r) {
    const broken = FAULTS.filter((f) => state.faults.has(f.id)).map((f) => (f.id === "faceid" && isSE() ? f.seLabel : f.label));
    const numeric = r.resultType !== "on_request";
    const msg = `Ciao ALBA Ripara, ho fatto la valutazione sul sito.

Modello: ${state.model}
Memoria: ${state.storage ? engine.formatStorage(state.storage) : "da verificare"}
Cosa non funziona: ${broken.length ? broken.join(", ") : "niente, funziona tutto"}
Estetica: ${LABELS.condition[state.condition] || "da verificare"}
Batteria: ${LABELS.battery[state.battery] || "da verificare"}
Schermo cambiato: ${LABELS.displayHistory[state.displayHistory] || "da verificare"}

Stima: ${numeric ? `${MINIMUM.includes(r.resultType) ? "almeno" : "circa"} ${r.cashValue} €, in permuta ${r.cashValue + r.bonusValue} €` : "su richiesta, mi fate un'offerta?"}`;
    $("vuSell").href = "https://wa.me/3905831797237?text=" + encodeURIComponent(msg + (r.resultType === "on_request" ? "\n\nVi mando qualche foto." : "\n\nVorrei venderlo: quando posso passare?"));
    $("vuTradeIn").href = "https://wa.me/3905831797237?text=" + encodeURIComponent(msg + "\n\nVorrei darlo in permuta per un altro telefono.");
  }
  $("vuRestart").addEventListener("click", () => {
    delete app.dataset.result;
    state.model = ""; series = "";
    resetAnswers();
    $("vuVariant").innerHTML = '<span class="vu-wheel-hint">Scorri i numeri e tocca il tuo</span>'; $("vuStorage").hidden = true; $("vuOnRequestNote").hidden = true;
    wheel.querySelectorAll("[data-series]").forEach((b) => b.setAttribute("aria-selected", "false"));
    buildPhone();
    go("model");
    track("valutazione_restarted");
  });

  renderFaults();
  buildPhone();
  requestAnimationFrame(() => centerOn(guesses.length ? seriesOf(guesses[0]) : "15", false));
  loop();
});
