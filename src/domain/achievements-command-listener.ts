import { Event } from "es-objects";
import { Options } from "../get-options";
import { Query } from "./query/query";

export function achievementsCommandListener(query: Query, sendChatMessage: (msg: string) => void, options: Options) {
  return async (event: Event) => {
    if (
      event.aggregate === "viewer"
      && event.type === "sent-chat-message"
      && event.message.achievementsCommand
    ) {
      const viewer = await query.getViewerWithAchievements(event.id);
      if (viewer === undefined) { throw new Error(`couldnt get the viewer ${event.id}`); }
      const achievementsNames = viewer.achievements
        .map((id) => options.achievements[id].name);
      const message = achievementsNames.length > 0
      ? options.achievements_answer
        .replace("%USER%", viewer.name)
        .replace("%ACHIEVEMENTS%", achievementsNames.join(", "))
      : options.achievements_answer_none
        .replace("%USER%", viewer.name);

      sendChatMessage(message);
    }
  };
}
