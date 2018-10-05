import { Event } from "es-objects";
import { Options } from "../../../get-options";
import { ViewersProjection } from "../projections/viewers-projection";

export class AchievementsCommandListenener {
  constructor(
    private viewersProj: ViewersProjection,
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
      const viewer = await this.viewersProj.get(event.id);
      if (viewer === undefined || viewer.name === undefined) { throw new Error(`couldnt get the viewer ${event.id}`); }
      const achievementsNames = viewer.achievements.map((id) => this.options.achievements[id].name);
      const message = achievementsNames.length > 0
      ? this.options.achievements_answer
        .replace("%USER%", viewer.name)
        .replace("%ACHIEVEMENTS%", achievementsNames.join(", "))
      : this.options.achievements_answer_none
        .replace("%USER%", viewer.name);

      this.sendChatMessage(message);
    }
  }
}
