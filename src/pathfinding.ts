import {
  outdoorNodes,
  outdoorLinks,
  linkLength,
  distance3,
  type OutdoorNode,
} from "./structure.ts";
export type Waypoint = OutdoorNode;
export type RouteMode = "walk" | "avoid-stairs";
export const nodes = outdoorNodes;
export const edges = outdoorLinks.map((l) => [l.a, l.b]);
export function astar(
  start: string,
  end: string,
  mode: RouteMode = "walk",
): Waypoint[] {
  const lookup = new Map(nodes.map((n) => [n.id, n]));
  if (!lookup.has(start) || !lookup.has(end)) return [];
  const open = new Set([start]),
    came = new Map<string, string>(),
    g = new Map([[start, 0]]);
  const heuristic = (id: string) =>
    distance3(lookup.get(id)!, lookup.get(end)!);
  while (open.size) {
    const current = [...open].sort(
      (a, b) => g.get(a)! + heuristic(a) - g.get(b)! - heuristic(b),
    )[0];
    if (current === end) {
      const path = [current];
      while (came.has(path[0])) path.unshift(came.get(path[0])!);
      return path.map((id) => lookup.get(id)!);
    }
    open.delete(current);
    for (const link of outdoorLinks) {
      if (mode === "avoid-stairs" && link.kind === "stairs") continue;
      const next =
        link.a === current ? link.b : link.b === current ? link.a : null;
      if (!next) continue;
      const score = g.get(current)! + linkLength(link);
      if (score < (g.get(next) ?? Infinity)) {
        came.set(next, current);
        g.set(next, score);
        open.add(next);
      }
    }
  }
  return [];
}
export function routeSummary(stops: { node: string }[], mode: RouteMode) {
  let stairs = 0,
    slopes = 0;
  for (let i = 1; i < stops.length; i++) {
    const route = astar(stops[i - 1].node, stops[i].node, mode);
    for (let j = 1; j < route.length; j++) {
      const link = outdoorLinks.find(
        (l) =>
          (l.a === route[j - 1].id && l.b === route[j].id) ||
          (l.b === route[j - 1].id && l.a === route[j].id),
      );
      if (link?.kind === "stairs") stairs++;
      if (link?.kind === "slope") slopes++;
    }
  }
  return { stairs, slopes };
}
