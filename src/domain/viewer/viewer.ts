import { Entity, Event, Reducer } from "es-objects";
import mapValues = require("lodash.mapvalues");
import { Options } from "../../get-options";
import { Obj } from "../../util";
import { cheered, donated, gotAchievement, sentChatMessage } from "./events";

export class Viewer extends Entity<DecisionState> {
  public constructor(
    id: string,
    decisionState: DecisionState,
    createAndPublish: (eventData: any) => Promise<Event>,
    private options: Options,
  ) {
    super(decisionState, getDecisionReducer(options), createAndPublish);
  }

  public getAggregate() {
    return "viewer";
  }

  public async chatMessage(message: string, displayName: string) {
    const event = await this.publishAndApply(sentChatMessage(this.options.messageToObject(message), displayName));
    await this.distributeAchievements(event);
  }

  public async donate(amount: number) {
    const event = await this.publishAndApply(donated(amount));
    await this.distributeAchievements(event);
  }

  public async cheer(amount: number) {
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
  achievementsReceived: string[];
  achievementsProgress: Obj;
}

const initialState = { achievementsReceived: [], achievementsProgress: {} };

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
    return { achievementsProgress, achievementsReceived };
  };
}
