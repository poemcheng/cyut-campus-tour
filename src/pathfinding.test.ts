import { astar, nodes, type RouteMode } from "./pathfinding.ts";
import {
  outdoorLinks,
  linkLength,
  linkBetween,
  linkPolyline,
  terrainHeight,
  placeLevel,
  buildingSpecs,
  stepCount,
} from "./structure.ts";
import { campusPlaces } from "./data.ts";
const assert = (v: boolean, m: string) => {
  if (!v) throw new Error(m);
};
for (const mode of ["walk", "avoid-stairs"] as RouteMode[])
  for (const a of nodes)
    for (const b of nodes) {
      const path = astar(a.id, b.id, mode);
      assert(
        path[0]?.id === a.id && path.at(-1)?.id === b.id,
        "All route endpoints must be reachable",
      );
      let cost = 0;
      for (let i = 1; i < path.length; i++) {
        const link = linkBetween(path[i - 1].id, path[i].id);
        assert(Boolean(link), "Route cannot jump between disconnected nodes");
        assert(
          mode !== "avoid-stairs" || link!.kind !== "stairs",
          "Avoid-stairs route must contain no stair links",
        );
        cost += linkLength(link!);
      }
      const ds = new Map(
        nodes.map((n) => [n.id, n.id === a.id ? 0 : Infinity]),
      );
      for (let k = 0; k < nodes.length; k++)
        for (const link of outdoorLinks) {
          if (mode === "avoid-stairs" && link.kind === "stairs") continue;
          const d = linkLength(link);
          ds.set(link.b, Math.min(ds.get(link.b)!, ds.get(link.a)! + d));
          ds.set(link.a, Math.min(ds.get(link.a)!, ds.get(link.b)! + d));
        }
      assert(
        Math.abs(cost - ds.get(b.id)!) < 1e-6,
        "3D A* route must match independent shortest path cost",
      );
    }
for (const link of outdoorLinks) {
  const ps = linkPolyline(link);
  assert(
    ps.every((p) => [p.x, p.y, p.z].every(Number.isFinite)),
    "Finite 3D path points",
  );
  if (link.kind === "stairs")
    for (let i = 1; i < ps.length; i++) {
      assert(
        Math.abs(ps[i].y - ps[i - 1].y) / stepCount(ps[i - 1], ps[i]) <=
          0.170001,
        "Inferred risers must remain consistent",
      );
      if (link.confirmedLocation)
        assert(
          (ps[i].y - ps[i - 1].y) * (ps.at(-1)!.y - ps[0].y) >= 0,
          "A single confirmed stair section must not reverse elevation",
        );
    }
}
for (const p of campusPlaces.filter((p) => buildingSpecs[p.id]))
  for (const dx of [-p.w / 2, 0, p.w / 2])
    for (const dz of [-p.d / 2, 0, p.d / 2])
      assert(
        Math.abs(terrainHeight(p.x + dx, p.z + dz) - placeLevel(p)) < 0.001,
        `Building platform must be flat under ${p.id}`,
      );
assert(astar("unknown", "entry").length === 0, "Unknown node handled");
console.log(
  `PASS: ${nodes.length ** 2 * 2} 3D route pairs, shortest paths, stairs exclusion, continuous path points, riser consistency and flat building foundations.`,
);
