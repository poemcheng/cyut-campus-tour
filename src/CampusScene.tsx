import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { places, byId, categoryColor } from "./data";
import { nodes, edges, astar } from "./pathfinding";
export interface SceneAPI {
  reset: () => void;
  zoom: (direction: number) => void;
  focus: (id: string) => void;
}
interface Props {
  selected: string;
  filtered: string[];
  labels: boolean;
  route: string[];
  flat: boolean;
  playing: boolean;
  onSelect: (id: string) => void;
  onProgress: (index: number) => void;
  onEnd: () => void;
}
export const CampusScene = forwardRef<SceneAPI, Props>((props, ref) => {
  const host = useRef<HTMLDivElement>(null),
    api = useRef<SceneAPI | null>(null),
    current = useRef(props),
    labelEls = useRef(new Map<string, HTMLButtonElement>()),
    [error, setError] = useState(false);
  const sceneState = useRef<{
    scene: THREE.Scene;
    route: THREE.Group;
    meshes: Map<string, THREE.Group>;
  } | null>(null);
  current.current = props;
  useImperativeHandle(
    ref,
    () => ({
      reset: () => api.current?.reset(),
      zoom: (d) => api.current?.zoom(d),
      focus: (id) => api.current?.focus(id),
    }),
    [],
  );
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xe9eee2, 0);
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xe7ecdf, 1000, 1800);
    const camera = new THREE.PerspectiveCamera(37, 1, 1, 1600);
    camera.position.set(290, 280, 370);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 14);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.13;
    controls.minDistance = 80;
    controls.maxDistance = 1100;
    controls.maxTargetRadius = 350;
    const ambient = new THREE.HemisphereLight(0xfffff4, 0x79907b, 2.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff3dc, 3.1);
    sun.position.set(-150, 260, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -220,
      right: 220,
      top: 220,
      bottom: -220,
      near: 1,
      far: 800,
    });
    sun.shadow.bias = -0.001;
    scene.add(sun);
    const mat = (color: string | number) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.88 });
    const box = (
      w: number,
      h: number,
      d: number,
      color: string | number,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene,
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const ground = box(257, 7, 327, 0xc6d2b8, -3, -4, 26);
    const rim = box(260, 3, 330, 0xb1c0a5, -3, -9, 26);
    rim.castShadow = false;
    ground.receiveShadow = true;
    box(70, 0.4, 194, 0xa6bf91, -83, 0.05, -7);
    box(72, 0.4, 132, 0xc3d1a7, 23, 0.1, -18);
    // 校園外山林作為景觀意象，不代表真實地形。
    for (let i = 0; i < 7; i++) {
      const hill = new THREE.Mesh(
        new THREE.IcosahedronGeometry(42 + (i % 3) * 10, 1),
        mat(i % 2 ? 0xb9c9a8 : 0xc6d2b7),
      );
      hill.scale.set(1.45, 0.55, 1);
      hill.position.set(-150 + i * 49, -11, -180 - (i % 2) * 12);
      scene.add(hill);
    }
    function line(
      points: THREE.Vector3[],
      color: number,
      radius: number,
      parent: THREE.Object3D = scene,
    ) {
      if (points.length < 2) return;
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0);
      const m = new THREE.Mesh(
        new THREE.TubeGeometry(
          curve,
          Math.max(2, points.length * 4),
          radius,
          6,
          false,
        ),
        mat(color),
      );
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }
    for (const [a, b] of edges) {
      const p = nodes.find((n) => n.id === a)!,
        q = nodes.find((n) => n.id === b)!;
      line(
        [new THREE.Vector3(p.x, 0.35, p.z), new THREE.Vector3(q.x, 0.35, q.z)],
        0xe5e3d8,
        3.5,
      );
    }
    line(
      [
        new THREE.Vector3(-120, 0.3, -100),
        new THREE.Vector3(-120, 0.3, 65),
        new THREE.Vector3(-65, 0.3, 108),
        new THREE.Vector3(-38, 0.3, 110),
      ],
      0xd1d6cd,
      5,
    );
    const buildingGroups = new Map<string, THREE.Group>(),
      clickable: THREE.Mesh[] = [];
    places.forEach((p, index) => {
      const group = new THREE.Group();
      group.position.set(p.x, 0, p.z);
      scene.add(group);
      buildingGroups.set(p.id, group);
      if (p.parentId) {
        // 廳館位於既有大樓內，只建立標籤，不重複生成另一棟量體。
      } else if (p.id === "field") {
        const shape = new THREE.Shape();
        shape.absellipse(0, 0, 23, 54, 0, Math.PI * 2, false, 0);
        const track = new THREE.Mesh(
          new THREE.ShapeGeometry(shape),
          mat(0xc48b76),
        );
        track.rotation.x = -Math.PI / 2;
        track.position.y = 0.5;
        group.add(track);
        const innerShape = new THREE.Shape();
        innerShape.absellipse(0, 0, 16, 46, 0, Math.PI * 2, false, 0);
        const inner = new THREE.Mesh(
          new THREE.ShapeGeometry(innerShape),
          mat(0x8fae80),
        );
        inner.rotation.x = -Math.PI / 2;
        inner.position.y = 0.7;
        group.add(inner);
        for (let j = 0; j < 3; j++) {
          const pts = Array.from(
            { length: 97 },
            (_, k) =>
              new THREE.Vector3(
                (19 + j * 1.4) * Math.cos((k / 96) * Math.PI * 2),
                0.75,
                (49 + j * 1.4) * Math.sin((k / 96) * Math.PI * 2),
              ),
          );
          line(pts, 0xe2c2a8, 0.14, group);
        }
        box(21, 0.15, 47, 0xa1b98b, 0, 0.9, 0, group);
      } else if (p.id === "courts") {
        box(p.w, 0.6, p.d, 0x889c8b, 0, 0.5, 0, group);
        for (let j = 0; j < 3; j++) {
          const z = -19 + j * 19;
          line(
            [
              new THREE.Vector3(-9, 1, z - 8),
              new THREE.Vector3(9, 1, z - 8),
              new THREE.Vector3(9, 1, z + 8),
              new THREE.Vector3(-9, 1, z + 8),
              new THREE.Vector3(-9, 1, z - 8),
            ],
            0xe3e6d9,
            0.18,
            group,
          );
          line(
            [new THREE.Vector3(-9, 1, z), new THREE.Vector3(9, 1, z)],
            0xe3e6d9,
            0.16,
            group,
          );
        }
      } else if (p.id === "plaza") {
        box(p.w, 0.5, p.d, 0xc5a389, 0, 0.4, 0, group);
        for (let i = -12; i < 15; i += 4)
          line(
            [new THREE.Vector3(-14, 0.75, i), new THREE.Vector3(14, 0.75, i)],
            0xd7baa2,
            0.12,
            group,
          );
      } else if (p.id === "parking") {
        box(p.w, 0.5, p.d, 0xb8bfaf, 0, 0.4, 0, group);
        for (let j = -12; j < 16; j += 6) {
          line(
            [new THREE.Vector3(j, 0.8, -12), new THREE.Vector3(j, 0.8, -3)],
            0xf0efe2,
            0.23,
            group,
          );
          box(3, 1.7, 6, j % 2 ? 0xf3f0e1 : 0x899f96, j, 1.5, 8, group);
        }
      } else if (p.id === "gate") {
        box(2, 7, 3, 0xb7a98d, -12, 3.5, 0, group);
        box(2, 7, 3, 0xb7a98d, 12, 3.5, 0, group);
        box(26, 2, 4, 0x849688, 0, 7.5, 0, group);
      } else if (p.id === "bus") {
        box(15, 1, 7, 0x718d7b, 0, 6, 0, group);
        box(0.8, 6, 0.8, 0x7d8a7a, -6, 3, 0, group);
        box(0.8, 6, 0.8, 0x7d8a7a, 6, 3, 0, group);
        box(12, 1, 2, 0xb8a58d, 0, 2, 0, group);
      } else {
        const color =
          p.id === "library" ? "#ccb08b" : categoryColor[p.category];
        box(p.w, p.h, p.d, color, 0, p.h / 2, 0, group);
        box(p.w + 1.3, 1.2, p.d + 1.3, 0xede9d9, 0, p.h + 0.2, 0, group);
        box(p.w * 0.68, 1.5, p.d * 0.65, 0xc3c3b1, 0, p.h + 1.4, 0, group);
        if (p.id === "library") {
          const dome = new THREE.Mesh(
            new THREE.SphereGeometry(
              10,
              24,
              12,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2,
            ),
            mat(0xa6b4a2),
          );
          dome.position.set(0, p.h + 1.5, -13);
          group.add(dome);
        }
        // 樓面條帶僅為視覺表現，並非真實樓層模型。
        for (let y = 4; y < p.h - 1; y += 4) {
          box(p.w + 0.3, 1.15, 0.4, 0x829890, 0, y, p.d / 2 + 0.1, group);
          box(0.4, 1.15, p.d + 0.3, 0x829890, p.w / 2 + 0.1, y, 0, group);
          for (let x = -p.w / 2 + 3; x < p.w / 2; x += 5)
            box(0.6, 2.7, 0.7, color, x, y, p.d / 2 + 0.25, group);
        }
        if (["teaching", "management", "dorm"].includes(p.id))
          box(
            p.w * 0.28,
            p.h * 0.5,
            5,
            0xd5d4be,
            0,
            p.h * 0.25,
            p.d / 2 + 2,
            group,
          );
      }
      if(!p.parentId){const hit = new THREE.Mesh(
        new THREE.BoxGeometry(p.w, Math.max(p.h, 4), p.d),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hit.position.y = Math.max(p.h, 4) / 2;
      hit.userData.place = p.id;
      group.add(hit);
      clickable.push(hit);
      }
      const label = document.createElement("button");
      label.className = "map-label";
      label.setAttribute("aria-label", `查看${p.name}`);
      label.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><b>${p.name}</b>`;
      label.onclick = () => current.current.onSelect(p.id);
      el.append(label);
      labelEls.current.set(p.id, label);
    });
    let seed = 91;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 155; i++) {
      const x = -125 + rnd() * 244,
        z = -130 + rnd() * 301;
      if (
        places.some(
          (p) =>
            Math.abs(x - p.x) < p.w / 2 + 5 && Math.abs(z - p.z) < p.d / 2 + 5,
        ) ||
        edges.some(([a, b]) => {
          const p = nodes.find((n) => n.id === a)!,
            q = nodes.find((n) => n.id === b)!;
          const t = Math.max(
            0,
            Math.min(
              1,
              ((x - p.x) * (q.x - p.x) + (z - p.z) * (q.z - p.z)) /
                ((q.x - p.x) ** 2 + (q.z - p.z) ** 2),
            ),
          );
          return (
            Math.hypot(x - p.x - t * (q.x - p.x), z - p.z - t * (q.z - p.z)) < 6
          );
        })
      )
        continue;
      const h = 4 + rnd() * 5;
      box(0.6, h / 2, 0.6, 0x8a8d6b, x, h / 4, z);
      const leaf = new THREE.Mesh(
        new THREE.IcosahedronGeometry(h * 0.62, 1),
        mat(i % 3 ? 0x789875 : 0x96ac84),
      );
      leaf.scale.y = 1.2;
      leaf.position.set(x, h, z);
      leaf.castShadow = true;
      scene.add(leaf);
    }
    const route = new THREE.Group();
    scene.add(route);
    sceneState.current = { scene, route, meshes: buildingGroups };
    let targetPos: THREE.Vector3 | null = null,
      targetLook: THREE.Vector3 | null = null,
      lastFlat = false,
      lastPlaying = false,
      tourStart = 0,
      lastIndex = -1,
      elapsed = 0,
      lastRoute = "";
    const focus = (id: string) => {
      const p = byId(id);
      targetLook = new THREE.Vector3(p.x, 0, p.z);
      targetPos = new THREE.Vector3(
        p.x + 95,
        current.current.flat ? 240 : 105,
        p.z + (current.current.flat ? 1 : 145),
      );
    };
    const overview = () => new THREE.Vector3(290,280,370).multiplyScalar(el.clientWidth/el.clientHeight<1.1?1.5:1);
    api.current = {
      reset: () => {
        targetPos = overview();
        targetLook = new THREE.Vector3(0, 0, 14);
      },
      zoom: (d) => {
        const offset = camera.position.clone().sub(controls.target);
        offset.multiplyScalar(d > 0 ? 0.82 : 1.22).clampLength(80, 1100);
        targetPos = controls.target.clone().add(offset);
        targetLook = controls.target.clone();
      },
      focus,
    };
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      controls.target.set(0,0,14);
      camera.position.copy(overview());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    let startX = 0,
      startY = 0;
    const pointerDown = (e: PointerEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      targetPos = null;
      targetLook = null;
    };
    const pointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 5) return;
      const r = renderer.domElement.getBoundingClientRect(),
        ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          (-(e.clientY - r.top) / r.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray
        .intersectObjects(clickable)
        .find((h) =>
          current.current.filtered.some(id=>id===h.object.userData.place||byId(id).parentId===h.object.userData.place),
        );
      if (hit) {const parentId=hit.object.userData.place;const id=current.current.filtered.includes(parentId)?parentId:current.current.filtered.find(id=>byId(id).parentId===parentId);if(id)current.current.onSelect(id);}
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    let animation = 0;
    const projected = new THREE.Vector3();
    function animate(now: number) {
      animation = requestAnimationFrame(animate);
      const p = current.current;
      if (lastFlat !== p.flat) {
        lastFlat = p.flat;
        targetLook = new THREE.Vector3(0, 0, 15);
        targetPos = p.flat
          ? new THREE.Vector3(0, 460, 16)
          : overview();
      }
      const routeKey = p.route.join(",");
      if (routeKey !== lastRoute) {
        lastRoute = routeKey;
        elapsed = 0;
        lastIndex = -1;
      }
      if (p.playing && !lastPlaying) {
        tourStart = now - elapsed;
        lastIndex = -1;
      }
      if (!p.playing && lastPlaying) elapsed = now - tourStart;
      lastPlaying = p.playing;
      if (p.playing && p.route.length) {
        const index = Math.floor((now - tourStart) / 6500);
        if (index >= p.route.length) {
          elapsed = 0;
          lastPlaying = false;
          p.onEnd();
        } else if (index !== lastIndex) {
          lastIndex = index;
          focus(p.route[index]);
          p.onProgress(index);
        }
      }
      if (targetPos && targetLook) {
        camera.position.lerp(targetPos, 0.045);
        controls.target.lerp(targetLook, 0.045);
        if (camera.position.distanceTo(targetPos) < 0.3) {
          targetPos = null;
          targetLook = null;
        }
      }
      controls.update();
      const occupied: { x: number; y: number; w: number; h: number }[] = [];
      for (const place of [...places].sort(
        (a, b) => Number(b.id === p.selected) - Number(a.id === p.selected),
      )) {
        const label = labelEls.current.get(place.id)!;
        projected.set(place.x, place.h + 8, place.z).project(camera);
        const x = ((projected.x + 1) * el.clientWidth) / 2,
          y = ((-projected.y + 1) * el.clientHeight) / 2,
          w = place.name.length * 10 + 31,
          h = 28;
        let visible =
          p.filtered.includes(place.id) &&
          (!place.parentId || place.id===p.selected || !p.filtered.includes(place.parentId)) &&
          (p.labels || p.selected === place.id) &&
          projected.z < 1 &&
          Math.abs(projected.x) < 1.1 &&
          Math.abs(projected.y) < 1.1;
        visible =
          visible &&
          !occupied.some(
            (r) =>
              Math.abs(r.x - x) < (r.w + w) / 2 + 3 &&
              Math.abs(r.y - y) < (r.h + h) / 2,
          );
        if (visible) occupied.push({ x, y, w, h });
        label.style.display = visible ? "flex" : "none";
        label.style.transform = `translate(-50%, -100%) translate(${x}px,${y}px)`;
        label.classList.toggle("selected", p.selected === place.id);
        label.style.zIndex = p.selected === place.id ? "8" : "2";
      }
      renderer.render(scene, camera);
    }
    animation = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        if (mesh.material) {
          for (const m of Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material])
            m.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      labelEls.current.forEach((l) => l.remove());
      labelEls.current.clear();
      sceneState.current = null;
      api.current = null;
    };
  }, []);
  useEffect(() => {
    const s = sceneState.current;
    if (!s) return;
    const selectedBuilding=byId(props.selected).parentId??props.selected;
    const visibleBuildings=new Set(props.filtered.map(id=>byId(id).parentId??id));
    for (const p of places.filter(p=>!p.parentId)) {
      const group = s.meshes.get(p.id)!;
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.material || !("emissive" in mesh.material)) return;
        const m = mesh.material as THREE.MeshStandardMaterial;
        m.emissive.set(p.id === selectedBuilding ? 0x324b2b : 0x000000);
        m.emissiveIntensity = p.id === selectedBuilding ? 0.24 : 0;
        m.transparent = !visibleBuildings.has(p.id);
        m.opacity = m.transparent ? 0.28 : 1;
      });
    }
  }, [props.selected, props.filtered]);
  useEffect(() => {
    const s = sceneState.current;
    if (!s) return;
    while (s.route.children.length) {
      const o = s.route.children[0] as THREE.Mesh;
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
      s.route.remove(o);
    }
    if (props.route.length < 2) return;
    const points: THREE.Vector3[] = [];
    for (let i = 1; i < props.route.length; i++) {
      const a = byId(props.route[i - 1]),
        b = byId(props.route[i]);
      if (i === 1) points.push(new THREE.Vector3(a.x, 1.7, a.z));
      points.push(
        ...astar(a.node, b.node).map((n) => new THREE.Vector3(n.x, 1.7, n.z)),
        new THREE.Vector3(b.x, 1.7, b.z),
      );
    }
    const clean = points.filter(
      (p, i) => i === 0 || p.distanceTo(points[i - 1]) > 0.01,
    );
    if (clean.length < 2) return;
    const curve = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < clean.length; i++)
      curve.add(new THREE.LineCurve3(clean[i - 1], clean[i]));
    s.route.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, clean.length * 5, 1.25, 8, false),
        new THREE.MeshStandardMaterial({
          color: 0xb0793e,
          emissive: 0x9b662f,
          emissiveIntensity: 0.3,
        }),
      ),
    );
  }, [props.route]);
  return (
    <div
      className="scene"
      ref={host}
      aria-label="朝陽科技大學互動 3D 校園量體示意圖"
    >
      {error && (
        <div className="webgl-error">
          <h3>目前裝置無法顯示 3D 場景</h3>
          <p>仍可使用左側地點列表、參訪路線與右上角的官方校園圖。</p>
        </div>
      )}
    </div>
  );
});
