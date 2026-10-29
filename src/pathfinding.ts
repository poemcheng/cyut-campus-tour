// A* 延續參考套件的尋路概念；這裡使用人工整理的示意路網，無實測距離或高程。
export interface Waypoint {
  id: string;
  x: number;
  z: number;
}
export const nodes: Waypoint[] = [
  { id: "entry", x: 4, z: 150 },
  { id: "b", x: 4, z: 115 },
  { id: "l3", x: -38, z: 110 },
  { id: "l2", x: -38, z: 50 },
  { id: "l1", x: -38, z: -20 },
  { id: "l0", x: -38, z: -80 },
  { id: "c0", x: 20, z: -80 },
  { id: "c1", x: 20, z: -20 },
  { id: "c2", x: 20, z: 12 },
  { id: "c3", x: 20, z: 64 },
  { id: "r0", x: 70, z: -80 },
  { id: "r1", x: 70, z: 12 },
  { id: "r2", x: 70, z: 70 },
  { id: "r3", x: 70, z: 115 },
];
export const edges = [
  ["entry", "b"],
  ["b", "l3"],
  ["b", "r3"],
  ["b", "c3"],
  ["l3", "l2"],
  ["l2", "l1"],
  ["l1", "l0"],
  ["l0", "c0"],
  ["c0", "r0"],
  ["r0", "r1"],
  ["r1", "r2"],
  ["r2", "r3"],
  ["c0", "c1"],
  ["c1", "c2"],
  ["c2", "c3"],
  ["c3", "r2"],
  ["c2", "r1"],
  ["l2", "c3"],
  ["l1", "c1"],
];
export function astar(start: string, end: string): Waypoint[] {
  const lookup = new Map(nodes.map((n) => [n.id, n]));
  if (!lookup.has(start) || !lookup.has(end)) return [];
  const distance = (a: string, b: string) =>
    Math.hypot(
      lookup.get(a)!.x - lookup.get(b)!.x,
      lookup.get(a)!.z - lookup.get(b)!.z,
    );
  const open = new Set([start]),
    came = new Map<string, string>(),
    g = new Map([[start, 0]]);
  while (open.size) {
    const current = [...open].sort(
      (a, b) => g.get(a)! + distance(a, end) - (g.get(b)! + distance(b, end)),
    )[0];
    if (current === end) {
      const path = [current];
      while (came.has(path[0])) path.unshift(came.get(path[0])!);
      return path.map((id) => lookup.get(id)!);
    }
    open.delete(current);
    for (const [a, b] of edges) {
      const next = a === current ? b : b === current ? a : null;
      if (!next) continue;
      const score = g.get(current)! + distance(current, next);
      if (score < (g.get(next) ?? Infinity)) {
        came.set(next, current);
        g.set(next, score);
        open.add(next);
      }
    }
  }
  return [];
}
