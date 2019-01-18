import { makeViewerEvent, testOptions } from "../../test/test-util";
import { commandsListener } from "./commands-listener";
import { Query } from "./query/query";

describe("commandsListener", () => {
  test("it should be able to list a viewer's achievements in chat", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest
        .fn()
        .mockResolvedValue({ name: "Someone", achievements: ["cheerleader"] })
    };
    const listener = commandsListener(
      (query as unknown) as Query,
      sendChatMessage,
      testOptions
    );

    await listener(
      makeViewerEvent({
        type: "sent-chat-message",
        message: { achievementsCommand: true }
      })
    );

    expect(sendChatMessage).toHaveBeenCalledWith(
      "Congratulations Someone for your achievements: Cheerleader"
    );
  });

  test("it should throw if it cannot get the viewer state", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest.fn().mockResolvedValue(undefined)
    };
    const listener = commandsListener(
      (query as unknown) as Query,
      sendChatMessage,
      testOptions
    );

    await expect(
      listener(
        makeViewerEvent({
          type: "sent-chat-message",
          message: { achievementsCommand: true }
        })
      )
    ).rejects.toThrow("couldnt get the viewer 123");
  });
});
