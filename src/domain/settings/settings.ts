import { Entity } from "es-objects";
import { achievementVolumeChanged, followersGoalChanged } from "./events";

export class Settings extends Entity<any> {
  public async changeAchievementVolume(volume: number) {
    await this.publishAndApply(achievementVolumeChanged(volume));
  }

  public async changeFollowersGoal(settings: any) {
    await this.publishAndApply(followersGoalChanged(settings));
  }
}
