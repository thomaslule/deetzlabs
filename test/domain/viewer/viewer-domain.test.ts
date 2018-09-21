import { EventBus, InMemoryEventStorage } from "es-objects";
import { ViewerDomain } from "../../../src/domain/viewer/viewer-domain";
import { Storage } from "../../../src/storage";
import { testOptions } from "../../test-util";

describe("ViewerDomain", () => {
  test("it should respond to !commands command", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const sendChatMessage = jest.fn();
    const domain = new ViewerDomain(bus, sendChatMessage, new Storage(), testOptions);
    const someone = await domain.get("someone");

    await someone.chatMessage("not the command", "Someone");
    expect(sendChatMessage).not.toHaveBeenCalled();

    await someone.chatMessage("!commands", "Someone");
    expect(sendChatMessage).toHaveBeenCalledWith("Say !achievements to see your current achievements");
  });

  test("it should respond to !achievements command", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const sendChatMessage = jest.fn();
    const domain = new ViewerDomain(bus, sendChatMessage, new Storage(), testOptions);
    const someone = await domain.get("someone");
    await someone.chatMessage("hi", "Someone");
    await someone.giveAchievement("cheerleader");

    await someone.chatMessage("!achievements", "Someone");

    expect(sendChatMessage).toHaveBeenCalledWith("Congratulations Someone for your achievements: Cheerleader");
  });

  test("it should show achievements", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const domain = new ViewerDomain(bus, () => {}, new Storage(), testOptions);
    const showAchievement = jest.fn();
    bus.onEvent((event) => {
      if (event.aggregate === "viewer" && event.type === "got-achievement") {
        showAchievement(event.id, event.achievement);
      }
    });
    const someone = await domain.get("someone");

    await someone.cheer(500);

    expect(showAchievement).toHaveBeenCalledWith("someone", "cheerleader");
  });
});
