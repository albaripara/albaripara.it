// Disponibili — ALBA Ripara
// Il cliente sceglie che iPhone cerca, il telefono 3D cambia con lui, e parte un WhatsApp già scritto.
// Il telefono usa lo stesso disegno del valutatore (valutazione-3d.css). Nessun prezzo nostro: il budget è del cliente.
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("dpApp");
  if (!app) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const phone = $("dpPhone");
  const scene = $("dpScene");
  const scale = $("dpScale");
  const floor = app.querySelector(".vu-floor");

  const state = { line: "", size: "", color: "", storage: "", budget: "" };
  const TEXT = {
    line: { base: "normale", pro: "Pro", any: "normale o Pro, indifferente" },
    size: { normal: "normale", big: "grande (Plus o Max)" },
    color: { dark: "scuro", light: "chiaro", colour: "colorato", any: "va bene tutto" },
    storage: { "128": "128 GB", "256": "256 GB o più", unknown: "non so" },
    budget: { "300": "fino a 300 €", "500": "300–500 €", "800": "500–800 €", max: "oltre 800 €" }
  };
  // colori del telefono 3D: [retro, bordo, bordo scuro]
  const PAINT = {
    base: { dark: ["#2f3431", "#3b403d", "#1f2321"], light: ["#eef0ec", "#e2e4e1", "#a9acaa"], colour: ["#f3c7cf", "#e9b7c0", "#b47d88"] },
    pro: { dark: ["#2b2d2c", "#4a4c4b", "#262827"], light: ["#e4e2dc", "#d3d0c8", "#9a968c"], colour: ["#3d4a5e", "#7d8899", "#4a5466"] }
  };
  const COLOURS = [["#f3c7cf", "#e9b7c0", "#b47d88"], ["#c9d7e6", "#b9c8d8", "#7f8fa1"], ["#d3e3d3", "#c4d6c4", "#8aa08a"], ["#f2e3a6", "#e6d593", "#ab9a58"]];

  function track(name, payload = {}) {
    if (typeof window.albaTrack === "function") window.albaTrack(name, payload);
  }

  /* ---------- telefono 3D ---------- */

  const LENS = '<i class="l"><s class="lr"></s><s class="lr lr2"></s></i>';
  const BUMP = '<s class="vu-bl k1"></s><s class="vu-bl k2"></s><s class="vu-bl k3"></s><s class="vu-bl k4"></s>';
  const appleSvg = '<svg class="vu-apple" viewBox="0 0 814 1000" aria-hidden="true"><defs><linearGradient id="dpAppleG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity=".42"/></linearGradient></defs><path fill="url(#dpAppleG)" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>';
  const statusIcons = '<span class="vu-sb-icons"><i class="vu-sig"><b></b><b></b><b></b><b></b></i><svg class="vu-wifi" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.4 6.4 0 0 1 9 0l-1.4 1.4a4.4 4.4 0 0 0-6.2 0zM1.3 4.7a9.5 9.5 0 0 1 13.4 0l-1.4 1.4a7.5 7.5 0 0 0-10.6 0z"/></svg><i class="vu-bat"><b></b></i></span>';

  function buildPhone() {
    const pro = state.line === "pro";
    const look = pro ? "pro-island" : "dual-diagonal-island";
    phone.dataset.look = look;
    phone.dataset.front = "island";
    phone.dataset.finish = pro ? "pro" : "color";
    const lenses = pro ? '<i class="l"></i><i class="l"></i><i class="l"></i><b class="fl"></b><b class="li"></b>' : '<i class="l"></i><i class="l"></i><b class="fl"></b>';
    const buttons = [["l", 16, 4, "mute"], ["l", 24, 8, "vol"], ["l", 34, 8, "vol"], ["r", 25, 12, "power"]]
      .map(([side, top, len, type]) => `<span class="vu-btn vu-btn-${side} vu-btn-${type}" data-top="${top}" data-len="${len}"></span>`).join("");
    const layers = Array.from({ length: 17 }, (_, i) => `<span class="vu-edge" data-z="${i - 8}"></span>`).join("");
    phone.innerHTML = `${layers}
      <span class="vu-side vu-side-l"></span><span class="vu-side vu-side-r"></span>
      <span class="vu-bottom"><i class="vu-grill"></i><i class="vu-port usbc"></i><i class="vu-grill"></i></span>
      ${buttons}
      <div class="vu-face vu-backface"><div class="vu-cams">${BUMP + lenses.replace(/<i class="l"><\/i>/g, LENS)}</div>${appleSvg}<span class="vu-sheen"></span></div>
      <div class="vu-face vu-frontface"><div class="vu-screen"><span class="vu-island"></span>
        <div class="vu-ui">
          <span class="vu-sb"><span class="vu-time">ALBA</span>${statusIcons}</span>
          <span class="vu-lock-date">In negozio oggi</span><span class="vu-lock-clock">9:41</span>
          <strong class="vu-ui-model" id="dpUiModel"></strong><span class="vu-ui-status" id="dpUiStatus"></span>
          <span class="vu-lock-btn l"></span><span class="vu-lock-btn r"></span><span class="vu-homebar"></span>
        </div></div><span class="vu-glare"></span></div>`;
    phone.querySelectorAll(".vu-edge").forEach((el) => {
      const z = Number(el.dataset.z);
      el.style.setProperty("--k", (z / 17).toFixed(3));
      el.style.setProperty("--l", (0.78 + Math.abs(z) / 8 * 0.42).toFixed(2));
    });
    phone.querySelectorAll(".vu-btn").forEach((el) => { el.style.top = el.dataset.top + "%"; el.style.height = el.dataset.len + "%"; });
    paintPhone();
  }

  let colourTurn = 0;
  function paintPhone() {
    const line = state.line === "pro" ? "pro" : "base";
    let paint = null;
    if (state.color === "colour" && line === "base") paint = COLOURS[colourTurn % COLOURS.length];
    else if (PAINT[line][state.color]) paint = PAINT[line][state.color];
    ["--back", "--frame", "--frame2"].forEach((v, i) => {
      if (paint) phone.style.setProperty(v, paint[i]); else phone.style.removeProperty(v);
    });
    scale.classList.toggle("is-big", state.size === "big");
    const name = "iPhone" + (state.line === "pro" ? " Pro" : "") + (state.size === "big" ? (state.line === "pro" ? " Max" : " Plus") : "");
    $("dpUiModel").textContent = name;
    const bits = [state.storage && state.storage !== "unknown" ? TEXT.storage[state.storage] : "", state.budget ? TEXT.budget[state.budget] : ""].filter(Boolean);
    $("dpUiStatus").textContent = bits.join(" · ");
  }

  // rotazione: come nel valutatore, si trascina con dito o mouse; da fermo ondeggia piano
  let ry = reduce ? -24 : -200; let rx = 6; let targetRy = -24; let dragging = false; let lastMove = 0;
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
    const rad = (ry * Math.PI) / 180;
    phone.style.setProperty("--gx", (50 + Math.sin(rad) * 60).toFixed(1) + "%");
    phone.style.setProperty("--gy", (50 - rx * 2).toFixed(1) + "%");
    if (floor) floor.style.transform = `scaleX(${(0.55 + Math.abs(Math.cos(rad)) * 0.45).toFixed(3)})`;
    phone.classList.toggle("show-back", Math.cos(rad) < 0);
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
    dragging = true; startX = e.clientX; startY = e.clientY; baseRy = ry; baseRx = rx;
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    ry = baseRy + (e.clientX - startX) * 0.6; rx = Math.max(-25, Math.min(25, baseRx - (e.clientY - startY) * 0.3));
    targetRy = ry; lastMove = performance.now();
    $("dpHint").classList.add("gone");
  });
  const endDrag = () => { dragging = false; };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  $("dpFlip").addEventListener("click", () => turnTo(Math.cos((targetRy * Math.PI) / 180) < 0 ? "front" : "back"));

  /* ---------- scelte ---------- */

  function setWhatsapp() {
    const rows = [["Modello", "line"], ["Grandezza", "size"], ["Colore", "color"], ["Memoria", "storage"], ["Budget", "budget"]]
      .filter(([, k]) => state[k]).map(([label, k]) => `${label}: ${TEXT[k][state[k]]}`);
    const text = "Ciao ALBA Ripara, cerco un iPhone usato o ricondizionato." + (rows.length ? "\n" + rows.join("\n") : "\nModello: ...\nBudget circa: ... €") + "\nCosa avete oggi?";
    $("dpAsk").href = "https://wa.me/3905831797237?text=" + encodeURIComponent(text);
  }

  app.querySelectorAll(".vu-seg[data-field]").forEach((group) => {
    const field = group.dataset.field;
    group.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      const again = state[field] === b.dataset.value;
      state[field] = again ? "" : b.dataset.value;
      group.querySelectorAll("button").forEach((x) => x.classList.toggle("selected", x === b && !again));
      if (field === "color" && state.color === "colour") colourTurn += 1;
      if (field === "line") buildPhone(); else paintPhone();
      // girarlo sul retro quando si sceglie il colore, davanti per il resto
      turnTo(field === "color" || field === "line" ? "back" : "front");
      setWhatsapp();
    }));
  });
  $("dpAsk").addEventListener("click", () => track("disponibili_whatsapp", { ...state }));

  buildPhone();
  setWhatsapp();
  turnTo("front");
  loop();
});
