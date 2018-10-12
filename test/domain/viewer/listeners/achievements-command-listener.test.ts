import { InMemoryKeyValueStorage } from "es-objects";
import { AchievementsCommandListenener } from "../../../../src/domain/viewer/listeners/achievements-command-listener";
import { ViewerProjection } from "../../../../src/domain/viewer/projections/viewer-projection";
import { makeViewerEvent, testOptions } from "../../../test-util";

describe("AchievementsCommandListener", () => {
  test("it should list a viewer's achievements in chat", async () => {
    const sendChatMessage = jest.fn();
    const listener = new AchievementsCommandListenener(
      new ViewerProjection(
        new InMemoryKeyValueStorage({ 123: { id: "123", name: "Someone", achievements: ["cheerleader"]}}),
      ),
      sendChatMessage,
      testOptions,
    );

    await listener.handleEvent(makeViewerEvent({ type: "sent-chat-message", message: { achievementsCommand: true } }));

    expect(sendChatMessage).toHaveBeenCalledWith("Congratulations Someone for your achievements: Cheerleader");
  });

  test("it should respond to a viewer without achievements", async () => {
    const sendChatMessage = jest.fn();
    const listener = new AchievementsCommandListenener(
      new ViewerProjection(
        new InMemoryKeyValueStorage({ 123: { id: "123", name: "Someone", achievements: []}}),
      ),
      sendChatMessage,
      testOptions,
    );

    await listener.handleEvent(makeViewerEvent({ type: "sent-chat-message", message: { achievementsCommand: true }}));

    expect(sendChatMessage).toHaveBeenCalledWith("Someone doesn't have any achievement but their time will come!");
  });

  test("it should throw if it cannot get the viewer state", async () => {
    const listener = new AchievementsCommandListenener(
      new ViewerProjection(new InMemoryKeyValueStorage()),
      jest.fn(),
      testOptions,
    );

    await expect(listener.handleEvent(
      makeViewerEvent({ type: "sent-chat-message", message: { achievementsCommand: true }}),
    ))
      .rejects.toThrow("couldnt get the viewer 123");
  });
});
