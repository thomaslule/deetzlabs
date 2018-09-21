import { InMemoryValueStorage } from "es-objects";
import { NamesProjection } from "../../../../src/domain/viewer/projections/names-projection";
import { makeEvent } from "../../../test-util";

describe("ViewerAchievementsProjection", () => {
  test("it should store the distributed achievements", async () => {
    const proj = new NamesProjection(new InMemoryValueStorage());

    expect(await proj.get()).toEqual({});

    await proj.handleEvent(makeEvent({ type: "changed-name", name: "Someone" }));
    expect(await proj.get()).toEqual({ 123: "Someone" });

    await proj.handleEvent(makeEvent({ type: "changed-name", name: "SomeonE" }));
    expect(await proj.get()).toEqual({ 123: "SomeonE" });

    await proj.handleEvent(makeEvent({ id: 456, type: "changed-name", name: "Other" }));
    expect(await proj.get()).toEqual({ 123: "SomeonE", 456: "Other" });
  });
});
