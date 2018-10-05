import { EventBus, InMemoryEventStorage } from "es-objects";
import { ViewerDomain } from "../../../src/domain/viewer/viewer-domain";
import { InMemoryStorage } from "../../in-memory-storage";
import { testOptions } from "../../test-util";

describe("ViewerDomain", () => {
  test("it should respond to !commands command", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const sendChatMessage = jest.fn();
    const domain = new ViewerDomain(bus, sendChatMessage, new InMemoryStorage(), testOptions);
    const someone = await domain.get("123");

    await someone.chatMessage("not the command");
    expect(sendChatMessage).not.toHaveBeenCalled();

    await someone.chatMessage("!commands");
    expect(sendChatMessage).toHaveBeenCalledWith("Say !achievements to see your current achievements");
  });

  test("it should respond to !achievements command", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const sendChatMessage = jest.fn();
    const domain = new ViewerDomain(bus, sendChatMessage, new InMemoryStorage(), testOptions);
    const someone = await domain.get("123");
    await someone.giveAchievement("cheerleader", "Someone");

    await someone.chatMessage("!achievements");

    expect(sendChatMessage).toHaveBeenCalledWith("Congratulations Someone for your achievements: Cheerleader");
  });

  test("it should show achievements", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const domain = new ViewerDomain(bus, () => {}, new InMemoryStorage(), testOptions);
    const showAchievement = jest.fn();
    bus.onEvent((event) => {
      if (event.aggregate === "viewer" && event.type === "got-achievement") {
        showAchievement(event.id, event.achievement);
      }
    });
    const someone = await domain.get("123");

    await someone.cheer(500);

    expect(showAchievement).toHaveBeenCalledWith("123", "cheerleader");
  });
});
