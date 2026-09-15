import * as T from "./vendor/three/three.module.min.js";
import { createRealPackaging } from "./order-packaging-box.mjs";
import { createSleeveFactory } from "./order-packaging-sleeve.mjs";
import { filmFrame, DURATION, HERO_COOKIE } from "./order-packaging-timeline.mjs";

function noiseTexture(color = false) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d"),
    pixels = ctx.createImageData(256, 256);
  let seed = 77331;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const n = seed / 4294967296;
    if (color) {
      pixels.data[i] = 192 + n * 44;
      pixels.data[i + 1] = 129 + n * 43;
      pixels.data[i + 2] = 62 + n * 38;
    } else
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 100 + n * 80;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  const texture = new T.CanvasTexture(c);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(3, 1);
  if (color) texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
function squareOutline(half, radius) {
  const s = new T.Shape();
  s.moveTo(-half + radius, -half);
  s.lineTo(half - radius, -half);
  s.quadraticCurveTo(half, -half, half, -half + radius);
  s.lineTo(half, half - radius);
  s.quadraticCurveTo(half, half, half - radius, half);
  s.lineTo(-half + radius, half);
  s.quadraticCurveTo(-half, half, -half, half - radius);
  s.lineTo(-half, -half + radius);
  s.quadraticCurveTo(-half, -half, -half + radius, -half);
  return s;
}
function squareCookie(half, height, bevel) {
  const g = new T.ExtrudeGeometry(squareOutline(half - bevel, half * 0.13), {
    depth: height - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 12,
  });
  g.translate(0, 0, -(height - bevel * 2) / 2);
  g.rotateX(-Math.PI / 2);
  return g;
}
function squarePrint(half) {
  const g = new T.ShapeGeometry(squareOutline(half, half * 0.13), 12);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, (p.getX(i) + half) / (half * 2), (p.getY(i) + half) / (half * 2));
  return g;
}
function labelTexture(brandLogo) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, 512, 512);
  if (brandLogo) ctx.drawImage(brandLogo, 144, 54, 224, 206);
  ctx.textAlign = "center";
  ctx.font = '400 51px "Fredoka One", Arial';
  ctx.fillStyle = "#EC268F";
  ctx.fillText("my", 167, 330);
  ctx.fillStyle = "#FFC532";
  ctx.fillText("baking", 289, 330);
  ctx.fillStyle = "#EC268F";
  ctx.font = '800 35px "Nunito", Arial';
  ctx.fillText("C R E A T I O N S", 256, 382);
  const texture = new T.CanvasTexture(c);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}

export function createPackagingScene(mount, artwork, onContextLost, brandLogo, qrImage) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "packaging-webgl";
  mount.append(renderer.domElement);
  const contextLost = (e) => {
    e.preventDefault();
    onContextLost?.();
  };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  const scene = new T.Scene();
  scene.background = new T.Color("#efe9dc");
  scene.fog = new T.Fog("#efe9dc", 35, 80);
  const camera = new T.PerspectiveCamera(34, 1, 0.1, 100);
  const textures = [],
    materials = [],
    geometries = [];
  const trackTexture = (x) => (textures.push(x), x),
    mat = (x) => (materials.push(x), x),
    geom = (x) => (geometries.push(x), x);
  const bump = trackTexture(noiseTexture()),
    crumb = trackTexture(noiseTexture(true)),
    label = trackTexture(labelTexture(brandLogo)),
    print = trackTexture(new T.CanvasTexture(artwork.hero || artwork));
  print.colorSpace = T.SRGBColorSpace;
  print.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const rowPrints = (artwork.rows || [artwork,artwork,artwork]).map(source => {
    const texture = trackTexture(new T.CanvasTexture(source));
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = print.anisotropy;
    return texture;
  });
  // Large studio softboxes produce broad reflections in the wrapper and lid.
  const room = new T.Scene();
  room.background = new T.Color("#dfd7ca");
  const roomGeo = new T.BoxGeometry(40, 30, 40),
    roomMat = new T.MeshBasicMaterial({ color: "#c7bca9", side: T.BackSide });
  room.add(new T.Mesh(roomGeo, roomMat));
  const lightPlanes = [];
  for (const [position, scale, intensity] of [
    [[0, 10, 0], [12, 1, 10], 4],
    [[-8, 5, 4], [1, 8, 5], 5],
    [[7, 4, -5], [1, 6, 8], 3],
  ]) {
    const g = new T.BoxGeometry(...scale),
      m = new T.MeshBasicMaterial({
        color: new T.Color(intensity, intensity, intensity),
      }),
      mesh = new T.Mesh(g, m);
    mesh.position.set(...position);
    room.add(mesh);
    lightPlanes.push([g, m]);
  }
  const pmrem = new T.PMREMGenerator(renderer),
    environment = pmrem.fromScene(room, 0.025);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.4;
  pmrem.dispose();
  roomGeo.dispose();
  roomMat.dispose();
  lightPlanes.forEach(([g, m]) => {
    g.dispose();
    m.dispose();
  });
  scene.add(new T.HemisphereLight("#fff8ef", "#706580", 0.95));
  const key = new T.DirectionalLight("#fff5e4", 2.3);
  key.position.set(-5, 11, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  key.shadow.normalBias = 0.035;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new T.DirectionalLight("#e5dfff", 0.8);
  fill.position.set(6, 5, -8);
  scene.add(fill);
  const floor = new T.Mesh(
    geom(new T.PlaneGeometry(160, 160)),
    mat(
      new T.MeshStandardMaterial({
        color: "#efe9dc",
        roughness: 1,
        metalness: 0,
      }),
    ),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.14;
  floor.receiveShadow = true;
  scene.add(floor);
  const root = new T.Group();
  scene.add(root);
  const biscuitMat = mat(
    new T.MeshStandardMaterial({
      map: crumb,
      bumpMap: bump,
      bumpScale: 0.024,
      roughness: 0.86,
      color: "#f7d39f",
    }),
  );
  const icingMat = mat(
    new T.MeshStandardMaterial({
      color: "#fffaf0",
      roughness: 0.58,
      bumpMap: bump,
      bumpScale: 0.006,
    }),
  );
  const printMat = mat(
    new T.MeshStandardMaterial({
      map: print,
      roughness: 0.62,
      bumpMap: bump,
      bumpScale: 0.002,
    }),
  );
  const rowMaterials = rowPrints.map(map => mat(new T.MeshStandardMaterial({
    map, roughness:.62, bumpMap:bump, bumpScale:.002,
  })));
  const bodyGeo = geom(squareCookie(1.1, 0.24, 0.025)),
    icingGeo = geom(squareCookie(1.045, 0.067, 0.012)),
    printGeo = geom(squarePrint(1.012));
  const createSleeve = createSleeveFactory({geom,mat});
  const cookies = [];
  for (let i = 0; i < 12; i++) {
    const group = new T.Group(),
      body = new T.Mesh(bodyGeo, biscuitMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    const icing = new T.Mesh(icingGeo, icingMat);
    icing.position.y = 0.137;
    icing.castShadow = true;
    group.add(icing);
    const face = new T.Mesh(printGeo, i === HERO_COOKIE ? printMat : rowMaterials[Math.floor(i/4)]);
    face.rotation.x = -Math.PI / 2;
    face.position.y = 0.172;
    face.receiveShadow = true;
    group.add(face);
    const sleeve = createSleeve(i === HERO_COOKIE), bag = sleeve.group;
    group.add(bag);
    root.add(group);
    cookies.push({ group, bag, sleeve });
  }
  const packaging = createRealPackaging({root,scene,geom,mat,trackTexture,bump,label,qrImage,artwork});
  let disposed = false,
    lastFrame = filmFrame(0);
  function resize() {
    if (disposed) return;
    const rect = mount.getBoundingClientRect();
    const w = Math.max(1, rect.width),
      h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(() => {
    resize();
    render(lastFrame.time);
  });
  observer.observe(mount);
  resize();
  function render(seconds) {
    if (disposed) return;
    const frame = filmFrame(seconds);
    lastFrame = frame;
    if (artwork.update?.(seconds)) print.needsUpdate = true;
    camera.position.set(...frame.camera);
    camera.lookAt(...frame.target);
    root.rotation.y = frame.rotation;
    root.position.y = Math.sin(frame.table * Math.PI) * .24;
    floor.position.y = -.14 - frame.table * 6;
    packaging.update(frame);
    frame.cookies.forEach((state, i) => {
      const { group, bag, sleeve } = cookies[i];
      sleeve.update(frame,state.packed);
      group.visible = state.visible;
      group.position.set(...state.position);
      group.rotation.set(...state.rotation);
      bag.visible = i !== HERO_COOKIE || frame.wrapper > 0;
      bag.position.z = i === HERO_COOKIE ? (1 - frame.wrapper) * 3.45 : 0;
    });
    renderer.render(scene, camera);
    mount.dataset.phase = frame.phase;
    mount.dataset.time = seconds.toFixed(2);
    mount.dataset.cookieCount = "12";
    return frame;
  }
  render(0);
  return {
    duration: DURATION,
    render,
    get stats() {
      return {
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      scene.environment = null;
      environment.dispose();
      textures.forEach((x) => x.dispose());
      materials.forEach((x) => x.dispose());
      geometries.forEach((x) => x.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
