import { testOptions } from "../../../test/test-util";
import { TestViewer } from "./test-viewer";

describe("TestViewer", () => {
  test("it makes achievement testing easy", async () => {
    const viewer = new TestViewer(testOptions);
    expect(viewer.currentAchievements()).toEqual([]);
    await viewer.cheer(100, "Cheer100 !");
    expect(viewer.currentAchievements()).toEqual(["cheerleader"]);
    await viewer.chatMessage("gg");
    await viewer.chatMessage("gg");
    await viewer.chatMessage("gg");
    await viewer.chatMessage("gg");
    expect(viewer.hasAchievement("supporter")).toBeFalsy();
    await viewer.chatMessage("gg");
    expect(viewer.hasAchievement("supporter")).toBeTruthy();
  });

  test("handleCustomEvent allows to send a manually constructed event", async () => {
    const viewer = new TestViewer(testOptions);
    await viewer.handleCustomEvent({
      version: 1,
      type: "cheered",
      date: "2018-01-01T12:00:00.000Z",
      amount: 500
    });
    expect(viewer.hasAchievement("cheerleader")).toBeTruthy();
  });
});
