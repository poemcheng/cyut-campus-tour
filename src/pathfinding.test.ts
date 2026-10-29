import { astar, nodes, edges } from "./pathfinding.ts";
const assert = (value: boolean, message: string) => {
  if (!value) throw new Error(message);
};
for (const a of nodes)
  for (const b of nodes) {
    const path = astar(a.id, b.id);
    assert(path[0]?.id === a.id && path.at(-1)?.id === b.id, "Route endpoints");
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      assert(
        edges.some((e) => e.includes(path[i - 1].id) && e.includes(path[i].id)),
        "Route uses connected edges",
      );
      cost += Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z);
    }
    const ds = new Map(nodes.map((n) => [n.id, n.id === a.id ? 0 : Infinity]));
    for (let k = 0; k < nodes.length; k++)
      for (const [u, v] of edges) {
        const p = nodes.find((n) => n.id === u)!,
          q = nodes.find((n) => n.id === v)!,
          d = Math.hypot(p.x - q.x, p.z - q.z);
        ds.set(v, Math.min(ds.get(v)!, ds.get(u)! + d));
        ds.set(u, Math.min(ds.get(u)!, ds.get(v)! + d));
      }
    assert(Math.abs(cost - ds.get(b.id)!) < 1e-6, "A* produces shortest route");
  }
assert(astar("unknown", "entry").length === 0, "Unknown node handled");
console.log(
  "PASS: 196 route pairs, graph adjacency, shortest paths, invalid input.",
);
