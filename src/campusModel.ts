import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { campusPlaces, type Place } from "./data";
import {
  buildingSpecs,
  placeLevel,
  buildingHeight,
  elevationZones,
  terrainHeight,
  outdoorLinks,
  linkPolyline,
  stepCount,
  approachPoint,
  type Point3,
  type BuildingSpec,
} from "./structure";

const material = new T.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.87,
});
class Batch {
  parts: T.BufferGeometry[] = [];
  add(g: T.BufferGeometry, color: T.ColorRepresentation) {
    const normalized = g.index ? g.toNonIndexed() : g;
    if (normalized !== g) g.dispose();
    g = normalized;
    g.deleteAttribute("uv");
    const c = new T.Color(color),
      colors = new Float32Array(g.getAttribute("position").count * 3);
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }
    g.setAttribute("color", new T.BufferAttribute(colors, 3));
    this.parts.push(g);
  }
  box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    color: T.ColorRepresentation,
    rotation = 0,
  ) {
    const g = new T.BoxGeometry(w, h, d);
    g.rotateY(rotation);
    g.translate(x, y, z);
    this.add(g, color);
  }
  rod(a: T.Vector3, b: T.Vector3, r: number, color: T.ColorRepresentation) {
    const delta = b.clone().sub(a);
    if (delta.length() < 0.001) return;
    const g = new T.CylinderGeometry(r, r, delta.length(), 6);
    g.applyQuaternion(
      new T.Quaternion().setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        delta.clone().normalize(),
      ),
    );
    g.translate(...a.clone().add(b).multiplyScalar(0.5).toArray());
    this.add(g, color);
  }
  mesh(parent: T.Object3D) {
    if (!this.parts.length) return;
    const merged = mergeGeometries(this.parts, false);
    if (!merged) throw new Error("Structure geometry could not be combined");
    this.parts.forEach((p) => p.dispose());
    this.parts = [];
    const mesh = new T.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
}
export interface FloorParts {
  root: T.Group;
  shell: T.Group;
}
export interface BuildingParts {
  root: T.Group;
  floors: Map<number, FloorParts>;
  roof: T.Group;
  foundation: T.Group;
}
export interface CampusModel {
  root: T.Group;
  buildings: Map<string, BuildingParts>;
  hits: T.Mesh[];
  setSection: (id: string, floor: number | null) => void;
}

function wings(p: Place, s: BuildingSpec) {
  const { w, d } = p;
  if (s.shape === "u" || s.shape === "clock")
    return [
      { x: 0, z: -d * 0.34, w, d: d * 0.32 },
      { x: -w * 0.36, z: d * 0.15, w: w * 0.28, d: d * 0.7 },
      { x: w * 0.36, z: d * 0.15, w: w * 0.28, d: d * 0.7 },
    ];
  if (s.shape === "l")
    return [
      { x: -w * 0.32, z: 0, w: w * 0.36, d },
      { x: w * 0.17, z: -d * 0.34, w: w * 0.66, d: d * 0.32 },
    ];
  return [{ x: 0, z: 0, w, d }];
}
function buildFloors(p: Place, s: BuildingSpec, root: T.Group): BuildingParts {
  const floors = new Map<number, FloorParts>(),
    roof = new T.Group(),
    foundation = new T.Group();
  root.add(roof, foundation);
  const blocks = wings(p, s),
    floorHeight = s.floorHeight;
  const footing = new Batch();
  footing.box(
    p.w + 1,
    0.6,
    p.d + 1,
    0,
    -s.basements * floorHeight - 0.6,
    0,
    "#aeada0",
  );
  footing.mesh(foundation);
  const levels = [
    ...Array.from({ length: s.basements }, (_, i) => -s.basements + i),
    ...Array.from({ length: s.floors }, (_, i) => i + 1),
  ];
  for (const floor of levels) {
    const base = floor > 0 ? (floor - 1) * floorHeight : floor * floorHeight;
    const group = new T.Group(),
      shell = new T.Group(),
      frame = new Batch(),
      walls = new Batch(),
      stairs = new Batch();
    group.add(shell);
    root.add(group);
    floors.set(floor, { root: group, shell });
    for (const block of blocks) {
      frame.box(
        block.w,
        0.32,
        block.d,
        block.x,
        base,
        block.z,
        floor < 0 ? "#a9b1ae" : "#ebe5d4",
      );
      const bodyColor =
        floor === 1 ? "#b77c63" : floor < 0 ? "#a1aaa1" : "#dad5c2";
      const glazing = floor === 1 ? "#577d7b" : "#789992";
      for (const sign of [-1, 1]) {
        walls.box(
          block.w,
          floorHeight - 0.4,
          0.55,
          block.x,
          base + floorHeight / 2,
          block.z + sign * (block.d / 2 - 0.2),
          bodyColor,
        );
        walls.box(
          0.55,
          floorHeight - 0.4,
          block.d,
          block.x + sign * (block.w / 2 - 0.2),
          base + floorHeight / 2,
          block.z,
          bodyColor,
        );
        walls.box(
          block.w - 0.7,
          1.4,
          0.62,
          block.x,
          base + floorHeight * 0.57,
          block.z + sign * (block.d / 2 - 0.18),
          glazing,
        );
        walls.box(
          0.62,
          1.4,
          block.d - 0.7,
          block.x + sign * (block.w / 2 - 0.18),
          base + floorHeight * 0.57,
          block.z,
          glazing,
        );
        for (let x = -block.w / 2 + 2; x < block.w / 2; x += 3.7)
          walls.box(
            0.38,
            floorHeight - 0.4,
            0.8,
            block.x + x,
            base + floorHeight / 2,
            block.z + sign * (block.d / 2 - 0.15),
            "#dfdac8",
          );
        for (let z = -block.d / 2 + 2; z < block.d / 2; z += 3.7)
          walls.box(
            0.8,
            floorHeight - 0.4,
            0.38,
            block.x + sign * (block.w / 2 - 0.15),
            base + floorHeight / 2,
            block.z + z,
            "#dfdac8",
          );
      }
      for (const x of [-block.w / 2 + 1, block.w / 2 - 1])
        for (const z of [-block.d / 2 + 1, block.d / 2 - 1])
          frame.box(
            0.75,
            floorHeight,
            0.75,
            block.x + x,
            base + floorHeight / 2,
            block.z + z,
            "#b4b9a8",
          );
      frame.box(
        block.w,
        0.42,
        0.7,
        block.x,
        base + floorHeight - 0.4,
        block.z,
        "#b6b9aa",
      );
    }
    // 兩跑樓梯、平台與電梯核心為明確標示的室內結構推估。
    const coreX = -p.w / 2 + 4,
      coreZ = -p.d / 2 + 5,
      steps = 12,
      rise = floorHeight / (steps * 2),
      tread = 0.28;
    for (let i = 0; i < steps; i++) {
      stairs.box(
        1.65,
        0.16,
        tread,
        coreX,
        base + (i + 1) * rise,
        coreZ + i * tread,
        "#c5a47b",
      );
      stairs.box(
        1.65,
        0.16,
        tread,
        coreX + 2,
        base + floorHeight / 2 + (i + 1) * rise,
        coreZ + (steps - 1 - i) * tread,
        "#c5a47b",
      );
    }
    stairs.box(
      3.8,
      0.2,
      1.2,
      coreX + 1,
      base + floorHeight / 2,
      coreZ + steps * tread + 0.4,
      "#d1b58c",
    );
    stairs.rod(
      new T.Vector3(coreX - 0.9, base + 0.8, coreZ),
      new T.Vector3(
        coreX - 0.9,
        base + floorHeight / 2 + 0.8,
        coreZ + steps * tread,
      ),
      0.06,
      "#7a8981",
    );
    stairs.rod(
      new T.Vector3(
        coreX + 3,
        base + floorHeight / 2 + 0.8,
        coreZ + steps * tread,
      ),
      new T.Vector3(coreX + 3, base + floorHeight + 0.8, coreZ),
      0.06,
      "#7a8981",
    );
    stairs.box(
      2,
      floorHeight,
      2,
      coreX + 5,
      base + floorHeight / 2,
      coreZ + 1,
      "#809b92",
    );
    stairs.box(1.15, 2.25, 0.12, coreX + 5, base + 1.2, coreZ + 2.1, "#bacbc0");
    walls.mesh(shell);
    frame.mesh(group);
    stairs.mesh(group);
  }
  const roofBatch = new Batch();
  for (const block of blocks) {
    roofBatch.box(
      block.w + 1,
      0.55,
      block.d + 1,
      block.x,
      s.floors * floorHeight,
      block.z,
      "#ece8db",
    );
    roofBatch.box(
      block.w * 0.6,
      0.8,
      block.d * 0.65,
      block.x,
      s.floors * floorHeight + 0.7,
      block.z,
      "#b7c0b0",
    );
  }
  if (s.shape === "clock") {
    const top = s.floors * floorHeight;
    roofBatch.box(8, 10, 8, 0, top + 4.5, -p.d * 0.2, "#d8c3a0");
    const spire = new T.ConeGeometry(7, 9, 4);
    spire.rotateY(Math.PI / 4);
    spire.translate(0, top + 13, -p.d * 0.2);
    roofBatch.add(spire, "#9f5e4d");
    for (const side of [-1, 1]) {
      const face = new T.CylinderGeometry(2, 2, 0.22, 32);
      face.rotateX(Math.PI / 2);
      face.translate(0, top + 6, -p.d * 0.2 + side * 4.15);
      roofBatch.add(face, "#f1e9cb");
      roofBatch.rod(
        new T.Vector3(0, top + 6, -p.d * 0.2 + side * 4.3),
        new T.Vector3(0, top + 7.4, -p.d * 0.2 + side * 4.3),
        0.08,
        "#586857",
      );
      roofBatch.rod(
        new T.Vector3(0, top + 6, -p.d * 0.2 + side * 4.3),
        new T.Vector3(1, top + 5.7, -p.d * 0.2 + side * 4.3),
        0.08,
        "#586857",
      );
    }
  }
  if (s.shape === "gym") {
    const y = s.floors * floorHeight + 0.7;
    roofBatch.box(p.w * 0.8, 0.18, p.d * 0.82, 0, y, 0, "#739388");
    const w = p.w * 0.65,
      d = p.d * 0.68;
    for (const sign of [-1, 1]) {
      roofBatch.box(w, 0.05, 0.15, 0, y + 0.15, (sign * d) / 2, "#ede8d2");
      roofBatch.box(0.15, 0.05, d, (sign * w) / 2, y + 0.15, 0, "#ede8d2");
    }
    roofBatch.box(w, 0.05, 0.12, 0, y + 0.15, 0, "#ede8d2");
  }
  roofBatch.mesh(roof);
  // 入口門廊與支柱；鐘樓外形參照官方導覽圖，尺度仍為推估。
  const entry = new Batch();
  const approach = approachPoint(p),
    ex = approach.x - p.x,
    ez = approach.z - p.z,
    side = Math.abs(ex) > p.w / 2;
  entry.box(
    side ? 4 : p.w * 0.3,
    0.55,
    side ? p.d * 0.3 : 4,
    ex,
    3.9,
    ez,
    "#e4dec8",
  );
  for (const sign of [-1, 1])
    entry.box(
      0.7,
      3.8,
      0.7,
      ex + (side ? 0 : sign * p.w * 0.13),
      1.9,
      ez + (side ? sign * p.d * 0.13 : 0),
      "#d4c7ac",
    );
  entry.mesh(roof);
  const ownedMaterial = material.clone();
  root.traverse((o) => {
    const mesh = o as T.Mesh;
    if (mesh.material === material) mesh.material = ownedMaterial;
  });
  return { root, floors, roof, foundation };
}

function ribbon(
  batch: Batch,
  a: Point3,
  b: Point3,
  width: number,
  scale: number,
  color: string,
) {
  const dx = b.x - a.x,
    dz = b.z - a.z,
    len = Math.hypot(dx, dz);
  if (len < 0.001) return;
  const nx = ((-dz / len) * width) / 2,
    nz = ((dx / len) * width) / 2;
  const g = new T.BufferGeometry();
  g.setAttribute(
    "position",
    new T.Float32BufferAttribute(
      [
        a.x + nx,
        a.y * scale + 0.12,
        a.z + nz,
        a.x - nx,
        a.y * scale + 0.12,
        a.z - nz,
        b.x + nx,
        b.y * scale + 0.12,
        b.z + nz,
        b.x - nx,
        b.y * scale + 0.12,
        b.z - nz,
      ],
      3,
    ),
  );
  g.setIndex([0, 2, 1, 1, 2, 3]);
  g.computeVertexNormals();
  batch.add(g, color);
}
function outdoorStairs(
  batch: Batch,
  start: Point3,
  end: Point3,
  width: number,
  scale: number,
) {
  const [a, b] = start.y < end.y ? [start, end] : [end, start],
    count = stepCount(a, b),
    length = Math.hypot(b.x - a.x, b.z - a.z),
    angle = Math.atan2(b.x - a.x, b.z - a.z);
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count,
      top = (a.y + ((b.y - a.y) * (i + 1)) / count) * scale + 0.18,
      bottom = a.y * scale - 0.1;
    batch.box(
      width,
      top - bottom,
      length / count + 0.03,
      a.x + (b.x - a.x) * t,
      (top + bottom) / 2,
      a.z + (b.z - a.z) * t,
      i % 8 === 0 ? "#d5b28b" : "#e6d9bf",
      angle,
    );
  }
  const nx = (Math.cos(angle) * width) / 2,
    nz = (-Math.sin(angle) * width) / 2;
  for (const sign of [-1, 1]) {
    const low = new T.Vector3(
        a.x + sign * nx,
        a.y * scale + 1.15,
        a.z + sign * nz,
      ),
      high = new T.Vector3(
        b.x + sign * nx,
        b.y * scale + 1.15,
        b.z + sign * nz,
      );
    batch.rod(low, high, 0.11, "#697e70");
    for (let i = 0; i <= Math.ceil(length / 2); i++) {
      const t = i / Math.ceil(length / 2),
        p = low.clone().lerp(high, t);
      batch.rod(p.clone().add(new T.Vector3(0, -1.15, 0)), p, 0.08, "#697e70");
    }
  }
}

export function createCampusModel(scale: number): CampusModel {
  const root = new T.Group(),
    buildings = new Map<string, BuildingParts>(),
    hits: T.Mesh[] = [];
  const minX = -133,
    maxX = 127,
    minZ = -139,
    maxZ = 192,
    cols = 130,
    rows = 166,
    vertices: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) {
      const x = minX + ((maxX - minX) * i) / cols,
        z = minZ + ((maxZ - minZ) * j) / rows,
        y = terrainHeight(x, z);
      vertices.push(x, y * scale, z);
      const zone = y > 13 ? 4 : y > 9 ? 3 : y > 3 ? 2 : y > 0.5 ? 1 : 0,
        c = new T.Color(elevationZones[zone].color);
      colors.push(c.r, c.g, c.b);
      if (i < cols && j < rows) {
        const k = j * (cols + 1) + i;
        indices.push(k, k + cols + 1, k + 1, k + 1, k + cols + 1, k + cols + 2);
      }
    }
  const terrainGeo = new T.BufferGeometry();
  terrainGeo.setAttribute(
    "position",
    new T.Float32BufferAttribute(vertices, 3),
  );
  terrainGeo.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
  terrainGeo.setIndex(indices);
  terrainGeo.computeVertexNormals();
  const terrain = new T.Mesh(terrainGeo, material);
  terrain.receiveShadow = true;
  root.add(terrain);
  const walls = new Batch(),
    boundary: Point3[] = [];
  for (let x = minX; x <= maxX; x += 2)
    boundary.push({ x, y: terrainHeight(x, minZ), z: minZ });
  for (let z = minZ; z <= maxZ; z += 2)
    boundary.push({ x: maxX, y: terrainHeight(maxX, z), z });
  for (let x = maxX; x >= minX; x -= 2)
    boundary.push({ x, y: terrainHeight(x, maxZ), z: maxZ });
  for (let z = maxZ; z >= minZ; z -= 2)
    boundary.push({ x: minX, y: terrainHeight(minX, z), z });
  for (let i = 0; i < boundary.length; i++) {
    const a = boundary[i],
      b = boundary[(i + 1) % boundary.length];
    const g = new T.BufferGeometry();
    g.setAttribute(
      "position",
      new T.Float32BufferAttribute(
        [
          a.x,
          a.y * scale,
          a.z,
          b.x,
          b.y * scale,
          b.z,
          a.x,
          -10,
          a.z,
          b.x,
          -10,
          b.z,
        ],
        3,
      ),
    );
    g.setIndex([0, 1, 2, 1, 3, 2]);
    g.computeVertexNormals();
    walls.add(g, i % 7 ? "#a9aa91" : "#b6b398");
  }
  walls.mesh(root);
  const paths = new Batch(),
    stairBatch = new Batch();
  for (const link of outdoorLinks) {
    const points = linkPolyline(link);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1],
        b = points[i];
      if (link.kind === "stairs" && Math.abs(a.y - b.y) > 0.01)
        outdoorStairs(stairBatch, a, b, 7, scale);
      else
        ribbon(
          paths,
          a,
          b,
          link.kind === "walk" ? 5.6 : 6.8,
          scale,
          link.kind === "slope" ? "#c7c9bb" : "#e1d8c2",
        );
    }
  }
  paths.mesh(root);
  stairBatch.mesh(root);
  // 各區平台擋土邊緣與中央水景使區段高差可讀；尺寸與斷面為推估。
  const landscape = new Batch();
  for (const [z, y] of [
    [38, 1],
    [24, 8],
    [-24, 8],
    [-35, 11],
    [-86, 11],
    [-98, 16],
  ]) {
    if (z === 38 || z === -24 || z === -86) continue;
    for (const [x, w] of [
      [-9, 43],
      [45, 30],
    ])
      landscape.box(w, 0.7, 1, x, y * scale + 0.35, z, "#b7b498");
  }
  for (let i = 0; i < 12; i++) {
    const z = -13 + i * 3;
    landscape.box(
      2.1,
      0.3,
      2.7,
      21,
      terrainHeight(21, z) * scale + 0.45,
      z,
      "#87b5ac",
    );
    landscape.box(
      0.5,
      0.6,
      2.7,
      19.8,
      terrainHeight(21, z) * scale + 0.5,
      z,
      "#d6cbb2",
    );
    landscape.box(
      0.5,
      0.6,
      2.7,
      22.2,
      terrainHeight(21, z) * scale + 0.5,
      z,
      "#d6cbb2",
    );
  }
  landscape.mesh(root);
  for (const p of campusPlaces) {
    const group = new T.Group(),
      base = placeLevel(p) * scale;
    group.position.set(p.x, base, p.z);
    root.add(group);
    const spec = buildingSpecs[p.id];
    if (spec) buildings.set(p.id, buildFloors(p, spec, group));
    else {
      const detail = new Batch();
      if (p.id === "field") {
        const track = new T.Shape();
        track.absellipse(0, 0, 23, 54, 0, Math.PI * 2, false, 0);
        const geo = new T.ShapeGeometry(track);
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, 0.25, 0);
        detail.add(geo, "#b97862");
        const inner = new T.Shape();
        inner.absellipse(0, 0, 16, 46, 0, Math.PI * 2, false, 0);
        const inside = new T.ShapeGeometry(inner);
        inside.rotateX(-Math.PI / 2);
        inside.translate(0, 0.3, 0);
        detail.add(inside, "#86a177");
        for (let j = 0; j < 4; j++)
          for (let k = 1; k <= 96; k++) {
            const a = (k / 96) * Math.PI * 2,
              b = ((k - 1) / 96) * Math.PI * 2;
            detail.rod(
              new T.Vector3(
                (18 + j * 1.3) * Math.cos(a),
                0.37,
                (48 + j * 1.3) * Math.sin(a),
              ),
              new T.Vector3(
                (18 + j * 1.3) * Math.cos(b),
                0.37,
                (48 + j * 1.3) * Math.sin(b),
              ),
              0.08,
              "#e1bea2",
            );
          }
      } else if (p.id === "courts") {
        detail.box(p.w, 0.3, p.d, 0, 0.3, 0, "#78998b");
        for (let n = -19; n <= 19; n += 19) {
          for (const sign of [-1, 1]) {
            detail.box(18, 0.08, 0.16, 0, 0.5, n + sign * 8, "#e9e4cc");
            detail.box(0.16, 0.08, 16, sign * 9, 0.5, n, "#e9e4cc");
          }
          detail.box(18, 0.08, 0.16, 0, 0.5, n, "#e9e4cc");
        }
      } else if (p.id === "plaza") {
        detail.box(p.w, 0.35, p.d, 0, 0.2, 0, "#bf8b70");
        for (let n = -12; n < 15; n += 3)
          detail.box(28, 0.04, 0.1, 0, 0.4, n, "#dbad8e");
      } else if (p.id === "parking") {
        detail.box(p.w, 0.3, p.d, 0, 0.2, 0, "#b7c0ac");
        for (let x = -12; x < 15; x += 6) {
          detail.box(0.15, 0.05, 10, x, 0.4, -7, "#e6e5d3");
          detail.box(3, 1.4, 5, x, 1.1, 8, "#d8ded0");
        }
      } else if (p.id === "bus") {
        detail.box(15, 0.6, 7, 0, 5, 0, "#789486");
        detail.box(14, 1, 2, 0, 1.3, 0, "#b99b76");
        for (const x of [-6, 6]) detail.box(0.4, 5, 0.4, x, 2.5, 1, "#728378");
      } else if (p.id === "gate") {
        for (const x of [-12, 12]) detail.box(2, 5, 3, x, 2.5, 0, "#aa9d80");
        detail.box(26, 1.3, 4, 0, 5.6, 0, "#728b7c");
      }
      detail.mesh(group);
    }
    const hit = new T.Mesh(
      new T.BoxGeometry(p.w, Math.max(buildingHeight(p), 4), p.d),
      new T.MeshBasicMaterial({ visible: false }),
    );
    hit.position.y = Math.max(buildingHeight(p), 4) / 2;
    hit.userData.place = p.id;
    group.add(hit);
    hits.push(hit);
  }
  let seed = 64;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const trees = new Batch();
  for (let i = 0; i < 160; i++) {
    const x = -125 + random() * 246,
      z = -132 + random() * 310;
    if (
      campusPlaces.some(
        (p) =>
          Math.abs(x - p.x) < p.w / 2 + 4 && Math.abs(z - p.z) < p.d / 2 + 4,
      )
    )
      continue;
    let road = false;
    for (const l of outdoorLinks) {
      const ps = linkPolyline(l);
      for (let j = 1; j < ps.length; j++) {
        const a = ps[j - 1],
          b = ps[j],
          t = Math.max(
            0,
            Math.min(
              1,
              ((x - a.x) * (b.x - a.x) + (z - a.z) * (b.z - a.z)) /
                ((b.x - a.x) ** 2 + (b.z - a.z) ** 2),
            ),
          );
        if (
          Math.hypot(x - a.x - t * (b.x - a.x), z - a.z - t * (b.z - a.z)) < 5
        )
          road = true;
      }
    }
    if (road) continue;
    const y = terrainHeight(x, z) * scale,
      h = 3 + random() * 3;
    trees.box(0.45, h, 0.45, x, y + h / 2, z, "#8f8467");
    const canopy = new T.IcosahedronGeometry(h * 0.66, 1);
    canopy.scale(1, 1.3, 1);
    canopy.translate(x, y + h + 1, z);
    trees.add(canopy, i % 3 ? "#78936c" : "#9bb184");
  }
  trees.mesh(root);
  let sectionKey = "";
  function setSection(id: string, floor: number | null) {
    const key = `${id}:${floor}`;
    if (key === sectionKey) return;
    sectionKey = key;
    for (const [buildingId, parts] of buildings) {
      const active = buildingId === id && floor !== null;
      parts.roof.visible = !active;
      parts.foundation.visible = !active;
      for (const [level, f] of parts.floors) {
        f.root.visible = !active || level <= floor!;
        f.shell.visible = !active || level !== floor;
      }
    }
    if (floor !== null && floor < 1) {
      const p = campusPlaces.find((p) => p.id === id)!;
      const kept: number[] = [];
      for (let i = 0; i < indices.length; i += 3) {
        const x =
            (vertices[indices[i] * 3] +
              vertices[indices[i + 1] * 3] +
              vertices[indices[i + 2] * 3]) /
            3,
          z =
            (vertices[indices[i] * 3 + 2] +
              vertices[indices[i + 1] * 3 + 2] +
              vertices[indices[i + 2] * 3 + 2]) /
            3;
        if (Math.abs(x - p.x) > p.w / 2 + 3 || Math.abs(z - p.z) > p.d / 2 + 3)
          kept.push(indices[i], indices[i + 1], indices[i + 2]);
      }
      terrainGeo.setIndex(kept);
    } else terrainGeo.setIndex(indices);
  }
  return { root, buildings, hits, setSection };
}
