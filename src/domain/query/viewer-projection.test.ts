import { Pool } from "pg";
import { getCleanDb, makeViewerEvent } from "../../../test/test-util";
import { PgViewerStorage } from "../../storage/pg-viewer-storage";
import { ViewerProjection } from "./viewer-projection";

describe("ViewersProjection", () => {
  let db: Pool;
  beforeEach(async () => {
    db = await getCleanDb();
  });
  afterEach(async () => {
    await db.end();
  });

  test("migrate-data events should update the achievements view", async () => {
    const storage = new PgViewerStorage(db);
    const proj = new ViewerProjection(storage);
    const cheerleaderDate = new Date(2018, 1, 1);
    const supporterDate = new Date(2018, 1, 2);
    await proj.handleEvent(
      makeViewerEvent({ type: "changed-name", name: "Someone" })
    );
    await proj.handleEvent(
      makeViewerEvent({
        type: "migrated-data",
        achievements: [
          { achievement: "cheerleader", date: cheerleaderDate.toISOString() },
          { achievement: "supporter", date: supporterDate.toISOString() }
        ]
      })
    );
    const stored = await storage.getAllAchievements();
    expect(stored).toEqual([
      {
        achievement: "cheerleader",
        viewerId: "123",
        viewerName: "Someone",
        date: cheerleaderDate
      },
      {
        achievement: "supporter",
        viewerId: "123",
        viewerName: "Someone",
        date: supporterDate
      }
    ]);
  });
});
