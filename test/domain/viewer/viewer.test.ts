import { gotAchievement, sentChatMessage } from "../../../src/domain/viewer/events";
import { getDecisionReducer, Viewer } from "../../../src/domain/viewer/viewer";
import { testOptions } from "../../test-util";

describe("Viewer", () => {
  describe("cheer", () => {
    test("it should publish deserved achievements", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const someone = new Viewer(
        "123", { name: "Someone", achievementsReceived: [], achievementsProgress: {} }, publish, testOptions,
      );

      await someone.cheer(500);

      expect(publish).toHaveBeenCalledTimes(2);
      expect(publish).toHaveBeenCalledWith({ type: "cheered", amount: 500, version: 1 });
      expect(publish).toHaveBeenCalledWith({ type: "got-achievement", achievement: "cheerleader", version: 1 });
    });

    test("it shouldnt publish already obtained achievements", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const decisionState = { name: "Someone", achievementsReceived: ["cheerleader"], achievementsProgress: {} };
      const someone = new Viewer("123", decisionState, publish, testOptions);

      await someone.cheer(500);

      expect(publish).toHaveBeenCalledTimes(1);
      expect(publish).toHaveBeenCalledWith({ type: "cheered", amount: 500, version: 1 });
    });

  });

  describe("changeName", () => {
    test("it should set a new viewer's name", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const decisionState = { name: undefined, achievementsReceived: [], achievementsProgress: {} };
      const someone = new Viewer("123", decisionState, publish, testOptions);

      await someone.changeName("Someone");

      expect(publish).toHaveBeenCalledWith({ type: "changed-name", name: "Someone", version: 1 });
    });

    test("it shouldnt do anything when the name is the same", async () => {
      const publish = jest.fn().mockImplementation((event) => event);
      const decisionState = { name: "Someone", achievementsReceived: [], achievementsProgress: {} };
      const someone = new Viewer("123", decisionState, publish, testOptions);

      await someone.changeName("Someone");

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
});
