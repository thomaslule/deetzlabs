import { gotAchievement, sentChatMessage } from "../../../src/domain/viewer/events";
import { getDecisionReducer, Viewer } from "../../../src/domain/viewer/viewer";
import { testOptions } from "../../test-util";

describe("Viewer", () => {
  test("it should publish deserved achievements", async () => {
    const publish = jest.fn().mockImplementation((event) => event);
    const someone = new Viewer("someone", { achievementsReceived: [], achievementsProgress: {} }, publish, testOptions);

    await someone.cheer(500);

    expect(publish).toHaveBeenCalledTimes(2);
    expect(publish).toHaveBeenCalledWith({ type: "cheered", amount: 500, version: 1 });
    expect(publish).toHaveBeenCalledWith({ type: "got-achievement", achievement: "cheerleader", version: 1 });
  });

  test("it shouldnt publish already obtained achievements", async () => {
    const publish = jest.fn().mockImplementation((event) => event);
    const decisionState = { achievementsReceived: ["cheerleader"], achievementsProgress: {} };
    const someone = new Viewer("someone", decisionState, publish, testOptions);

    await someone.cheer(500);

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith({ type: "cheered", amount: 500, version: 1 });
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

    const state1 = reducer(undefined, sentChatMessage({}, "Someone"));
    expect(state1.achievementsProgress.supporter).toEqual(0);

    const state2 = reducer(state1, sentChatMessage({ gg: true }, "Someone"));
    expect(state2.achievementsProgress.supporter).toEqual(1);

    const state3 = reducer(state2, sentChatMessage({ gg: true }, "Someone"));
    expect(state3.achievementsProgress.supporter).toEqual(2);
  });

  test("the reducer shouldnt return anything for achievements without reducers", () => {
    const reducer = getDecisionReducer(testOptions);
    const state = reducer(undefined, sentChatMessage({}, "Someone"));
    expect(state.achievementsProgress.cheerleader).toBeUndefined();
  });

  test("the reducer shouldnt return anything for achievements already obtained", () => {
    const reducer = getDecisionReducer(testOptions);
    const state1 = reducer(undefined, gotAchievement("supporter"));
    const state2 = reducer(state1, sentChatMessage({ gg: true }, "Someone"));
    expect(state2.achievementsProgress.supporter).toBeUndefined();
  });
});
