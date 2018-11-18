import { DecisionSequence, Entity, Event, Reducer } from "es-objects";
import mapValues = require("lodash.mapvalues");
import ow from "ow";
import { Options } from "../../options";
import { Obj } from "../../util";
import {
  becameTopClipper,
  changedName,
  cheered,
  donated,
  followed,
  gaveSub,
  gotAchievement,
  hosted,
  lostTopClipper,
  raided,
  replayedAchievement,
  resubscribed,
  sentChatMessage,
  subscribed,
} from "./events";

export class Viewer extends Entity<DecisionState> {
  public constructor(
    id: string,
    decisionSequence: DecisionSequence<DecisionState>,
    publish: (event: Event, decisionSequence: DecisionSequence<DecisionState>) => Promise<void>,
    private options: Options,
  ) {
    super(id, decisionSequence, publish);
  }

  public async changeName(name?: string) {
    ow(name, ow.any(ow.nullOrUndefined, ow.string.minLength(1)));
    if (name && name !== this.getDecision().name) {
      const event = await this.publishAndApply(changedName(name));
      await this.distributeAchievements(event);
    }
  }

  public async chatMessage(message: string, viewerName?: string, broadcastNo?: number) {
    ow(message, ow.string);
    ow(broadcastNo, ow.any(ow.undefined, ow.number));
    await this.changeName(viewerName);
    const event = await this.publishAndApply(sentChatMessage(this.options.messageToObject(message), broadcastNo));
    await this.distributeAchievements(event);
  }

  public async giveAchievement(achievement: string, viewerName?: string) {
    if (this.getDecision().achievementsReceived.includes(achievement)) {
      throw new Error(`user ${this.getId()} already has achievement ${achievement}`);
    }
    if (!this.options.achievements[achievement]) {
      throw new Error(`achievement ${achievement} doesnt exist`);
    }
    await this.changeName(viewerName);
    await this.publishAndApply(gotAchievement(achievement));
  }

  public async replayAchievement(achievement: string) {
    if (!this.options.achievements[achievement]) {
      throw new Error(`achievement ${achievement} doesnt exist`);
    }
    await this.publishAndApply(replayedAchievement(achievement));
  }

  public async donate(amount: number, viewerName?: string, message?: string) {
    ow(amount, ow.number.greaterThan(0));
    ow(message, ow.any(ow.undefined, ow.string));
    await this.changeName(viewerName);
    const event = await this.publishAndApply(donated(amount, message));
    await this.distributeAchievements(event);
  }

  public async cheer(amount: number, message: string, viewerName?: string, broadcastNo?: number) {
    ow(amount, ow.number.greaterThan(0));
    await this.chatMessage(message, viewerName, broadcastNo);
    const event = await this.publishAndApply(cheered(amount));
    await this.distributeAchievements(event);
  }

  public async subscribe(message?: string, viewerName?: string, broadcastNo?: number) {
    if (message) { await this.chatMessage(message, viewerName, broadcastNo); }
    const event = await this.publishAndApply(subscribed());
    await this.distributeAchievements(event);
  }

  public async resub(months: number, message?: string, viewerName?: string, broadcastNo?: number) {
    ow(months, ow.number);
    if (message) { await this.chatMessage(message, viewerName, broadcastNo); }
    const event = await this.publishAndApply(resubscribed(months));
    await this.distributeAchievements(event);
  }

  public async giveSub(recipient: string, viewerName?: string) {
    ow(recipient, ow.string);
    await this.changeName(viewerName);
    const event = await this.publishAndApply(gaveSub(recipient));
    await this.distributeAchievements(event);
  }

  public async host(nbViewers: number, viewerName?: string) {
    ow(nbViewers, ow.number);
    await this.changeName(viewerName);
    const event = await this.publishAndApply(hosted(nbViewers));
    await this.distributeAchievements(event);
  }

  public async raid(nbViewers: number, viewerName?: string) {
    ow(nbViewers, ow.number);
    await this.changeName(viewerName);
    const event = await this.publishAndApply(raided(nbViewers));
    await this.distributeAchievements(event);
  }

  public async topClipper(viewerName?: string) {
    await this.changeName(viewerName);
    if (!this.getDecision().topClipper) {
      const event = await this.publishAndApply(becameTopClipper());
      await this.distributeAchievements(event);
    }
  }

  public async notTopClipper() {
    if (this.getDecision().topClipper) {
      const event = await this.publishAndApply(lostTopClipper());
      await this.distributeAchievements(event);
    }
  }

  public isTopClipper() {
    return this.getDecision().topClipper;
  }

  public async follow(viewerName?: string) {
    await this.changeName(viewerName);
    const event = await this.publishAndApply(followed());
    await this.distributeAchievements(event);
  }

  protected getAggregate() {
    return "viewer";
  }

  protected getDecisionReducer() {
    return getDecisionReducer(this.options);
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
  name: string | undefined;
  achievementsReceived: string[];
  achievementsProgress: Obj;
  topClipper: boolean;
}

const initialState = { name: undefined, achievementsReceived: [], achievementsProgress: {}, topClipper: false };

function topClipperReducer(state = false, event: Event) {
  if (event.type === "became-top-clipper") { return true; }
  if (event.type === "lost-top-clipper") { return false; }
  return state;
}

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
    let achievementsReceived = state.achievementsReceived;
    let name = state.name;
    if (event.type === "migrated-data") {
      achievementsReceived = state.achievementsReceived.concat(event.achievements.map((a: any) => a.achievement));
      name = event.name;
    } else if (event.type === "got-achievement") {
      achievementsReceived = state.achievementsReceived.concat(event.achievement);
    } else if (event.type === "changed-name") {
      name = event.name;
    }
    const topClipper = topClipperReducer(state.topClipper, event);
    return { name, achievementsProgress, achievementsReceived, topClipper };
  };
}
