import * as T from "./vendor/three/three.module.min.js";
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
function filmSurface(top = true) {
  const g = new T.PlaneGeometry(2.56, 2.95, 24, 24),
    p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getY(i),
      edge = Math.max(Math.abs(x) / 1.28, Math.abs(z) / 1.475),
      bulge = Math.pow(Math.max(0, 1 - edge * edge), 0.55);
    const crease =
      (Math.sin(x * 24 + z * 14) * 0.012 + Math.sin(z * 42 - x * 13) * 0.007) *
      Math.pow(edge, 2);
    p.setXYZ(
      i,
      x,
      (top ? 0.2 : -0.14) + (top ? 0.12 : -0.025) * bulge + crease,
      z,
    );
  }
  g.computeVertexNormals();
  return g;
}
function ribbonStrip(points, width, twist = 0) {
  const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
    positions = [],
    uv = [],
    indices = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48,
      point = curve.getPoint(t),
      tangent = curve.getTangent(t).normalize(),
      side = new T.Vector3(0, 0, 1).cross(tangent).normalize();
    side.applyAxisAngle(tangent, Math.sin(t * Math.PI) * twist);
    for (const sign of [-1, 1]) {
      const q = point.clone().addScaledVector(side, (sign * width) / 2);
      positions.push(q.x, q.y, q.z);
      uv.push(sign < 0 ? 0 : 1, t);
    }
    if (i < 48) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
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

export function createPackagingScene(mount, artwork, onContextLost, brandLogo) {
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
  const bagHeroMat = mat(
    new T.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.035,
      transparent: true,
      opacity: 0.12,
      specularIntensity: 1.8,
      side: T.DoubleSide,
      depthWrite: false,
      clearcoat: 1,
      clearcoatRoughness: 0.025,
    }),
  );
  const bagMat = mat(
    new T.MeshPhysicalMaterial({
      color: "#fffaff",
      roughness: 0.15,
      transparent: true,
      opacity: 0.09,
      side: T.DoubleSide,
      depthWrite: false,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  );
  const seamMat = mat(
    new T.MeshStandardMaterial({
      color: "#b1a8be",
      transparent: true,
      opacity: 0.38,
      roughness: 0.25,
      depthWrite: false,
    }),
  );
  const bodyGeo = geom(squareCookie(1.1, 0.24, 0.025)),
    icingGeo = geom(squareCookie(1.045, 0.067, 0.012)),
    printGeo = geom(squarePrint(1.012)),
    topBagGeo = geom(filmSurface()),
    bottomBagGeo = geom(filmSurface(false)),
    seamGeo = geom(new T.BoxGeometry(2.53, 0.008, 0.035));
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
    const bag = new T.Group();
    bag.add(new T.Mesh(topBagGeo, i === HERO_COOKIE ? bagHeroMat : bagMat));
    bag.add(new T.Mesh(bottomBagGeo, bagMat));
    for (const z of [-1.44, 1.44]) {
      const seam = new T.Mesh(seamGeo, seamMat);
      seam.position.set(0, 0.08, z);
      bag.add(seam);
    }
    for (const x of [-1.265, 1.265]) {
      const seam = new T.Mesh(seamGeo, seamMat);
      seam.rotation.y = Math.PI / 2;
      seam.scale.x = 1.15;
      seam.position.set(x, 0.07, 0);
      bag.add(seam);
    }
    group.add(bag);
    root.add(group);
    cookies.push({ group, bag });
  }
  const paperMat = mat(
      new T.MeshStandardMaterial({
        color: "#faf6ee",
        roughness: 0.92,
        bumpMap: bump,
        bumpScale: 0.005,
      }),
    ),
    innerMat = mat(
      new T.MeshStandardMaterial({ color: "#fffaf1", roughness: 1 }),
    );
  const ribbonMat = mat(
    new T.MeshPhysicalMaterial({
      color: "#ec268f",
      roughness: 0.34,
      metalness: 0.08,
      sheen: 0.7,
      sheenColor: "#f988bc",
      side: T.DoubleSide,
    }),
  );
  const box = new T.Group();
  root.add(box);
  const block = (parent, size, pos, material) => {
    const mesh = new T.Mesh(geom(new T.BoxGeometry(...size)), material);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  block(box, [10.8, 0.13, 8.4], [0, 0, 0], paperMat);
  block(box, [10.5, 0.035, 8.1], [0, 0.085, 0], innerMat);
  block(box, [10.8, 0.62, 0.14], [0, 0.3, -4.13], paperMat);
  block(box, [10.8, 0.62, 0.14], [0, 0.3, 4.13], paperMat);
  block(box, [0.14, 0.62, 8.15], [-5.33, 0.3, 0], paperMat);
  block(box, [0.14, 0.62, 8.15], [5.33, 0.3, 0], paperMat);
  // The shallow white window box follows the existing twelve-cookie packaging photo.
  const lid = new T.Group();
  box.add(lid);
  block(lid, [10.96, 0.13, 0.52], [0, 0, -4.04], paperMat);
  block(lid, [10.96, 0.13, 0.52], [0, 0, 4.04], paperMat);
  block(lid, [0.52, 0.13, 7.58], [-5.22, 0, 0], paperMat);
  block(lid, [0.52, 0.13, 7.58], [5.22, 0, 0], paperMat);
  const windowMat = mat(
    new T.MeshPhysicalMaterial({
      color: "#fff",
      roughness: 0.025,
      transparent: true,
      opacity: 0.075,
      clearcoat: 1,
      side: T.DoubleSide,
      depthWrite: false,
    }),
  );
  const windowMesh = new T.Mesh(geom(new T.PlaneGeometry(10, 7.65)), windowMat);
  windowMesh.rotation.x = -Math.PI / 2;
  windowMesh.position.y = 0.015;
  lid.add(windowMesh);
  const gift = new T.Group();
  lid.add(gift);
  block(gift, [10.95, 0.023, 0.26], [0, 0.11, -0.85], ribbonMat);
  block(gift, [0.26, 0.023, 8.6], [-2.7, 0.113, 0], ribbonMat);
  const bow = new T.Group();
  bow.position.set(-2.7, 0.13, -0.85);
  gift.add(bow);
  for (const sign of [-1, 1]) {
    const ribbon = new T.Mesh(
      geom(
        ribbonStrip(
          [
            [0, 0.02, 0],
            [sign * 0.58, 0.2, -0.18],
            [sign * 0.95, 0.6, -0.05],
            [sign * 0.67, 0.74, 0.16],
            [sign * 0.22, 0.24, 0.11],
            [0, 0.05, 0],
          ],
          0.26,
          0.9,
        ),
      ),
      ribbonMat,
    );
    ribbon.castShadow = true;
    bow.add(ribbon);
    const tail = new T.Mesh(
      geom(
        ribbonStrip(
          [
            [0, 0.02, 0],
            [sign * 0.18, 0.12, 0.27],
            [sign * 0.34, 0.045, 0.75],
            [sign * 0.5, 0.01, 1.25],
          ],
          0.23,
          0.4,
        ),
      ),
      ribbonMat,
    );
    bow.add(tail);
  }
  block(bow, [0.38, 0.23, 0.35], [0, 0.12, 0.02], ribbonMat);
  const sticker = new T.Mesh(
    geom(new T.CircleGeometry(0.43, 48)),
    mat(new T.MeshStandardMaterial({ map: label, roughness: 0.65 })),
  );
  sticker.rotation.x = -Math.PI / 2;
  sticker.position.set(3.1, 0.11, 2.65);
  gift.add(sticker);
  const sideBands = new T.Group();
  box.add(sideBands);
  for (const x of [-5.415, 5.415])
    block(sideBands, [0.014, 0.7, 0.26], [x, 0.35, -0.85], ribbonMat);
  for (const z of [-4.215, 4.215])
    block(sideBands, [0.26, 0.7, 0.014], [-2.7, 0.35, z], ribbonMat);
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
    box.visible = frame.box > 0;
    box.position.y = -(1 - frame.box) * 1.2;
    box.scale.setScalar(0.94 + frame.box * 0.06);
    lid.visible = frame.lid > 0;
    lid.position.set(0, 0.71 + (1 - frame.lid) * 4.8, -(1 - frame.lid) * 0.5);
    lid.rotation.x = -(1 - frame.lid) * 0.22;
    gift.visible = frame.lid > 0.55;
    sideBands.visible = frame.lid > 0.92;
    frame.cookies.forEach((state, i) => {
      const { group, bag } = cookies[i];
      group.visible = state.visible;
      group.position.set(...state.position);
      group.rotation.set(...state.rotation);
      bag.visible = i !== HERO_COOKIE || frame.wrapper > 0;
      bag.position.z = i === HERO_COOKIE ? -(1 - frame.wrapper) * 3.45 : 0;
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
