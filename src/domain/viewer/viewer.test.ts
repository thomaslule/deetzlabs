import { makeViewerEvent, testOptions } from "../../../test/test-util";
import { gotAchievement, sentChatMessage } from "./events";
import { getDecisionReducer, Viewer } from "./viewer";

describe("Viewer", () => {

  function getViewer(publish, decisionState = {}) {
    return new Viewer(
      "123",
      {
        decision: {
          name: "Someone", achievementsReceived: [], achievementsProgress: {}, topClipper: false, ...decisionState,
        },
        sequence: -1,
      },
      publish,
      testOptions,
    );
  }

  const viewerEvent = {
    aggregate: "viewer", id: "123", sequence: expect.anything(), version: 1, date: expect.anything(),
  };

  test("it should be able to distribute 2 achievements on the same event", async () => {
    const publish = jest.fn();
    const achievementFollow = {
      name: "", text: "", description: "", distributeWhen: (state, event) => event.type === "followed",
    };
    const options = {
      ...testOptions,
      achievements: {
        test1: achievementFollow,
        test2: achievementFollow,
      },
    };
    const viewer = new Viewer(
      "123",
      {
        decision: {
          name: "Someone", achievementsReceived: [], achievementsProgress: {}, topClipper: false,
        },
        sequence: -1,
      },
      publish,
      options,
    );
    await viewer.follow();
    expect(publish).toHaveBeenCalledTimes(3);
    expect(publish).toHaveBeenCalledWith(
      { ...viewerEvent, type: "got-achievement", achievement: "test1" }, expect.anything(),
    );
    expect(publish).toHaveBeenCalledWith(
      { ...viewerEvent, type: "got-achievement", achievement: "test2" }, expect.anything(),
    );
  });

  describe("donate", () => {
    test("it should throw if amount is not a number or a number <= 0", async () => {
      const someone = getViewer(jest.fn());

      await expect(someone.donate(0)).rejects.toThrow();
      await expect(someone.donate("12" as any as number)).rejects.toThrow();
    });
  });

  describe("cheer", () => {
    test("it should throw if amount is not a number or a number <= 0", async () => {
      const someone = getViewer(jest.fn());

      await expect(someone.cheer(0, "hi")).rejects.toThrow();
      await expect(someone.cheer("12" as any as number, "hi")).rejects.toThrow();
    });

    test("it should publish deserved achievements", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.cheer(500, "hi");

      expect(publish).toHaveBeenCalledWith(
        { ...viewerEvent, type: "got-achievement", achievement: "cheerleader" }, expect.anything(),
      );
    });

    test("it shouldnt publish already obtained achievements", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish, { achievementsReceived: ["cheerleader"] });

      await someone.cheer(500, "hi");

      expect(publish).toHaveBeenCalledTimes(2); // cheered and sent-chat-message
    });

  });

  describe("setName", () => {
    test("it should set a new viewer's name", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish, { name: undefined });

      await someone.setName("Someone");

      expect(publish).toHaveBeenCalledWith({
        ...viewerEvent,
        type: "changed-name",
        name: "Someone",
      }, expect.anything());
    });

    test("it shouldnt do anything when the name is the same", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.setName("Someone");

      expect(publish).not.toHaveBeenCalled();
    });
  });

  describe("subscribe", () => {
    test("it should publish a sent-chat-message and a subscribed event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.subscribe("1000", "hi");

      expect(publish).toHaveBeenCalledTimes(2);
      expect(publish.mock.calls[0][0]).toMatchObject({ type: "subscribed", version: 3, plan: "1000" });
      expect(publish.mock.calls[1][0]).toMatchObject({ type: "sent-chat-message" });
    });

    test("it should not publish a sent-chat-message event when there is no message", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.subscribe("1000");

      expect(publish).toHaveBeenCalledTimes(1);
      expect(publish.mock.calls[0][0]).toMatchObject({ type: "subscribed", version: 3, plan: "1000" });
    });
  });

  describe("resub", () => {
    test("it should publish a sent-chat-message and a resubscribed event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.resub(6, "1000", "hi");

      expect(publish).toHaveBeenCalledTimes(2);
      expect(publish.mock.calls[0][0]).toMatchObject(
        { type: "resubscribed", version: 3, months: 6, plan: "1000" },
      );
      expect(publish.mock.calls[1][0]).toMatchObject({ type: "sent-chat-message" });
    });
  });

  describe("giveSub", () => {
    test("it should publish a gaveSub event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.giveSub("456", "1000");

      expect(publish.mock.calls[0][0]).toMatchObject({ type: "gave-sub", version: 3, recipient: "456", plan: "1000" });
    });
  });

  describe("host", () => {
    test("it should publish a hosted event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.host(15);

      expect(publish.mock.calls[0][0]).toMatchObject({ type: "hosted", nbViewers: 15 });
    });
  });

  describe("raid", () => {
    test("it should publish a raided event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.raid(15);

      expect(publish.mock.calls[0][0]).toMatchObject({ type: "raided", nbViewers: 15 });
    });
  });

  describe("follow", () => {
    test("it should publish a followed event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.follow();

      expect(publish.mock.calls[0][0]).toMatchObject({ type: "followed" });
    });
  });

  describe("topClipper", () => {
    test("it should publish a became-top-clipper event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.topClipper();

      expect(publish.mock.calls[0][0]).toMatchObject({ type: "became-top-clipper" });
    });

    test("it should not publish a became-top-clipper event if already top clipper", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish, { topClipper: true });

      await someone.topClipper();

      expect(publish).not.toHaveBeenCalled();
    });
  });

  describe("notTopClipper", () => {
    test("it should publish a lost-top-clipper event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish, { topClipper: true });

      await someone.notTopClipper();

      expect(publish.mock.calls[0][0]).toMatchObject({ type: "lost-top-clipper" });
    });

    test("it should not publish a lost-top-clipper event if wasnt top clipper", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.notTopClipper();

      expect(publish).not.toHaveBeenCalled();
    });
  });

});

describe("getDecisionReducer", () => {
  test("the reducer should add the distributed events to the state", () => {
    const reducer = getDecisionReducer(testOptions);
    const state = reducer(undefined, gotAchievement("cheerleader"));
    expect(state.achievementsReceived).toEqual(["cheerleader"]);
  });

  test("the reducer should update the achievement progress in the state", () => {
    const reducer = getDecisionReducer(testOptions);

    const state1 = reducer(undefined, sentChatMessage({}));
    expect(state1.achievementsProgress.supporter).toEqual(0);

    const state2 = reducer(state1, sentChatMessage({ gg: true }));
    expect(state2.achievementsProgress.supporter).toEqual(1);

    const state3 = reducer(state2, sentChatMessage({ gg: true }));
    expect(state3.achievementsProgress.supporter).toEqual(2);
  });

  test("the reducer shouldnt return anything for achievements without reducers", () => {
    const reducer = getDecisionReducer(testOptions);
    const state = reducer(undefined, sentChatMessage({}));
    expect(state.achievementsProgress.cheerleader).toBeUndefined();
  });

  test("the reducer shouldnt return anything for achievements already obtained", () => {
    const reducer = getDecisionReducer(testOptions);
    const state1 = reducer(undefined, gotAchievement("supporter"));
    const state2 = reducer(state1, sentChatMessage({ gg: true }));
    expect(state2.achievementsProgress.supporter).toBeUndefined();
  });

  test("the reducer should add the achievements in the state from a migrated-data event", () => {
    const reducer = getDecisionReducer(testOptions);
    const state = reducer(undefined, makeViewerEvent({
      type: "migrated-data",
      achievements: [
        { achievement: "cheerleader", date: new Date().toISOString() },
        { achievement: "supporter", date: new Date().toISOString() },
      ],
    }));
    expect(state.achievementsReceived).toEqual(["cheerleader", "supporter"]);
  });
});
