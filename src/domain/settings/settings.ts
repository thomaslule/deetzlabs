import { DecisionSequence, Entity, Event } from "es-objects";
import ow from "ow";
import {
  achievementVolumeChanged,
  followersGoalChanged,
  started,
  stopped,
} from "./events";

export class Settings extends Entity<undefined> {
  constructor(
    decisionSequence: DecisionSequence<undefined>,
    publish: (
      event: Event,
      decisionSequence: DecisionSequence<undefined>
    ) => Promise<void>
  ) {
    super("settings", decisionSequence, publish);
  }

  public async start() {
    await this.publishAndApply(started());
  }

  public async stop() {
    await this.publishAndApply(stopped());
  }

  public async changeAchievementVolume(volume: number) {
    ow(volume, ow.number);
    await this.publishAndApply(achievementVolumeChanged(volume));
  }

  public async changeFollowersGoal(settings: any) {
    ow(settings, ow.object);
    await this.publishAndApply(followersGoalChanged(settings));
  }

  protected getAggregate() {
    return "settings";
  }

  protected getDecisionReducer() {
    return () => undefined;
  }
}
