// Telefono 3D verde ALBA Ripara: si apre in pochi pezzi, si gira col dito, si tocca un pezzo per saperne di più.
// Modello: "iPhone 12 Teardown" di Peter_D (Sketchfab), CC BY 4.0, colori e animazione modificati.
import * as THREE from './lib/three.module.min.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { RoomEnvironment } from './lib/RoomEnvironment.js';
import { MeshoptDecoder } from './lib/meshopt_decoder.module.js';

// Pezzi mostrati. "off" = quanto si allontanano (metri) verso il davanti; negativo = verso il retro.
const PARTS = {
  display:  { nodes: ['front_panel'], off: 0.085 },
  batteria: { nodes: ['battery'], off: 0.046 },
  scheda:   { nodes: ['motherboard', 'motherboard_cover', 'motherboard_cables_cover'], off: 0.050 },
  camera:   { nodes: ['back_cam', 'back_cam_cover'], off: -0.030 },
  retro:    { nodes: ['back_cover', 'magnets', 'wireless_charge'], off: -0.050 },
};

const section = document.querySelector('[data-x3d]');
if (section) init(section);

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function init(section) {
  const stage = section.querySelector('.x3d-stage');
  const status = section.querySelector('.x3d-status');
  const hint = section.querySelector('.x3d-hint');
  const chips = [...section.querySelectorAll('[data-part]')];
  const cards = [...section.querySelectorAll('[data-card]')];
  const toggle = section.querySelector('.x3d-toggle');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scelta del pezzo: funziona subito, anche prima che il 3D sia caricato
  const state = { selected: null, onSelect: null };
  function select(part) {
    state.selected = part && part !== state.selected ? part : null;
    chips.forEach((c) => c.setAttribute('aria-pressed', c.dataset.part === state.selected ? 'true' : 'false'));
    cards.forEach((c) => { c.hidden = c.dataset.card !== (state.selected || 'intro'); });
    if (state.onSelect) state.onSelect();
  }
  chips.forEach((c) => c.addEventListener('click', () => select(c.dataset.part)));

  if (!webglOk()) { section.classList.add('x3d-off'); return; }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: '600px 0px' });
  io.observe(section);

  function start() {
    const mobile = window.matchMedia('(max-width: 860px)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xb7ff5a, 2.4); rim.position.set(-4, 2, -4); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xeaffea, 0x07100b, 0.6));

    const camera = new THREE.PerspectiveCamera(30, 1, 0.001, 10);
    const pivot = new THREE.Group(); scene.add(pivot);

    const moving = [];           // { obj, from, delta, part }
    const partMeshes = {};       // pezzo -> [mesh]
    let radius = 0.1;
    let open = 0, openTarget = 0; // 0 chiuso, 1 aperto
    let glow = 0;

    const BASE_Y = -1.0, BASE_X = 0.16;
    let rotY = BASE_Y, velY = 0, touched = false, lastInput = 0;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('assets/3d/telefono-alba.glb', (gltf) => {
      const model = gltf.scene;
      pivot.add(model);
      // posa di partenza: telefono montato
      if (gltf.animations[0]) {
        const mixer = new THREE.AnimationMixer(model);
        const a = mixer.clipAction(gltf.animations[0]); a.play(); a.time = 0; mixer.update(0); mixer.stopAllAction();
      }
      model.updateMatrixWorld(true);

      // il davanti del telefono è l'asse più sottile (+X in questo modello)
      for (const [part, cfg] of Object.entries(PARTS)) {
        partMeshes[part] = [];
        for (const name of cfg.nodes) {
          const obj = model.getObjectByName(name);
          if (!obj) continue;
          const wp = obj.getWorldPosition(new THREE.Vector3());
          const a = obj.parent.worldToLocal(wp.clone());
          const b = obj.parent.worldToLocal(wp.clone().add(new THREE.Vector3(cfg.off, 0, 0)));
          moving.push({ obj, from: obj.position.clone(), delta: b.sub(a), part });
          obj.traverse((m) => {
            if (!m.isMesh) return;
            m.material = m.material.clone(); // così si illumina solo questo pezzo
            m.userData.part = part;
            m.userData.e0 = m.material.emissive ? m.material.emissive.clone() : null;
            partMeshes[part].push(m);
          });
        }
      }

      // inquadratura sul telefono aperto (con margine per il pezzo selezionato)
      const keep = state.selected; state.selected = 'display'; applyOpen(1); state.selected = keep;
      model.updateMatrixWorld(true);
      const ob = new THREE.Box3().setFromObject(model, true);
      radius = ob.getSize(new THREE.Vector3()).length() / 2;
      model.position.copy(ob.getCenter(new THREE.Vector3())).negate();
      applyOpen(0);

      frame();
      section.classList.add('x3d-ready');
      status.textContent = '';
      // si apre da solo quando lo vedi
      const seen = new IntersectionObserver((e) => {
        if (e[0].isIntersecting) { seen.disconnect(); setTimeout(() => setTarget(1), reduce || state.selected ? 0 : 700); }
      }, { threshold: 0.45 });
      seen.observe(stage);
    }, (ev) => {
      if (ev.total) status.textContent = 'Carico il telefono 3D… ' + Math.round(ev.loaded / ev.total * 100) + '%';
    }, () => section.classList.add('x3d-off'));

    function applyOpen(k) {
      for (const m of moving) {
        const extra = m.part === state.selected ? 1.3 : 1;
        m.obj.position.copy(m.from).addScaledVector(m.delta, k * extra);
      }
    }

    function setTarget(v) {
      openTarget = v;
      if (toggle) {
        toggle.textContent = v ? 'Richiudi' : 'Apri il telefono';
        toggle.setAttribute('aria-pressed', v ? 'true' : 'false');
      }
    }

    state.onSelect = () => {
      if (state.selected && openTarget < 1) setTarget(1);
      lastInput = performance.now();
    };

    function frame() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const dist = radius / Math.sin(fov / 2) / Math.min(1, camera.aspect) * (camera.aspect < 1 ? 0.95 : 0.95);
      camera.position.set(0, 0, dist);
      camera.near = dist / 50; camera.far = dist * 10;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(frame).observe(stage);

    // --- gira col dito o col mouse (in orizzontale). In verticale la pagina scorre come sempre.
    const el = renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, px: e.clientX, moved: 0 };
      velY = 0;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      down.moved = Math.max(down.moved, Math.abs(dx), Math.abs(e.clientY - down.y));
      const step = (e.clientX - down.px) / el.clientWidth * 4.2;
      down.px = e.clientX;
      rotY += step; velY = step;
      if (Math.abs(dx) > 6 && !touched) { touched = true; if (hint) hint.classList.add('is-gone'); }
      lastInput = performance.now();
    });
    window.addEventListener('pointerup', (e) => {
      if (!down) return;
      const tap = down.moved < 6;
      down = null;
      if (tap && e.target === el) pick(e);
    });
    window.addEventListener('pointercancel', () => { down = null; });

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function pick(e) {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pivot.children, true).find((h) => h.object.userData.part);
      if (hit) select(hit.object.userData.part);
      else if (openTarget < 1) setTarget(1);
    }

    if (toggle) toggle.addEventListener('click', () => {
      if (openTarget) { if (state.selected) select(null); setTarget(0); } else setTarget(1);
    });

    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(section);

    const glowColor = new THREE.Color(0x25a84e), tmpC = new THREE.Color();
    let prev = performance.now();
    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || !moving.length) { prev = now; return; }
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;

      open += (openTarget - open) * Math.min(1, dt * 3.2);
      if (!down) {
        rotY += velY; velY *= 0.92;
        // se nessuno lo tocca, dondola piano da solo
        if (!reduce && now - lastInput > 3500) {
          const idle = BASE_Y + Math.sin(now / 2600) * 0.32;
          rotY += (idle - rotY) * Math.min(1, dt * 0.8);
        }
      }
      pivot.rotation.set(BASE_X, rotY, 0);
      applyOpen(open);

      // il pezzo scelto si illumina di verde
      glow += ((state.selected ? 1 : 0) - glow) * Math.min(1, dt * 6);
      for (const [part, list] of Object.entries(partMeshes)) {
        const k = part === state.selected ? (0.35 + Math.sin(now / 300) * 0.1) * glow : 0;
        for (const m of list) if (m.userData.e0) m.material.emissive.copy(m.userData.e0).add(tmpC.copy(glowColor).multiplyScalar(k));
      }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);
  }
}
