import { Event } from "es-objects";
import { achievementVolumeChanged, followersGoalChanged } from "./events";

export class Settings {
  constructor(private createAndPublish: (eventData: any) => Promise<Event>) {
  }

  public async changeAchievementVolume(volume: number) {
    await this.createAndPublish(achievementVolumeChanged(volume));
  }

  public async changeFollowersGoal(settings: any) {
    await this.createAndPublish(followersGoalChanged(settings));
  }
}
