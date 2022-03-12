import { DecisionSequence, Entity, Event, Reducer } from "es-objects";
import mapValues = require("lodash.mapvalues");
import ow from "ow";
import { Options } from "../../options";
import { Obj } from "../../util";
import {
  gotBan,
  becameTopClipper,
  changedName,
  cheered,
  donated,
  followed,
  gotAchievement,
  hosted,
  lostTopClipper,
  raided,
  replayedAchievement,
  sentChatMessage,
  subscribed,
  gotUnban,
  receivedSub,
  gaveSubs,
} from "./events";

export class Viewer extends Entity<DecisionState> {
  public constructor(
    id: string,
    decisionSequence: DecisionSequence<DecisionState>,
    publish: (
      event: Event,
      decisionSequence: DecisionSequence<DecisionState>
    ) => Promise<void>,
    private options: Options
  ) {
    super(id, decisionSequence, publish);
  }

  public async setName(name: string) {
    ow(name, ow.string.minLength(1));
    if (name !== this.getDecision().name) {
      const event = await this.publishAndApply(changedName(name));
      await this.distributeAchievements(event);
    }
  }

  public async chatMessage(message: string, broadcastNo?: number) {
    ow(message, ow.string);
    ow(broadcastNo, ow.any(ow.undefined, ow.number));
    if (this.getDecision().banned) {
      // since viewer is able to send a message, they have been unbanned
      await this.publishAndApply(gotUnban());
    }
    const event = await this.publishAndApply(
      sentChatMessage(this.options.messageToObject(message), broadcastNo)
    );
    await this.distributeAchievements(event);
  }

  public async giveAchievement(achievement: string) {
    if (this.getDecision().achievementsReceived.includes(achievement)) {
      throw new Error(
        `viewer ${this.getId()} already has achievement ${achievement}`
      );
    }
    if (this.getDecision().banned) {
      throw new Error(`viewer ${this.getId()} is banned`);
    }
    if (!this.options.achievements[achievement]) {
      throw new Error(`achievement ${achievement} doesnt exist`);
    }
    await this.publishAndApply(gotAchievement(achievement));
  }

  public async replayAchievement(achievement: string) {
    if (!this.options.achievements[achievement]) {
      throw new Error(`achievement ${achievement} doesnt exist`);
    }
    await this.publishAndApply(replayedAchievement(achievement));
  }

  public async donate(amount: number, message?: string) {
    ow(amount, ow.number.greaterThan(0));
    ow(message, ow.any(ow.undefined, ow.string));
    const event = await this.publishAndApply(donated(amount, message));
    await this.distributeAchievements(event);
  }

  public async cheer(amount: number, message: string, broadcastNo?: number) {
    ow(amount, ow.number.greaterThan(0));
    const event = await this.publishAndApply(cheered(amount));
    await this.distributeAchievements(event);
    await this.chatMessage(message, broadcastNo);
  }

  public async subscribe(
    months: number,
    plan: string,
    message?: string,
    broadcastNo?: number
  ) {
    ow(months, ow.number);
    ow(plan, ow.string);
    const event = await this.publishAndApply(subscribed(months, plan));
    await this.distributeAchievements(event);
    if (message) {
      await this.chatMessage(message, broadcastNo);
    }
  }

  public async giveSubs(
    plan: string,
    number: number,
    total: number | undefined
  ) {
    ow(plan, ow.string);
    ow(number, ow.number);
    ow(total, ow.optional.number);
    const event = await this.publishAndApply(gaveSubs(plan, number, total));
    await this.distributeAchievements(event);
  }

  public async receiveSub(plan: string, gifter: string | undefined) {
    ow(plan, ow.string);
    ow(gifter, ow.optional.string);
    const event = await this.publishAndApply(receivedSub(plan, gifter));
    await this.distributeAchievements(event);
  }

  public async host(nbViewers: number) {
    ow(nbViewers, ow.number);
    const event = await this.publishAndApply(hosted(nbViewers));
    await this.distributeAchievements(event);
  }

  public async raid(nbViewers: number) {
    ow(nbViewers, ow.number);
    const event = await this.publishAndApply(raided(nbViewers));
    await this.distributeAchievements(event);
  }

  public async topClipper() {
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

  public async follow() {
    const event = await this.publishAndApply(followed());
    await this.distributeAchievements(event);
  }

  public async receiveBan() {
    await this.publishAndApply(gotBan());
  }

  protected getAggregate() {
    return "viewer";
  }

  protected getDecisionReducer() {
    return getDecisionReducer(this.options);
  }

  protected async distributeAchievements(event: Event) {
    const decision = this.getDecision();
    if (decision.banned) {
      return;
    }
    await Object.keys(this.options.achievements)
      .filter(
        (achievement) => !decision.achievementsReceived.includes(achievement)
      )
      .map((achievement) => {
        const { distributeWhen } = this.options.achievements[achievement];
        if (distributeWhen(decision.achievementsProgress[achievement], event)) {
          return gotAchievement(achievement);
        }
        return undefined;
      })
      .reduce(
        (chain, achievementEvent) =>
          achievementEvent === undefined
            ? chain
            : chain.then(() => this.publishAndApply(achievementEvent)),
        Promise.resolve()
      );
  }
}

export interface DecisionState {
  name: string | undefined;
  achievementsReceived: string[];
  achievementsProgress: Obj;
  topClipper: boolean;
  banned: boolean;
}

const initialState = {
  name: undefined,
  achievementsReceived: [],
  achievementsProgress: {},
  topClipper: false,
  banned: false,
};

function topClipperReducer(state = false, event: Event) {
  if (event.type === "became-top-clipper") {
    return true;
  }
  if (event.type === "lost-top-clipper") {
    return false;
  }
  return state;
}

export function getDecisionReducer(options: Options): Reducer<DecisionState> {
  function getProgressForAchievementsInProgress(
    state: DecisionState,
    event: Event
  ): Obj {
    return mapValues(options.achievements, ({ reducer }, achievement) =>
      !state.achievementsReceived.includes(achievement) && reducer
        ? reducer(state.achievementsProgress[achievement], event)
        : undefined
    );
  }

  return (state = initialState, event) => {
    const achievementsProgress = getProgressForAchievementsInProgress(
      state,
      event
    );
    let achievementsReceived = state.achievementsReceived;
    let name = state.name;
    let banned = state.banned;
    if (event.type === "migrated-data") {
      achievementsReceived = state.achievementsReceived.concat(
        event.achievements.map((a: any) => a.achievement)
      );
      name = event.name;
    } else if (event.type === "got-achievement") {
      achievementsReceived = state.achievementsReceived.concat(
        event.achievement
      );
    } else if (event.type === "changed-name") {
      name = event.name;
    } else if (event.type === "got-ban") {
      banned = true;
    } else if (event.type === "got-unban") {
      banned = false;
    }
    const topClipper = topClipperReducer(state.topClipper, event);
    return {
      name,
      achievementsProgress,
      achievementsReceived,
      topClipper,
      banned,
    };
  };
}
