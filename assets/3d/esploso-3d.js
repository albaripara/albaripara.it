// Telefono 3D ALBA Ripara.
// - si apre da solo in pochi pezzi, si gira col dito
// - tocchi un pezzo (sul telefono o sui pulsanti): viene in primo piano, il resto sfuma,
//   e la scheda con spiegazione e prezzo "a partire da" compare SOPRA il 3D
// Modello: "iPhone 12 Teardown" di Peter_D (Sketchfab), CC BY 4.0, colori e animazione modificati.
import * as THREE from './lib/three.module.min.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { RoomEnvironment } from './lib/RoomEnvironment.js';
import { MeshoptDecoder } from './lib/meshopt_decoder.module.js';

const HALF_PI = Math.PI / 2;
// move: spostamento (metri) quando il telefono è aperto. view: da che lato guardarlo in primo piano.
const PARTS = {
  display:  { nodes: ['front_panel'], move: [0.115, 0.034, 0], view: { y: -HALF_PI + 0.3, x: 0.08 } },
  batteria: { nodes: ['battery'], move: [0.064, 0.012, 0], view: { y: -HALF_PI + 0.35, x: 0.08 } },
  scheda:   { nodes: ['motherboard', 'motherboard_cover', 'motherboard_cables_cover'], move: [0.07, 0.014, 0], view: { y: -HALF_PI + 0.4, x: 0.08 } },
  ricarica: { nodes: ['charging_port'], move: [0, -0.034, 0], view: { y: -HALF_PI + 0.7, x: -0.3 } },
  camera:   { nodes: ['back_cam', 'back_cam_cover'], move: [-0.038, -0.01, 0], view: { y: HALF_PI - 0.35, x: 0.1 } },
  retro:    { nodes: ['back_cover', 'magnets', 'wireless_charge'], move: [-0.075, -0.024, 0], view: { y: HALF_PI - 0.3, x: 0.1 } },
  // la scocca (telaio + tasti) non ha un nome nel modello: la riconosco dal materiale
  scocca:   { materials: ['mat_color_housing', 'mat_color_plastic'], move: [0, 0, 0], view: { y: -0.95, x: 0.2 } },
};
// Colori realistici (bianco / argento): il verde ALBA sta nella luce e nell'interfaccia.
const COLORS = {
  mat_color_housing: [0.62, 0.63, 0.64],
  mat_color_plastic: [0.56, 0.57, 0.58],
  mat_color_body: [0.86, 0.87, 0.86],
};
// pezzo -> voce del listino (stessi nomi del preventivatore)
const PRICE_KEY = { display: 'displayRigenerato', batteria: 'batteria', camera: 'camera', ricarica: 'ricarica' };
const PROBLEM = { display: 'display', batteria: 'battery', camera: 'camera', ricarica: 'charge', scheda: 'other', retro: 'other', scocca: 'other' };

// --- un solo download del modello, usato sia dalla hero sia dalla sezione
let modelP = null;
const progressCbs = [];
function loadModel(onProgress) {
  if (onProgress) progressCbs.push(onProgress);
  if (!modelP) {
    modelP = new Promise((resolve, reject) => {
      const l = new GLTFLoader();
      l.setMeshoptDecoder(MeshoptDecoder);
      l.load('assets/3d/telefono-alba.glb', resolve, (ev) => progressCbs.forEach((f) => f(ev)), reject);
    });
  }
  return modelP.then((gltf) => {
    const model = gltf.scene.clone(true);
    if (gltf.animations[0]) { // posa di partenza: telefono montato
      const mixer = new THREE.AnimationMixer(model);
      const a = mixer.clipAction(gltf.animations[0]); a.play(); a.time = 0; mixer.update(0); mixer.stopAllAction();
    }
    model.traverse((m) => {
      if (!m.isMesh) return;
      m.material = m.material.clone();
      if (COLORS[m.material.name]) m.material.color.setRGB(...COLORS[m.material.name]);
    });
    model.updateMatrixWorld(true);
    return model;
  });
}

function makeRenderer(container, narrow) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.6 : 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  container.appendChild(r.domElement);
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xb7ff5a, 3.0); rim.position.set(-4, 2, -4); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0x25a84e, 2.0); rim2.position.set(4, -2, -3); scene.add(rim2);
  scene.add(new THREE.HemisphereLight(0xeaffea, 0x07100b, 0.5));
  return { renderer: r, scene };
}

// --- HERO: telefono che gira da solo e ogni tanto si apre. Si può girare col dito; un tocco porta alla sezione.
const heroEl = document.querySelector('[data-x3d-hero]');
if (heroEl && webglOk()) initHero(heroEl);

function initHero(el) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 860px)').matches;
  const go = () => {
    const { renderer, scene } = makeRenderer(el, narrow);
    const camera = new THREE.PerspectiveCamera(26, 1, 0.001, 10);
    const pivot = new THREE.Group(); scene.add(pivot);
    let moving = [], radius = 0.1, W = 0, H = 0;
    loadModel().then((model) => {
      pivot.add(model);
      for (const cfg of Object.values(PARTS)) {
        for (const name of cfg.nodes || []) {
          const obj = model.getObjectByName(name);
          if (!obj) continue;
          const wp = obj.getWorldPosition(new THREE.Vector3());
          const a = obj.parent.worldToLocal(wp.clone());
          const b = obj.parent.worldToLocal(wp.clone().add(new THREE.Vector3(...cfg.move)));
          moving.push({ obj, from: obj.position.clone(), delta: b.sub(a) });
        }
      }
      setOpen(0.75); model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model, true);
      radius = box.getSize(new THREE.Vector3()).length() / 2;
      model.position.copy(box.getCenter(new THREE.Vector3())).negate();
      setOpen(0);
      resize();
      el.classList.add('is-ready');
    }).catch(() => {});
    function setOpen(k) { for (const m of moving) m.obj.position.copy(m.from).addScaledVector(m.delta, k); }
    function resize() {
      W = el.clientWidth; H = el.clientHeight;
      if (!W || !H) return;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const dist = Math.max(radius / t, radius / (t * camera.aspect)) * 0.86;
      camera.position.set(0, 0, dist); camera.near = dist / 60; camera.far = dist * 8;
      camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(el);

    // gira col dito (in orizzontale), tocco = vai a «Che cosa si è rotto?»
    let rotY = -0.6, vel = 0, down = null, lastInput = -1e9;
    const c = renderer.domElement;
    c.addEventListener('pointerdown', (e) => { down = { x: e.clientX, px: e.clientX, moved: 0 }; vel = 0; });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      down.moved = Math.max(down.moved, Math.abs(e.clientX - down.x));
      const step = (e.clientX - down.px) / Math.max(300, c.clientWidth) * 4; down.px = e.clientX;
      rotY += step; vel = step; lastInput = performance.now();
    });
    window.addEventListener('pointerup', (e) => {
      if (!down) return; const tap = down.moved < 8; down = null;
      if (tap && e.target === c) { const s = document.getElementById('dentro-il-telefono'); if (s) s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
    window.addEventListener('pointercancel', () => { down = null; });

    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(el);
    let open = 0, prev = performance.now(), t0 = performance.now();
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || !moving.length || !W) { prev = now; return; }
      if (FAST && now - prev < 600) return;
      const dt = FAST ? 0.6 : Math.min(0.05, (now - prev) / 1000); prev = now;
      // ciclo: chiuso 2,5 s → si apre → aperto 3,5 s → si chiude
      const cyc = ((now - t0) / 1000) % 9;
      const want = reduce ? 0.6 : (cyc > 2.5 && cyc < 7 ? 0.75 : 0);
      open += (want - open) * Math.min(1, dt * (FAST ? 10 : 2.6));
      if (!down) {
        rotY += vel; vel *= 0.92;
        if (!reduce && now - lastInput > 2500) rotY += dt * 0.35; // giro completo da solo, lento
      }
      pivot.rotation.set(0.12, rotY, 0);
      setOpen(open);
      renderer.render(scene, camera);
    })(performance.now());
  };
  // non rallentare l'apertura della pagina: parte quando il resto è caricato
  if (document.readyState === 'complete') setTimeout(go, 50);
  else window.addEventListener('load', () => setTimeout(go, 50), { once: true });
}

// ?x3dtest=1 salta le transizioni (solo per le prove automatiche)
const FAST = /x3dtest/.test(location.search);
const section = document.querySelector('[data-x3d]');
if (section) init(section);

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function minPrice(key) {
  const all = window.albaIphonePrices;
  if (!all || !key) return null;
  let best = null;
  for (const row of Object.values(all)) {
    const v = row && Number(row[key]);
    if (Number.isFinite(v) && v > 0 && (best === null || v < best)) best = v;
  }
  return best;
}

function init(section) {
  const wrap = section.querySelector('.x3d-wrap');
  const stage = section.querySelector('.x3d-stage');
  const status = section.querySelector('.x3d-status');
  const hint = section.querySelector('.x3d-hint');
  const head = section.querySelector('.x3d-head');
  const chipsBox = section.querySelector('.x3d-chips');
  const chips = [...section.querySelectorAll('[data-part]')];
  const sheet = section.querySelector('.x3d-sheet');
  const cards = [...section.querySelectorAll('[data-card]')];
  const priceEl = section.querySelector('.x3d-price');
  const closeBtn = section.querySelector('.x3d-close');
  const goBtn = section.querySelector('.x3d-go');
  const toggle = section.querySelector('.x3d-toggle');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 860px)');

  // --- scelta del pezzo (funziona anche prima che il 3D sia caricato)
  const state = { selected: null, onSelect: null };
  function select(part) {
    state.selected = part && part !== state.selected ? part : null;
    const p = state.selected;
    chips.forEach((c) => c.setAttribute('aria-pressed', c.dataset.part === p ? 'true' : 'false'));
    cards.forEach((c) => { c.hidden = c.dataset.card !== p; });
    section.classList.toggle('x3d-focus', !!p);
    sheet.hidden = !p;
    if (p) {
      const price = minPrice(PRICE_KEY[p]);
      priceEl.innerHTML = price
        ? 'A partire da <strong>' + price + ' €</strong> · il prezzo esatto dipende dal modello'
        : 'Prezzo dopo una verifica gratuita in negozio';
      // il 3D deve essere tutto a schermo
      const r = wrap.getBoundingClientRect();
      if (r.top < -10 || r.bottom > window.innerHeight + 10) wrap.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      if (typeof window.albaTrack === 'function') window.albaTrack('x3d_part_selected', { part: p });
    }
    if (state.onSelect) state.onSelect();
  }
  chips.forEach((c) => c.addEventListener('click', () => select(c.dataset.part)));
  closeBtn.addEventListener('click', () => { const p = state.selected; select(null); const c = chips.find((x) => x.dataset.part === p); if (c) c.focus({ preventScroll: true }); });
  section.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.selected) select(null); });
  // passa al preventivatore con il problema già scelto
  goBtn.addEventListener('click', () => {
    window.albaPendingProblem = PROBLEM[state.selected] || null;
    const target = document.getElementById('comparatore');
    if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  if (!webglOk()) { section.classList.add('x3d-off'); return; }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: '600px 0px' });
  io.observe(section);

  function start() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow.matches ? 1.6 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xb7ff5a, 3.0); rim.position.set(-4, 2, -4); scene.add(rim);
    const rim2 = new THREE.DirectionalLight(0x25a84e, 2.0); rim2.position.set(4, -2, -3); scene.add(rim2);
    scene.add(new THREE.HemisphereLight(0xeaffea, 0x07100b, 0.5));

    const camera = new THREE.PerspectiveCamera(28, 1, 0.001, 10);
    const pivot = new THREE.Group(); scene.add(pivot);

    const moving = [];          // { obj, from, delta, part }
    const partObjs = {};        // pezzo -> [Object3D]
    const allMats = [];         // { mat, part, opacity, transparent, depthWrite, e0 }
    let overviewR = 0.1;
    let open = 0, openTarget = 0, focus = 0;

    const BASE = { y: -0.78, x: 0.14 };
    let rotY = BASE.y, rotX = BASE.x, velY = 0, touched = false, lastInput = 0, userTurned = false;

    loadModel((ev) => {
      if (ev.total) status.textContent = 'Carico il telefono 3D… ' + Math.round(ev.loaded / ev.total * 100) + '%';
    }).then((model) => {
      pivot.add(model);
      model.updateMatrixWorld(true);

      for (const [part, cfg] of Object.entries(PARTS)) {
        partObjs[part] = [];
        for (const name of cfg.nodes || []) {
          const obj = model.getObjectByName(name);
          if (!obj) continue;
          const wp = obj.getWorldPosition(new THREE.Vector3());
          const a = obj.parent.worldToLocal(wp.clone());
          const b = obj.parent.worldToLocal(wp.clone().add(new THREE.Vector3(...cfg.move)));
          moving.push({ obj, from: obj.position.clone(), delta: b.sub(a), part });
          partObjs[part].push(obj);
          obj.traverse((m) => { if (m.isMesh) m.userData.part = part; });
        }
      }
      for (const [part, cfg] of Object.entries(PARTS)) {
        if (!cfg.materials) continue;
        model.traverse((m) => {
          if (m.isMesh && !m.userData.part && cfg.materials.includes(m.material.name)) { m.userData.part = part; partObjs[part].push(m); }
        });
      }
      // ogni pezzo ha i suoi materiali, così posso sfumare gli altri
      model.traverse((m) => {
        if (!m.isMesh) return;
        const mat = m.material;
        allMats.push({ mat, part: m.userData.part || null, opacity: mat.opacity, transparent: mat.transparent, depthWrite: mat.depthWrite, e0: mat.emissive ? mat.emissive.clone() : null });
      });

      applyOpen(1, null, 0); model.updateMatrixWorld(true);
      const ob = new THREE.Box3().setFromObject(model, true);
      overviewR = ob.getSize(new THREE.Vector3()).length() / 2;
      model.position.copy(ob.getCenter(new THREE.Vector3())).negate();
      applyOpen(0, null, 0);

      resize();
      section.classList.add('x3d-ready');
      status.textContent = '';
      const seen = new IntersectionObserver((e) => {
        if (e[0].isIntersecting) { seen.disconnect(); setTimeout(() => setOpen(1), reduce || state.selected ? 0 : 700); }
      }, { threshold: 0.4 });
      seen.observe(stage);
    }).catch(() => section.classList.add('x3d-off'));

    function applyOpen(k, sel, f) {
      for (const m of moving) {
        const extra = m.part === sel ? 1 + 0.7 * f : 1;
        m.obj.position.copy(m.from).addScaledVector(m.delta, k * extra);
      }
    }

    function setOpen(v) {
      openTarget = v;
      if (toggle) { toggle.textContent = v ? 'Chiudi il telefono' : 'Apri il telefono'; toggle.setAttribute('aria-pressed', v ? 'true' : 'false'); }
    }
    if (toggle) toggle.addEventListener('click', () => { if (state.selected) select(null); setOpen(openTarget ? 0 : 1); });

    state.onSelect = () => {
      if (state.selected) setOpen(1);
      lastInput = 0; // gira subito verso il lato giusto
      velY = 0;
    };

    // --- dimensioni e "zona libera" (la parte del 3D non coperta da testi, pulsanti o scheda)
    let W = 1, H = 1;
    function resize() {
      W = stage.clientWidth; H = stage.clientHeight;
      if (!W || !H) return;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
    }
    new ResizeObserver(resize).observe(stage);

    function freeBox() {
      const s = stage.getBoundingClientRect();
      let x0 = 0, y0 = 0, x1 = W, y1 = H;
      if (narrow.matches) {
        const hb = head.getBoundingClientRect();
        y0 = Math.max(0, hb.bottom - s.top + 6);
        const low = (state.selected ? sheet : chipsBox).getBoundingClientRect();
        if (low.height) y1 = Math.min(H, low.top - s.top - 6);
      } else {
        const col = section.querySelector('.x3d-col').getBoundingClientRect();
        x0 = Math.max(0, col.right - s.left + 24);
        y0 = 70; y1 = H - 30;
      }
      if (y1 - y0 < H * 0.25) y1 = y0 + H * 0.25;
      return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: Math.max(80, x1 - x0), h: Math.max(80, y1 - y0) };
    }

    // --- gira col dito o col mouse (in orizzontale; in verticale la pagina scorre come sempre)
    const el = renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, moved: 0, mouse: e.pointerType === 'mouse' };
      velY = 0;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      down.moved = Math.max(down.moved, Math.abs(dx), Math.abs(e.clientY - down.y));
      const step = (e.clientX - down.px) / Math.max(320, el.clientWidth * 0.6) * 3.4;
      down.px = e.clientX;
      rotY += step; velY = step;
      if (down.mouse) { rotX = Math.max(-1.2, Math.min(1.2, rotX + (e.clientY - down.py) / 300)); }
      down.py = e.clientY;
      if (down.moved > 8) userTurned = true;
      if (Math.abs(dx) > 6 && !touched) { touched = true; if (hint) hint.classList.add('is-gone'); }
      lastInput = performance.now();
    });
    window.addEventListener('pointerup', (e) => {
      if (!down) return;
      const tap = down.moved < 8;
      down = null;
      if (tap && e.target === el) pick(e);
    });
    window.addEventListener('pointercancel', () => { down = null; });

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function pick(e) {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(pivot.children, true).filter((h) => h.object.userData.part);
      // con un pezzo in primo piano, gli altri (sfumati) non si toccano per sbaglio
      const hit = state.selected ? hits.find((h) => h.object.userData.part === state.selected) : hits[0];
      if (hit) { if (hit.object.userData.part !== state.selected) select(hit.object.userData.part); }
      else if (state.selected) select(null);
    }

    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(section);

    const glowColor = new THREE.Color(0x25a84e), tmpC = new THREE.Color();
    const box = new THREE.Box3(), partC = new THREE.Vector3(), partS = new THREE.Vector3();
    const target = new THREE.Vector3(), camTarget = new THREE.Vector3();
    let camR = 0, lastSel = null;
    const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    let prev = performance.now();

    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || !moving.length || !W) { prev = now; return; }
      if (FAST && now - prev < 600) return; // prove automatiche: pochi fotogrammi
      const dt = FAST ? 10 : Math.min(0.05, (now - prev) / 1000); prev = now;
      if (state.selected) lastSel = state.selected;
      const sel = state.selected || lastSel; // durante l'uscita dal primo piano tengo l'ultimo pezzo

      open += (openTarget - open) * Math.min(1, dt * 3.2);
      focus += ((state.selected ? 1 : 0) - focus) * Math.min(1, dt * 4.5);
      if (!state.selected && focus < 0.01) lastSel = null;

      // rotazione: lato del pezzo scelto, oppure dondolio lento se nessuno lo tocca
      if (!down) {
        rotY += velY; velY *= 0.92;
        const idle = now - lastInput > (state.selected ? 2500 : 3500);
        if (reduce && state.selected) {
          rotY = PARTS[state.selected].view.y; rotX = PARTS[state.selected].view.x;
        } else if (!reduce && idle) {
          const v = state.selected ? PARTS[state.selected].view : null;
          if (!v && userTurned) { /* l'ha girato il cliente: resta dove l'ha lasciato (360°) */ }
          else {
          const vv = v || { y: BASE.y + Math.sin(now / 2600) * 0.3, x: BASE.x };
          const k = Math.min(1, dt * (state.selected ? 4 : 0.8));
          rotY += wrapAngle(vv.y - rotY) * k;
          rotX += (vv.x - rotX) * k;
          }
        }
      }
      pivot.rotation.set(rotX, rotY, 0);
      applyOpen(open, sel, focus);
      pivot.updateMatrixWorld(true);

      // dove guardare: telefono intero, oppure il pezzo in primo piano
      target.set(0, 0, 0);
      let r = overviewR;
      if (sel && focus > 0.001) {
        box.makeEmpty();
        for (const o of partObjs[sel]) box.expandByObject(o);
        box.getCenter(partC); box.getSize(partS);
        const pr = Math.max(partS.length() / 2, overviewR * 0.16) * 1.6;
        target.lerp(partC, focus);
        r = overviewR + (pr - overviewR) * focus;
      }
      const sm = Math.min(1, dt * 8);
      if (!camR) { camR = r; camTarget.copy(target); }
      camR += (r - camR) * sm; camTarget.lerp(target, sm);

      // inquadratura dentro la zona libera
      const fb = freeBox();
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const distV = camR / t * (H / fb.h);
      const distH = camR / (t * camera.aspect) * (W / fb.w);
      const dist = Math.max(distV, distH) * (0.8 + 0.22 * focus);
      camera.position.set(camTarget.x, camTarget.y, camTarget.z + dist);
      camera.near = dist / 60; camera.far = dist * 8;
      camera.lookAt(camTarget);
      camera.setViewOffset(W, H, W / 2 - fb.cx, H / 2 - fb.cy, W, H);

      // gli altri pezzi sfumano, quello scelto si illumina
      const pulse = 0.22 + Math.sin(now / 380) * 0.06;
      for (const m of allMats) {
        const mine = sel && m.part === sel;
        const fade = sel && !mine ? focus : 0;
        if (fade > 0.01) {
          if (!m.mat.transparent) { m.mat.transparent = true; m.mat.needsUpdate = true; }
          m.mat.depthWrite = false;
          m.mat.opacity = m.opacity * (1 - fade * 0.93);
        } else if (m.mat.opacity !== m.opacity || m.mat.transparent !== m.transparent) {
          if (m.mat.transparent !== m.transparent) { m.mat.transparent = m.transparent; m.mat.needsUpdate = true; }
          m.mat.depthWrite = m.depthWrite; m.mat.opacity = m.opacity;
        }
        if (m.e0) m.mat.emissive.copy(m.e0).add(tmpC.copy(glowColor).multiplyScalar(mine ? pulse * focus : 0));
      }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);
  }
}
