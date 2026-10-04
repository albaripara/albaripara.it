// Telefono 3D che si smonta mentre scorri la pagina — ALBA Ripara
// Modello: "iPhone 12 Teardown" di Peter_D (Sketchfab), CC BY 4.0, colori modificati.
import * as THREE from './lib/three.module.min.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { RoomEnvironment } from './lib/RoomEnvironment.js';
import { MeshoptDecoder } from './lib/meshopt_decoder.module.js';

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
  const steps = [...section.querySelectorAll('.x3d-step')];
  const bar = section.querySelector('.x3d-progress span');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!webglOk()) { section.classList.add('x3d-off'); return; }

  // Carica il modello solo quando la sezione si avvicina
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: '800px 0px' });
  io.observe(section);

  function start() {
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // Luci: chiave bianca + controluce verde Alba
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xb7ff5a, 2.4); rim.position.set(-4, 2, -4); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xeaffea, 0x07100b, 0.6));

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    const pivot = new THREE.Group(); scene.add(pivot);

    let mixer = null, action = null, clip = null;
    let target = reduce ? 1 : 0, shown = target, needsRender = true;
    const T0 = 0, T1 = 38; // smontaggio completo, passo per passo (poi il modello si richiude)
    const SAMPLES = 40; let views = [];

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('assets/3d/telefono-alba.glb', (gltf) => {
      const model = gltf.scene;
      pivot.add(model);
      clip = gltf.animations[0];
      if (clip) {
        mixer = new THREE.AnimationMixer(model);
        action = mixer.clipAction(clip); action.play(); action.paused = true;
      }
      // Inquadratura: misuro il telefono in 40 momenti dello smontaggio e la camera lo segue
      const box = new THREE.Box3(), c = new THREE.Vector3(), sz = new THREE.Vector3();
      for (let i = 0; i <= SAMPLES; i++) {
        setTime(i / SAMPLES); model.position.set(0, 0, 0); model.updateMatrixWorld(true);
        box.setFromObject(model, true); box.getCenter(c); box.getSize(sz);
        views.push({ c: c.clone(), r: sz.length() / 2 });
      }
      // raggio che non diminuisce mai: il telefono non "salta" avanti e indietro
      for (let i = 1; i < views.length; i++) views[i].r = Math.max(views[i].r, views[i - 1].r);
      frame();
      setTime(shown);
      section.classList.add('x3d-ready');
      status.textContent = '';
      needsRender = true;
    }, (ev) => {
      if (ev.total) status.textContent = 'Carico il telefono 3D… ' + Math.round(ev.loaded / ev.total * 100) + '%';
    }, () => {
      section.classList.add('x3d-off');
    });

    function setTime(p) {
      if (!mixer) return;
      action.time = T0 + (T1 - T0) * p;
      mixer.update(0);
    }

    function viewAt(p) {
      const f = p * SAMPLES, i = Math.min(SAMPLES - 1, Math.floor(f)), k = f - i;
      const a = views[i], b = views[i + 1];
      return { c: a.c.clone().lerp(b.c, k), r: a.r + (b.r - a.r) * k };
    }

    function frame() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      needsRender = true;
    }

    function placeCamera(p) {
      if (!views.length) return;
      const v = viewAt(p), model = pivot.children[0];
      model.position.copy(v.c).negate();
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const dist = v.r / Math.sin(fov / 2) / Math.min(1, camera.aspect) * (camera.aspect < 1 ? 0.92 : 1.12);
      camera.near = dist / 50; camera.far = dist * 10;
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(frame).observe(stage);

    // Avanzamento in base allo scorrimento della sezione
    function readScroll() {
      if (reduce) return;
      const r = section.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? -r.top / run : 0;
      target = Math.min(1, Math.max(0, (p - 0.08) / 0.72));
    }
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);
    readScroll();

    // Disegna solo quando la sezione è a schermo
    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(section);

    const ease = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return;
      const before = shown;
      shown += (target - shown) * 0.16;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      const e = shown;
      if (shown !== before || needsRender) {
        setTime(e);
        placeCamera(e);
        // rotazione: di fronte → di tre quarti man mano che si apre
        pivot.rotation.y = -0.35 - e * 0.55;
        pivot.rotation.x = 0.12 + e * 0.25;
        if (bar) bar.style.transform = 'scaleX(' + shown.toFixed(3) + ')';
        const idx = Math.min(steps.length - 1, Math.floor(shown * steps.length * 0.999));
        steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        renderer.render(scene, camera);
        needsRender = false;
      }
    }
    requestAnimationFrame(loop);
  }
}
