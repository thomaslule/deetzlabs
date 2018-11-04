import { makeViewerEvent, testOptions } from "../../test/test-util";
import { achievementsCommandListener } from "./achievements-command-listener";
import { Query } from "./query/query";

describe("achievementsCommandListener", () => {
  test("it should list a viewer's achievements in chat", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest.fn().mockResolvedValue({ name: "Someone", achievements: ["cheerleader"]}),
    };
    const listener = achievementsCommandListener(query as unknown as Query, sendChatMessage, testOptions);

    await listener(makeViewerEvent({ type: "sent-chat-message", message: { achievementsCommand: true } }));

    expect(sendChatMessage).toHaveBeenCalledWith("Congratulations Someone for your achievements: Cheerleader");
  });

  test("it should respond to a viewer without achievements", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest.fn().mockResolvedValue({ name: "Someone", achievements: []}),
    };
    const listener = achievementsCommandListener(query as unknown as Query, sendChatMessage, testOptions);

    await listener(makeViewerEvent({ type: "sent-chat-message", message: { achievementsCommand: true }}));

    expect(sendChatMessage).toHaveBeenCalledWith("Someone doesn't have any achievement but their time will come!");
  });

  test("it should throw if it cannot get the viewer state", async () => {
    const sendChatMessage = jest.fn();
    const query = {
      getViewerWithAchievements: jest.fn().mockResolvedValue(undefined),
    };
    const listener = achievementsCommandListener(query as unknown as Query, sendChatMessage, testOptions);

    await expect(listener(
      makeViewerEvent({ type: "sent-chat-message", message: { achievementsCommand: true }}),
    ))
      .rejects.toThrow("couldnt get the viewer 123");
  });
});
