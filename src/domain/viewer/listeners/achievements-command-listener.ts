import { Event } from "es-objects";
import { Options } from "../../../get-options";
import { DisplayNameProjection } from "../projections/display-name-projection";
import { ViewerAchievementsProjection } from "../projections/viewer-achievements-projection";

export class AchievementsCommandListenener {
  constructor(
    private viewerAchievementsProjection: ViewerAchievementsProjection,
    private displayNameProj: DisplayNameProjection,
    private sendChatMessage: (msg: string) => void,
    private options: Options,
  ) {
  }

  public async handleEvent(event: Event) {
    if (
      event.aggregate === "viewer"
      && event.type === "sent-chat-message"
      && event.message.achievementsCommand
    ) {
      const displayName = await this.displayNameProj.get(event.id);
      const achievements = await this.viewerAchievementsProjection.get(event.id);
      const achievementsNames = achievements.map((id) => this.options.achievements[id].name);
      const message = achievementsNames.length > 0
      ? this.options.achievements_answer
        .replace("%USER%", displayName)
        .replace("%ACHIEVEMENTS%", achievementsNames.join(", "))
      : this.options.achievements_answer_none
        .replace("%USER%", displayName);

      this.sendChatMessage(message);
    }
  }
}
