import { campusPlaces, type Place } from "./data.ts";

export const structureEvidence = {
  access: "https://web.cyut.edu.tw/p/412-1000-4555.php?Lang=zh-tw",
  diagram: "https://web.cyut.edu.tw/var/file/0/1000/img/867/392333822.jpg",
  perspective: "https://web.cyut.edu.tw/p/412-1000-4554.php?Lang=zh-tw",
  floors: "https://web.cyut.edu.tw/p/412-1000-4556.php?Lang=zh-tw",
  confirmed:
    "官方無障礙圖標示的區段落差為 1、7、3、5 公尺；大樓樓層與廳館所在樓層依官網。",
  inferred:
    "以校門通路為相對零點；區界、水平比例、樓高、階數、坡道寬度、梁柱及室內梯間位置為示意推估，非實測。",
};
export const elevationZones = [
  { id: 0, name: "入口通路", level: 0, rise: 0, color: "#c7cfb7" },
  { id: 1, name: "行政／紅磚廣場區", level: 1, rise: 1, color: "#d4c6a4" },
  { id: 2, name: "圖書館／中央花園區", level: 8, rise: 7, color: "#aebf93" },
  { id: 3, name: "教學／設計／管理區", level: 11, rise: 3, color: "#a2b68b" },
  { id: 4, name: "宿舍／航空區", level: 16, rise: 5, color: "#91aa80" },
];
export interface BuildingSpec {
  floors: number;
  basements: number;
  floorHeight: number;
  level: number;
  shape: "u" | "l" | "slab" | "clock" | "library" | "gym";
  source: string;
}
const floorSource = (id: number) =>
  `https://web.cyut.edu.tw/p/404-1000-${id}.php?Lang=zh-tw`;
export const buildingSpecs: Record<string, BuildingSpec> = {
  admin: {
    floors: 6,
    basements: 2,
    floorHeight: 3.5,
    level: 1,
    shape: "clock",
    source: floorSource(18931),
  },
  information: {
    floors: 5,
    basements: 0,
    floorHeight: 3.5,
    level: 1,
    shape: "l",
    source: floorSource(18932),
  },
  humanities: {
    floors: 10,
    basements: 2,
    floorHeight: 3.5,
    level: 1,
    shape: "slab",
    source: floorSource(18933),
  },
  science: {
    floors: 7,
    basements: 0,
    floorHeight: 3.5,
    level: 1,
    shape: "l",
    source: floorSource(18934),
  },
  teaching: {
    floors: 8,
    basements: 0,
    floorHeight: 3.5,
    level: 11,
    shape: "u",
    source: floorSource(18935),
  },
  design: {
    floors: 9,
    basements: 2,
    floorHeight: 3.5,
    level: 11,
    shape: "u",
    source: floorSource(18936),
  },
  management: {
    floors: 10,
    basements: 1,
    floorHeight: 3.5,
    level: 11,
    shape: "u",
    source: floorSource(18937),
  },
  library: {
    floors: 7,
    basements: 1,
    floorHeight: 3.5,
    level: 8,
    shape: "library",
    source: floorSource(18938),
  },
  gym: {
    floors: 3,
    basements: 1,
    floorHeight: 4.2,
    level: 8,
    shape: "gym",
    source: floorSource(18940),
  },
  dorm: {
    floors: 11,
    basements: 0,
    floorHeight: 3.5,
    level: 16,
    shape: "u",
    source: floorSource(18941),
  },
  aviation: {
    floors: 5,
    basements: 0,
    floorHeight: 4,
    level: 16,
    shape: "l",
    source: "https://web.cyut.edu.tw/p/405-1000-64517,c4556.php?Lang=zh-tw",
  },
};
export const placeLevel = (p: Place) =>
  buildingSpecs[p.parentId ?? p.id]?.level ??
  { plaza: 1, field: 8, courts: 8, parking: 0, bus: 0, gate: 0 }[p.id] ??
  0;
export const buildingHeight = (p: Place) => {
  const s = buildingSpecs[p.parentId ?? p.id];
  return s ? s.floors * s.floorHeight + (s.shape === "clock" ? 11 : 2) : p.h;
};
export const levelLabel = (floor: number) =>
  floor < 0 ? `B${-floor}` : `${floor}F`;
export const floorNumbers = (s: BuildingSpec) => [
  ...Array.from({ length: s.basements }, (_, i) => -s.basements + i),
  ...Array.from({ length: s.floors }, (_, i) => i + 1),
];
export interface Point3 {
  x: number;
  y: number;
  z: number;
}
export interface OutdoorNode extends Point3 {
  id: string;
}
export type LinkKind = "walk" | "slope" | "stairs";
export interface OutdoorLink {
  a: string;
  b: string;
  kind: LinkKind;
  name: string;
  via?: Point3[];
  confirmedLocation?: boolean;
}
export const outdoorNodes: OutdoorNode[] = [
  { id: "entry", x: 4, y: 0, z: 150 },
  { id: "b", x: 4, y: 0, z: 115 },
  { id: "l3", x: -38, y: 1, z: 110 },
  { id: "l2", x: -38, y: 8, z: 50 },
  { id: "l1", x: -38, y: 8, z: -20 },
  { id: "l0", x: -38, y: 11, z: -80 },
  { id: "c0", x: 20, y: 11, z: -80 },
  { id: "c1", x: 20, y: 8, z: -20 },
  { id: "c2", x: 20, y: 8, z: 12 },
  { id: "c3", x: 20, y: 1, z: 64 },
  { id: "r0", x: 68, y: 11, z: -80 },
  { id: "r1", x: 68, y: 8, z: 12 },
  { id: "r2", x: 68, y: 1, z: 70 },
  { id: "r3", x: 68, y: 0, z: 115 },
  { id: "north", x: 20, y: 16, z: -92 },
  { id: "west-high", x: -38, y: 16, z: -86 },
  { id: "east-high", x: 70, y: 16, z: -92 },
];
export const outdoorLinks: OutdoorLink[] = [
  { a: "entry", b: "b", kind: "walk", name: "校門進入通路" },
  { a: "b", b: "l3", kind: "slope", name: "入口西側緩坡" },
  { a: "b", b: "r3", kind: "walk", name: "入口東側通路" },
  {
    a: "b",
    b: "c3",
    kind: "slope",
    name: "行政大樓前坡道",
    via: [
      { x: 4, y: 1, z: 103 },
      { x: -6, y: 1, z: 103 },
      { x: -6, y: 1, z: 70 },
      { x: 20, y: 1, z: 70 },
    ],
  },
  { a: "l3", b: "l2", kind: "slope", name: "西側上坡通路" },
  { a: "l2", b: "l1", kind: "walk", name: "球場東側通路" },
  { a: "l1", b: "l0", kind: "slope", name: "教學區西側上坡" },
  { a: "l0", b: "c0", kind: "walk", name: "教學區後側通路" },
  { a: "c0", b: "r0", kind: "walk", name: "設計區後側通路" },
  { a: "r0", b: "r1", kind: "slope", name: "東側下坡通路" },
  { a: "r1", b: "r2", kind: "slope", name: "圖書館側坡道" },
  { a: "r2", b: "r3", kind: "slope", name: "人文大樓前通路" },
  {
    a: "c0",
    b: "c1",
    kind: "stairs",
    name: "中央步道上段階梯",
    confirmedLocation: true,
  },
  { a: "c1", b: "c2", kind: "walk", name: "中央花園平台" },
  {
    a: "c2",
    b: "c3",
    kind: "stairs",
    name: "紅磚廣場中央階梯",
    confirmedLocation: true,
  },
  { a: "c2", b: "r1", kind: "walk", name: "花園橫向步道" },
  {
    a: "l2",
    b: "c3",
    kind: "stairs",
    name: "體育館側階梯連接",
    via: [
      { x: -38, y: 8, z: 70 },
      { x: 20, y: 1, z: 70 },
    ],
  },
  { a: "l1", b: "c1", kind: "walk", name: "教學樓前平台" },
  {
    a: "c0",
    b: "north",
    kind: "stairs",
    name: "宿舍前階梯",
    confirmedLocation: true,
  },
  {
    a: "l0",
    b: "west-high",
    kind: "slope",
    name: "航空區西側繞行坡道",
    via: [
      { x: -76, y: 11, z: -80 },
      { x: -76, y: 16, z: -86 },
    ],
  },
  { a: "west-high", b: "north", kind: "walk", name: "宿舍前上層平台" },
  {
    a: "r0",
    b: "east-high",
    kind: "slope",
    name: "宿舍區東側繞行坡道",
    via: [
      { x: 115, y: 11, z: -80 },
      { x: 115, y: 16, z: -118 },
      { x: 70, y: 16, z: -118 },
    ],
  },
  { a: "east-high", b: "north", kind: "walk", name: "宿舍區上層步道" },
];
export const nodeById = (id: string) => outdoorNodes.find((n) => n.id === id)!;
export const linkBetween = (a: string, b: string) =>
  outdoorLinks.find(
    (l) => (l.a === a && l.b === b) || (l.b === a && l.a === b),
  );
export function linkPolyline(link: OutdoorLink): Point3[] {
  const a = nodeById(link.a),
    b = nodeById(link.b);
  if (link.via) return [a, ...link.via, b];
  if (link.kind === "stairs" && link.a === "c0" && link.b === "c1")
    return [a, { x: 20, y: 11, z: -35 }, { x: 20, y: 8, z: -24 }, b];
  if (link.kind === "stairs" && link.a === "c2")
    return [a, { x: 20, y: 8, z: 24 }, { x: 20, y: 1, z: 38 }, b];
  return [a, b];
}
export function distance3(a: Point3, b: Point3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
export function linkLength(link: OutdoorLink) {
  const p = linkPolyline(link);
  return p.slice(1).reduce((sum, n, i) => sum + distance3(p[i], n), 0);
}
export function stepCount(a: Point3, b: Point3) {
  return Math.max(1, Math.ceil(Math.abs(a.y - b.y) / 0.17));
}
export function sampleLink(link: OutdoorLink, reverse = false): Point3[] {
  const raw = linkPolyline(link),
    result: Point3[] = [];
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1],
      b = raw[i];
    const stair = link.kind === "stairs" && Math.abs(a.y - b.y) > 0.01;
    const count = stair
      ? stepCount(a, b)
      : Math.max(1, Math.ceil(distance3(a, b) / 2));
    if (!result.length) result.push({ ...a });
    for (let j = 1; j <= count; j++) {
      const t = j / count;
      result.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      });
    }
  }
  return reverse ? result.reverse() : result;
}
const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function naturalHeight(x: number, z: number) {
  let y =
    z > 120
      ? 0
      : z > 108
        ? (120 - z) / 12
        : z > 38
          ? 1
          : z > 24
            ? 1 + ((38 - z) / 14) * 7
            : z > -24
              ? 8
              : z > -35
                ? 8 + ((-24 - z) / 11) * 3
                : z > -86
                  ? 11
                  : z > -98
                    ? 11 + ((-86 - z) / 12) * 5
                    : 16;
  if (x < -68 && z > -88 && z < 30) y = 8;
  return y;
}
export function terrainHeight(x: number, z: number) {
  let y = naturalHeight(x, z);
  for (const p of campusPlaces) {
    if (
      !buildingSpecs[p.id] &&
      !["field", "parking", "plaza", "courts"].includes(p.id)
    )
      continue;
    const dx = Math.max(0, Math.abs(x - p.x) - p.w / 2 - 1),
      dz = Math.max(0, Math.abs(z - p.z) - p.d / 2 - 1);
    const distance = Math.hypot(dx, dz);
    if (distance < 4)
      y =
        y * (1 - clamp(1 - distance / 4)) +
        placeLevel(p) * clamp(1 - distance / 4);
  }
  let closest = Infinity,
    roadHeight = y;
  for (const link of outdoorLinks) {
    const points = linkPolyline(link);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1],
        b = points[i],
        length2 = (b.x - a.x) ** 2 + (b.z - a.z) ** 2;
      const t = clamp(
        ((x - a.x) * (b.x - a.x) + (z - a.z) * (b.z - a.z)) / length2,
      );
      const d = Math.hypot(
        x - a.x - t * (b.x - a.x),
        z - a.z - t * (b.z - a.z),
      );
      if (d < closest) {
        closest = d;
        roadHeight = a.y + (b.y - a.y) * t;
      }
    }
  }
  if (closest < 4.5) {
    const t = clamp((4.5 - closest) / 1.5);
    y = y * (1 - t) + (roadHeight - 0.12) * t;
  }
  // 建築落在平整平台上；道路整坡不可切入建築基座。
  for (const p of campusPlaces)
    if (
      buildingSpecs[p.id] &&
      Math.abs(x - p.x) <= p.w / 2 + 0.25 &&
      Math.abs(z - p.z) <= p.d / 2 + 0.25
    )
      y = placeLevel(p);
  return y;
}
export function approachPoint(p: Place): Point3 {
  p = campusPlaces.find((place) => place.id === p.parentId) ?? p;
  if (p.id === "field") return { x: -65, y: 8, z: 23 };
  if (p.id === "gym") return { x: -40, y: 8, z: 50 };
  if (p.id === "courts") return { x: -39, y: 8, z: -17 };
  if (["teaching", "design"].includes(p.id))
    return { x: p.x, y: placeLevel(p), z: p.z - p.d / 2 - 2 };
  if (["library", "humanities", "management"].includes(p.id))
    return { x: p.x - p.w / 2 - 2, y: placeLevel(p), z: p.z };
  if (p.id === "information")
    return { x: p.x + p.w / 2 + 2, y: placeLevel(p), z: p.z };
  return { x: p.x, y: placeLevel(p), z: p.z + p.d / 2 + 2 };
}
