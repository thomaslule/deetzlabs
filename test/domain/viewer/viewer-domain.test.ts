import { EventBus, InMemoryEventStorage, InMemoryKeyValueStorage } from "es-objects";
import { ViewerDomain } from "../../../src/domain/viewer/viewer-domain";
import { getOptions } from "../../../src/get-options";

describe("ViewerDomain", () => {
  it("should respond to !commands command", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const sendChatMessage = jest.fn();
    const domain = new ViewerDomain(bus, sendChatMessage, new InMemoryKeyValueStorage(), getOptions());
    const someone = await domain.get("someone");

    await someone.chatMessage("not the command", "Someone", getOptions());
    expect(sendChatMessage).not.toHaveBeenCalled();

    await someone.chatMessage("!commands", "Someone", getOptions());
    expect(sendChatMessage).toHaveBeenCalledWith("Say !achievements to see your current achievements");
  });
});
