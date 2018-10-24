import { Event } from "es-objects";
import ow from "ow";
import { achievementVolumeChanged, followersGoalChanged } from "./events";

export class Settings {
  constructor(private createAndPublish: (eventData: any) => Promise<Event>) {
  }

  public async changeAchievementVolume(volume: number) {
    ow(volume, ow.number);
    await this.createAndPublish(achievementVolumeChanged(volume));
  }

  public async changeFollowersGoal(settings: any) {
    ow(settings, ow.object);
    await this.createAndPublish(followersGoalChanged(settings));
  }
}
