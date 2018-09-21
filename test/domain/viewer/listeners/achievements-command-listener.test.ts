import { InMemoryKeyValueStorage } from "es-objects";
import { AchievementsCommandListenener } from "../../../../src/domain/viewer/listeners/achievements-command-listener";
import { DisplayNameProjection } from "../../../../src/domain/viewer/projections/display-name-projection";
import { ViewerAchievementsProjection } from "../../../../src/domain/viewer/projections/viewer-achievements-projection";
import { makeEvent, testOptions } from "../../../test-util";

describe("AchievementsCommandListener", () => {
  test("it should list a viewer's achievements in chat", async () => {
    const sendChatMessage = jest.fn();
    const listener = new AchievementsCommandListenener(
      new ViewerAchievementsProjection(new InMemoryKeyValueStorage({ 123: ["cheerleader"] })),
      new DisplayNameProjection(new InMemoryKeyValueStorage({ 123: "Someone" })),
      sendChatMessage,
      testOptions,
    );

    await listener.handleEvent(makeEvent({ type: "sent-chat-message", message: { achievementsCommand: true } }));

    expect(sendChatMessage).toHaveBeenCalledWith("Congratulations Someone for your achievements: Cheerleader");
  });

  test("it should respond to a viewer without achievements", async () => {
    const sendChatMessage = jest.fn();
    const listener = new AchievementsCommandListenener(
      new ViewerAchievementsProjection(new InMemoryKeyValueStorage({123: []})),
      new DisplayNameProjection(new InMemoryKeyValueStorage({123: "Someone"})),
      sendChatMessage,
      testOptions,
    );

    await listener.handleEvent(makeEvent({ type: "sent-chat-message", message: { achievementsCommand: true }}));

    expect(sendChatMessage).toHaveBeenCalledWith("Someone doesn't have any achievement but their time will come!");
  });

  test("it should throw if it cannot get the displayName", async () => {
    const listener = new AchievementsCommandListenener(
      new ViewerAchievementsProjection(new InMemoryKeyValueStorage({123: ["cheerleader"]})),
      new DisplayNameProjection(new InMemoryKeyValueStorage()),
      jest.fn(),
      testOptions,
    );

    expect(listener.handleEvent(makeEvent({ type: "sent-chat-message", message: { achievementsCommand: true }})))
      .rejects.toThrow("couldnt get the displayName for viewer 123");
  });
});
