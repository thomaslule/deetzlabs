import { Entity, Event, Reducer } from "es-objects";
import mapValues = require("lodash.mapvalues");
import { Options } from "../../get-options";
import { Obj } from "../../util";
import { changedDisplayName, cheered, donated, gotAchievement, sentChatMessage } from "./events";

export class Viewer extends Entity<DecisionState> {
  public constructor(
    id: string,
    decisionState: DecisionState,
    createAndPublish: (eventData: any) => Promise<Event>,
    private options: Options,
  ) {
    super(decisionState, getDecisionReducer(options), createAndPublish);
  }

  public async changeDisplayName(displayName: string) {
    if (displayName !== this.getDecision().displayName) {
      const event = await this.publishAndApply(changedDisplayName(displayName));
      await this.distributeAchievements(event);
    }
  }

  public async chatMessage(message: string, displayName?: string) {
    if (displayName) { await this.changeDisplayName(displayName); }
    const event = await this.publishAndApply(sentChatMessage(this.options.messageToObject(message)));
    await this.distributeAchievements(event);
  }

  public async giveAchievement(achievement: string, displayName?: string) {
    if (this.getDecision().achievementsReceived.includes(achievement)) {
      throw new Error("bad_request user already has achievement");
    }
    if (!this.options.achievements[achievement]) {
      throw new Error("bad_request achievement doesnt exist");
    }
    if (displayName) { await this.changeDisplayName(displayName); }
    await this.publishAndApply(gotAchievement(achievement));
  }

  public async donate(amount: number, displayName?: string) {
    if (displayName) { await this.changeDisplayName(displayName); }
    const event = await this.publishAndApply(donated(amount));
    await this.distributeAchievements(event);
  }

  public async cheer(amount: number, displayName?: string) {
    if (displayName) { await this.changeDisplayName(displayName); }
    const event = await this.publishAndApply(cheered(amount));
    await this.distributeAchievements(event);
  }

  private async distributeAchievements(event: Event) {
    const decision = this.getDecision();
    const publishAchievements =  Object.keys(this.options.achievements)
      .filter((achievement) => !decision.achievementsReceived.includes(achievement))
      .map(async (achievement) => {
        const { distributeWhen } = this.options.achievements[achievement];
        if (distributeWhen(decision.achievementsProgress[achievement], event)) {
          await this.publishAndApply(gotAchievement(achievement));
        }
      });
    await Promise.all(publishAchievements);
  }
}

export interface DecisionState {
  displayName: string | undefined;
  achievementsReceived: string[];
  achievementsProgress: Obj;
}

const initialState = { displayName: undefined, achievementsReceived: [], achievementsProgress: {} };

export function getDecisionReducer(options: Options): Reducer<DecisionState> {
  function getProgressForAchievementsInProgress(state: DecisionState, event: Event): Obj {
    return mapValues(options.achievements, ({ reducer }, achievement) =>
      !state.achievementsReceived.includes(achievement) && reducer
        ? reducer(state.achievementsProgress[achievement], event)
        : undefined,
    );
  }

  return (state = initialState, event) => {
    const achievementsProgress = getProgressForAchievementsInProgress(state, event);
    const achievementsReceived = event.type === "got-achievement"
      ? state.achievementsReceived.concat(event.achievement)
      : state.achievementsReceived;
    const displayName = event.type === "changed-display-name"
      ? event.displayName
      : state.displayName;
    return { displayName, achievementsProgress, achievementsReceived };
  };
}
