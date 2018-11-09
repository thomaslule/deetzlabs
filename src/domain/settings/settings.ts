import { DecisionProjection, DecisionSequence, Entity, Event } from "es-objects";
import ow from "ow";
import { achievementVolumeChanged, followersGoalChanged } from "./events";

export class Settings extends Entity<undefined> {
  constructor(
    decisionProjection: DecisionProjection<undefined>,
    publish: (event: Event, decisionSequence: DecisionSequence<undefined>) => Promise<void>,
  ) {
    super("settings", "settings", decisionProjection, publish);
  }

  public async changeAchievementVolume(volume: number) {
    ow(volume, ow.number);
    await this.publishAndApply(achievementVolumeChanged(volume));
  }

  public async changeFollowersGoal(settings: any) {
    ow(settings, ow.object);
    await this.publishAndApply(followersGoalChanged(settings));
  }
}
