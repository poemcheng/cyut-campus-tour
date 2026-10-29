import { places, campusPlaces, halls, matchesPlace } from "./data.ts";
import { nodes } from "./pathfinding.ts";
const assert = (v: boolean, m: string) => {
  if (!v) throw new Error(m);
};
assert(
  new Set(places.map((p) => p.id)).size === places.length,
  "Place IDs must be unique",
);
assert(halls.length === 13, "All thirteen verified halls must be included");
const expectedRooms = [
  "T1-206",
  "D-127",
  "T2-305",
  "T2-405",
  "T2-606",
  "E-103",
  "T2-104",
  "D-202",
  "D-203",
  "D-204",
  "V-501",
];
for (const room of expectedRooms)
  assert(
    halls.some((h) => h.room === room),
    `Missing hall ${room}`,
  );
for (const h of halls) {
  const parent = campusPlaces.find((p) => p.id === h.parentId);
  assert(Boolean(parent), `Missing parent for ${h.id}`);
  assert(Boolean(h.floor), "Hall floor required");
  assert(
    nodes.some((n) => n.id === h.node),
    "Hall must connect to campus route network",
  );
  assert(
    h.x === parent!.x && h.z === parent!.z,
    "Indoor halls use the parent building, not a separate footprint",
  );
  assert(
    h.source.startsWith("https://") &&
      new URL(h.source).hostname.endsWith("cyut.edu.tw"),
    "Hall must have official evidence",
  );
}
assert(
  matchesPlace(halls.find((h) => h.room === "D-203")!, "d203"),
  "Room search without dash",
);
assert(
  matchesPlace(halls.find((h) => h.room === "T2-104")!, "T2 104"),
  "Room search with spaces",
);
assert(
  halls.filter((h) => matchesPlace(h, "演講廳")).length === 13,
  "All halls discoverable through lecture hall search",
);
console.log(
  "PASS: 30 unique places, 13 verified halls, 11 room codes, parent building and route links, official evidence, normalized search.",
);
