import { gotAchievement, sentChatMessage } from "../../../src/domain/viewer/events";
import { getDecisionReducer, Viewer } from "../../../src/domain/viewer/viewer";
import { testOptions } from "../../test-util";

describe("Viewer", () => {

  function getViewer(publish, decisionState = {}) {
    return new Viewer(
      "123",
      { name: "Someone", achievementsReceived: [], achievementsProgress: {}, topClipper: false, ...decisionState },
      publish,
      testOptions,
    );
  }

  describe("cheer", () => {
    test("it should publish deserved achievements", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.cheer(500, "hi");

      expect(publish).toHaveBeenCalledWith({ type: "got-achievement", achievement: "cheerleader", version: 1 });
    });

    test("it shouldnt publish already obtained achievements", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish, { achievementsReceived: ["cheerleader"] });

      await someone.cheer(500, "hi");

      expect(publish).toHaveBeenCalledTimes(2); // cheered and sent-chat-message
    });

  });

  describe("changeName", () => {
    test("it should set a new viewer's name", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish, { name: undefined });

      await someone.changeName("Someone");

      expect(publish).toHaveBeenCalledWith({ type: "changed-name", name: "Someone", version: 1 });
    });

    test("it shouldnt do anything when the name is the same", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.changeName("Someone");

      expect(publish).not.toHaveBeenCalled();
    });
  });

  describe("subscribe", () => {
    test("it should publish a sent-chat-message and a subscribed event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.subscribe("hi");

      expect(publish).toHaveBeenCalledTimes(2);
      expect(publish.mock.calls[0][0]).toMatchObject({ type: "sent-chat-message" });
      expect(publish.mock.calls[1][0]).toMatchObject({ type: "subscribed" });
    });
  });

  describe("resub", () => {
    test("it should publish a sent-chat-message and a resubscribed event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.resub("hi", 6);

      expect(publish).toHaveBeenCalledTimes(2);
      expect(publish.mock.calls[0][0]).toMatchObject({ type: "sent-chat-message" });
      expect(publish.mock.calls[1][0]).toMatchObject({ type: "resubscribed", months: 6 });
    });
  });

  describe("giveSub", () => {
    test("it should publish a gaveSub event", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = getViewer(publish);

      await someone.giveSub("456");

      expect(publish.mock.calls[0][0]).toMatchObject({ type: "gave-sub", recipient: "456" });
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
});
