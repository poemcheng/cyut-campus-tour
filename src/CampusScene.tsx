import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { places, byId, type Place } from "./data";
import { astar, type RouteMode } from "./pathfinding";
import { createCampusModel, type CampusModel } from "./campusModel";
import {
  buildingSpecs,
  buildingHeight,
  placeLevel,
  terrainHeight,
  linkBetween,
  sampleLink,
  approachPoint,
  outdoorLinks,
  linkPolyline,
  type Point3,
} from "./structure";

export interface SceneAPI {
  reset: () => void;
  zoom: (direction: number) => void;
  focus: (id: string) => void;
  side: () => void;
}
interface Props {
  selected: string;
  filtered: string[];
  labels: boolean;
  route: string[];
  flat: boolean;
  playing: boolean;
  heightScale: number;
  sectionFloor: number | null;
  routeMode: RouteMode;
  structureTags: boolean;
  onSelect: (id: string) => void;
  onProgress: (index: number) => void;
  onEnd: () => void;
}
export const CampusScene = forwardRef<SceneAPI, Props>((props, ref) => {
  const host = useRef<HTMLDivElement>(null),
    current = useRef(props),
    api = useRef<SceneAPI | null>(null),
    sceneState = useRef<{
      model: CampusModel;
      route: T.Group;
      marker: T.Group;
    } | null>(null),
    [error, setError] = useState(false);
  current.current = props;
  useImperativeHandle(
    ref,
    () => ({
      reset: () => api.current?.reset(),
      zoom: (d) => api.current?.zoom(d),
      focus: (id) => api.current?.focus(id),
      side: () => api.current?.side(),
    }),
    [],
  );
  useEffect(() => {
    if (!host.current) return;
    const el = host.current,
      scale = props.heightScale;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(true);
      return;
    }
    setError(false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
    renderer.setClearColor(0xe8eddf, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    el.prepend(renderer.domElement);
    const scene = new T.Scene();
    scene.fog = new T.Fog(0xe7ecdf, 1100, 1900);
    const model = createCampusModel(scale);
    scene.add(model.root);
    const camera = new T.PerspectiveCamera(39, 1, 1, 2000),
      controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 50;
    controls.maxDistance = 1100;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.target.set(0, 16, 15);
    scene.add(new T.HemisphereLight(0xfff8e7, 0x65806c, 2.1));
    const sun = new T.DirectionalLight(0xfff5de, 2.7);
    sun.position.set(-130, 250, 110);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -200,
      right: 200,
      top: 230,
      bottom: -200,
      near: 1,
      far: 650,
    });
    sun.shadow.bias = -0.0008;
    scene.add(sun);
    const route = new T.Group(),
      marker = new T.Group();
    scene.add(route, marker);
    sceneState.current = { model, route, marker };
    const labels = new Map<string, HTMLButtonElement>(),
      terrainLabels: { el: HTMLButtonElement; point: T.Vector3 }[] = [];
    for (const p of places) {
      const button = document.createElement("button");
      button.className = "map-label";
      button.setAttribute("aria-label", `查看${p.name}`);
      button.innerHTML = `<span>${String(places.indexOf(p) + 1).padStart(2, "0")}</span><b>${p.name}</b>`;
      button.onclick = () => current.current.onSelect(p.id);
      el.append(button);
      labels.set(p.id, button);
    }
    for (const link of outdoorLinks.filter(
      (l) => l.confirmedLocation && l.kind === "stairs",
    )) {
      const ps = linkPolyline(link),
        segment = ps
          .slice(1)
          .findIndex((p, i) => Math.abs(p.y - ps[i].y) > 0.01),
        a = ps[segment],
        b = ps[segment + 1],
        button = document.createElement("button");
      button.className = "terrain-label";
      button.textContent = `階梯 · 區段落差 ${Math.abs(a.y - b.y)}m`;
      const point = new T.Vector3(
        (a.x + b.x) / 2 + 9,
        ((a.y + b.y) / 2) * scale + 3,
        (a.z + b.z) / 2,
      );
      button.title = "區段落差依官方圖；階數、寬度與精確位置推估";
      button.onclick = () => {
        look = new T.Vector3(
          (a.x + b.x) / 2,
          ((a.y + b.y) / 2) * scale,
          (a.z + b.z) / 2,
        );
        target = look.clone().add(new T.Vector3(42, 50, 65));
      };
      el.append(button);
      terrainLabels.push({ el: button, point });
    }
    let target: T.Vector3 | null = null,
      look: T.Vector3 | null = null;
    const overview = () =>
      new T.Vector3(-265, 225 + scale * 8, 350).multiplyScalar(
        el.clientWidth / el.clientHeight < 1.1 ? 1.42 : 1,
      );
    const focus = (id: string) => {
      const p = byId(id),
        spec = buildingSpecs[p.parentId ?? p.id];
      const f = current.current.sectionFloor;
      const y =
        placeLevel(p) * scale +
        (f !== null && spec
          ? (f > 0 ? f - 1 : f) * spec.floorHeight
          : Math.min(buildingHeight(p) * 0.35, 13));
      look = new T.Vector3(p.x, y, p.z);
      target = new T.Vector3(p.x + 85, y + 70, p.z + 105);
    };
    api.current = {
      focus,
      reset: () => {
        lastFlat = false;
        target = overview();
        look = new T.Vector3(0, 16, 15);
      },
      zoom: (d) => {
        const offset = camera.position
          .clone()
          .sub(controls.target)
          .multiplyScalar(d > 0 ? 0.82 : 1.22)
          .clampLength(50, 1100);
        target = controls.target.clone().add(offset);
        look = controls.target.clone();
      },
      side: () => {
        lastFlat = false;
        target = new T.Vector3(-190, 90, 160);
        look = new T.Vector3(0, 17, 0);
      },
    };
    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      camera.position.copy(
        current.current.flat ? new T.Vector3(0, 520, 16) : overview(),
      );
      controls.target.set(0, 16, 15);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    let down: [number, number] = [0, 0];
    const pointerDown = (e: PointerEvent) => {
      down = [e.clientX, e.clientY];
      target = null;
      look = null;
    };
    const pointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect(),
        ray = new T.Raycaster();
      ray.setFromCamera(
        new T.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray
        .intersectObjects(model.hits)
        .find((h) =>
          current.current.filtered.some(
            (id) =>
              id === h.object.userData.place ||
              byId(id).parentId === h.object.userData.place,
          ),
        );
      if (hit) {
        const parent = hit.object.userData.place,
          id = current.current.filtered.includes(parent)
            ? parent
            : current.current.filtered.find(
                (id) => byId(id).parentId === parent,
              );
        if (id) current.current.onSelect(id);
      }
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    let animation = 0,
      lastFlat = props.flat,
      lastPlaying = false,
      startTime = 0,
      elapsed = 0,
      lastIndex = -1,
      lastRoute = "",
      lastSection = "";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
      projected = new T.Vector3();
    function frame(now: number) {
      animation = requestAnimationFrame(frame);
      if (document.hidden) return;
      const p = current.current;
      if (p.flat !== lastFlat) {
        lastFlat = p.flat;
        target = p.flat ? new T.Vector3(0, 520, 16) : overview();
        look = new T.Vector3(0, 16, 15);
      }
      const parent = byId(p.selected).parentId ?? p.selected,
        sectionKey = `${parent}:${p.sectionFloor}`;
      model.setSection(parent, p.sectionFloor);
      if (sectionKey !== lastSection) {
        if (lastSection && p.sectionFloor !== null) focus(p.selected);
        lastSection = sectionKey;
      }
      const routeKey = p.route.join(",");
      if (routeKey !== lastRoute) {
        elapsed = 0;
        lastIndex = -1;
        lastRoute = routeKey;
      }
      if (p.playing && !lastPlaying) {
        startTime = now - elapsed;
        lastIndex = -1;
      }
      if (!p.playing && lastPlaying) elapsed = now - startTime;
      lastPlaying = p.playing;
      if (p.playing && p.route.length) {
        const index = Math.floor((now - startTime) / 6500);
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
      if (target && look) {
        camera.position.lerp(target, reduced ? 1 : 0.06);
        controls.target.lerp(look, reduced ? 1 : 0.06);
        if (camera.position.distanceTo(target) < 0.25) {
          target = null;
          look = null;
        }
      }
      controls.update();
      const occupied: { x: number; y: number; w: number; h: number }[] = [];
      for (const place of [...places].sort(
        (a, b) => Number(b.id === p.selected) - Number(a.id === p.selected),
      )) {
        const label = labels.get(place.id)!,
          s = buildingSpecs[place.parentId ?? place.id],
          floor = place.floor ? parseInt(place.floor) : null;
        const activeSection =
          p.sectionFloor !== null && (place.parentId ?? place.id) === parent
            ? p.sectionFloor
            : null;
        const floorY =
          activeSection !== null && s
            ? (activeSection > 0 ? activeSection - 1 : activeSection) *
                s.floorHeight +
              3
            : place.parentId && floor && s
              ? (floor - 1) * s.floorHeight + 2
              : buildingHeight(place) + 3;
        projected
          .set(place.x, placeLevel(place) * scale + floorY, place.z)
          .project(camera);
        const x = ((projected.x + 1) * el.clientWidth) / 2,
          y = ((-projected.y + 1) * el.clientHeight) / 2,
          w = place.name.length * 10 + 31,
          h = 28;
        let visible =
          p.filtered.includes(place.id) &&
          (p.sectionFloor === null || (place.parentId ?? place.id) === parent) &&
          (!place.parentId ||
            place.id === p.selected ||
            !p.filtered.includes(place.parentId)) &&
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
        label.style.transform = `translate(-50%,-100%) translate(${x}px,${y}px)`;
        label.classList.toggle("selected", place.id === p.selected);
        label.style.zIndex = place.id === p.selected ? "8" : "2";
      }
      for (const tag of terrainLabels) {
        projected.copy(tag.point).project(camera);
        tag.el.style.display =
          p.structureTags &&
          p.sectionFloor === null &&
          projected.z < 1 &&
          Math.abs(projected.x) < 1 &&
          Math.abs(projected.y) < 1
            ? "block"
            : "none";
        tag.el.style.transform = `translate(-50%,-100%) translate(${((projected.x + 1) * el.clientWidth) / 2}px,${((-projected.y + 1) * el.clientHeight) / 2}px)`;
      }
      renderer.render(scene, camera);
    }
    animation = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      labels.forEach((l) => l.remove());
      terrainLabels.forEach((l) => l.el.remove());
      const mats = new Set<T.Material>();
      scene.traverse((o) => {
        const m = o as T.Mesh;
        m.geometry?.dispose();
        if (m.material)
          for (const mat of Array.isArray(m.material)
            ? m.material
            : [m.material])
            mats.add(mat);
      });
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
      sceneState.current = null;
    };
  }, [props.heightScale]);
  useEffect(() => {
    const state = sceneState.current;
    if (!state) return;
    const parent = byId(props.selected).parentId ?? props.selected,
      visible = new Set(props.filtered.map((id) => byId(id).parentId ?? id));
    for (const [id, parts] of state.model.buildings)
      parts.root.traverse((o) => {
        const m = o as T.Mesh;
        if (m.material && "emissive" in m.material) {
          const mat = m.material as T.MeshStandardMaterial;
          mat.emissive.set(id === parent ? "#80602c" : "#000000");
          mat.emissiveIntensity = id === parent ? 0.12 : 0;
          mat.transparent = !visible.has(id);
          mat.opacity = mat.transparent ? 0.25 : 1;
        }
      });
    while (state.marker.children.length) {
      const o = state.marker.children[0] as T.LineSegments;
      o.geometry.dispose();
      (o.material as T.Material).dispose();
      state.marker.remove(o);
    }
    const p = byId(props.selected),
      spec = buildingSpecs[parent],
      f = props.sectionFloor ?? (p.floor ? parseInt(p.floor) : 1),
      y =
        placeLevel(p) * props.heightScale +
        (spec ? (f > 0 ? f - 1 : f) * spec.floorHeight : 0) +
        0.4;
    const line = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(p.w + 1, 0.2, p.d + 1)),
      new T.LineBasicMaterial({ color: 0xb88644 }),
    );
    line.position.set(p.x, y, p.z);
    state.marker.add(line);
  }, [props.selected, props.filtered, props.heightScale, props.sectionFloor]);
  useEffect(() => {
    const state = sceneState.current;
    if (!state) return;
    while (state.route.children.length) {
      const o = state.route.children[0] as T.Mesh;
      o.geometry.dispose();
      (o.material as T.Material).dispose();
      state.route.remove(o);
    }
    if (props.route.length < 2) return;
    const scale = props.heightScale;
    function draw(points: Point3[], color: number) {
      const clean = points.filter(
        (p, i) =>
          !i ||
          Math.hypot(
            p.x - points[i - 1].x,
            p.y - points[i - 1].y,
            p.z - points[i - 1].z,
          ) > 0.01,
      );
      if (clean.length < 2) return;
      const path = new T.CurvePath<T.Vector3>();
      for (let i = 1; i < clean.length; i++)
        path.add(
          new T.LineCurve3(
            new T.Vector3(
              clean[i - 1].x,
              clean[i - 1].y * scale + 0.65,
              clean[i - 1].z,
            ),
            new T.Vector3(clean[i].x, clean[i].y * scale + 0.65, clean[i].z),
          ),
        );
      state!.route.add(
        new T.Mesh(
          new T.TubeGeometry(
            path,
            Math.max(clean.length * 3, 8),
            0.65,
            7,
            false,
          ),
          new T.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.15,
          }),
        ),
      );
    }
    function connector(place: Place, node: Point3) {
      const entry = approachPoint(place),
        n = Math.ceil(Math.hypot(entry.x - node.x, entry.z - node.z) / 2),
        points: Point3[] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / Math.max(1, n),
          x = node.x + (entry.x - node.x) * t,
          z = node.z + (entry.z - node.z) * t;
        points.push({
          x,
          y: i === 0 ? node.y : i === n ? entry.y : terrainHeight(x, z),
          z,
        });
      }
      return points;
    }
    for (let i = 1; i < props.route.length; i++) {
      const a = byId(props.route[i - 1]),
        b = byId(props.route[i]),
        path = astar(a.node, b.node, props.routeMode);
      if (!path.length) continue;
      if (a.node === b.node && (a.parentId ?? a.id) === (b.parentId ?? b.id))
        continue;
      draw(connector(a, path[0]), 0xb68246);
      for (let j = 1; j < path.length; j++) {
        const link = linkBetween(path[j - 1].id, path[j].id)!;
        draw(
          sampleLink(link, link.a !== path[j - 1].id),
          link.kind === "stairs"
            ? 0xb4783f
            : link.kind === "slope"
              ? 0x4d876b
              : 0xb68246,
        );
      }
      draw(connector(b, path.at(-1)!), 0xb68246);
    }
  }, [props.route, props.routeMode, props.heightScale]);
  return (
    <div
      className="scene"
      ref={host}
      aria-label="朝陽科技大學立體地形、樓梯與建築結構示意"
    >
      {error && (
        <div className="webgl-error">
          <h3>目前裝置無法顯示 3D 場景</h3>
          <p>仍可使用地點列表、參訪路線與官方校園圖。</p>
        </div>
      )}
    </div>
  );
});
