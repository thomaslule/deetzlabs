import { makeViewerEvent, testOptions } from "../../test/test-util";
import { commandsListener } from "./commands-listener";
import { Query } from "./query/query";

describe("commandsListener", () => {
  test("it should be able to list a viewer's achievements in chat", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest.fn().mockResolvedValue({
        name: "Someone",
        achievements: ["cheerleader"],
        banned: false
      })
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

  test("it should be able to react to follow events", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest.fn().mockResolvedValue({
        name: "Someone",
        achievements: [],
        banned: false
      })
    };
    const listener = commandsListener(
      (query as unknown) as Query,
      sendChatMessage,
      testOptions
    );

    await listener(makeViewerEvent({ type: "followed" }));

    expect(sendChatMessage).toHaveBeenCalledWith("Welcome Someone!");
  });

  test("it should not react to banned viewers' events", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest.fn().mockResolvedValue({
        name: "Someone",
        achievements: [],
        banned: true
      })
    };
    const listener = commandsListener(
      (query as unknown) as Query,
      sendChatMessage,
      testOptions
    );

    await listener(makeViewerEvent({ type: "got-ban" }));
    await listener(makeViewerEvent({ type: "followed" }));

    expect(sendChatMessage).not.toHaveBeenCalled();
  });
});
