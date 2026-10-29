import * as T from "three";
import { createCampusModel } from "./campusModel";
import { buildingSpecs } from "./structure";
const assert = (value: boolean, message: string) => {
  if (!value) throw new Error(message);
};
const model = createCampusModel(2);
assert(
  model.buildings.size === 11,
  "All eleven campus building structures must exist",
);
for (const [id, building] of model.buildings) {
  const spec = buildingSpecs[id];
  assert(
    building.floors.size === spec.floors + spec.basements,
    `All floors and basements must be built for ${id}`,
  );
  assert(
    building.root.position.y === spec.level * 2,
    `Building must sit at its terrain platform: ${id}`,
  );
}
const terrain = model.root.children[0] as T.Mesh;
const complete = terrain.geometry.index!.count;
model.setSection("design", 2);
const design = model.buildings.get("design")!;
assert(
  !design.roof.visible && !design.floors.get(3)!.root.visible,
  "Cutaway must remove roof and floors above selection",
);
assert(
  design.floors.get(2)!.root.visible && !design.floors.get(2)!.shell.visible,
  "Cutaway must expose selected floor skeleton",
);
model.setSection("design", -1);
assert(
  terrain.geometry.index!.count < complete,
  "Basement cutaway must open the terrain instead of burying the selected floor",
);
model.setSection("design", null);
assert(
  terrain.geometry.index!.count === complete && design.roof.visible,
  "Closing cutaway must restore terrain and roof",
);
model.root.updateMatrixWorld(true);
const bounds = new T.Box3().setFromObject(model.root);
assert(
  bounds.max.y > 60 && bounds.min.y < 0,
  "Model must include uphill terrain and below-ground structure",
);
let meshes = 0;
const materials = new Set<T.Material>();
model.root.traverse((o) => {
  const m = o as T.Mesh;
  if (!m.geometry) return;
  meshes++;
  const p = m.geometry.getAttribute("position");
  for (let i = 0; i < p.count; i++)
    assert(
      Number.isFinite(p.getX(i)) &&
        Number.isFinite(p.getY(i)) &&
        Number.isFinite(p.getZ(i)),
      "No invalid geometry coordinates",
    );
  m.geometry.dispose();
  if (m.material)
    for (const material of Array.isArray(m.material)
      ? m.material
      : [m.material])
      materials.add(material);
});
materials.forEach((m) => m.dispose());
assert(
  meshes < 650,
  "Merged structure geometry must stay within mobile-friendly draw-call budget",
);
console.log(
  `PASS: eleven building structures, all floors and basements, floor visibility, terrain cutaway restoration, finite geometry; ${meshes} merged meshes.`,
);
