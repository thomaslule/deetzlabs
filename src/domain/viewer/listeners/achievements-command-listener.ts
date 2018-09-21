import * as assert from "assert";
import { Event } from "es-objects";
import { Options } from "../../../get-options";
import { ViewerAchievementsProjection } from "../projections/viewer-achievements-projection";
import { ViewerNameProjection } from "../projections/viewer-name-projection";

export class AchievementsCommandListenener {
  constructor(
    private viewerAchievementsProjection: ViewerAchievementsProjection,
    private nameProj: ViewerNameProjection,
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
      const name = await this.nameProj.get(event.id);
      assert(name, `couldnt get the name for viewer ${event.id}`);
      const achievements = await this.viewerAchievementsProjection.get(event.id);
      const achievementsNames = achievements.map((id) => this.options.achievements[id].name);
      const message = achievementsNames.length > 0
      ? this.options.achievements_answer
        .replace("%USER%", name)
        .replace("%ACHIEVEMENTS%", achievementsNames.join(", "))
      : this.options.achievements_answer_none
        .replace("%USER%", name);

      this.sendChatMessage(message);
    }
  }
}
