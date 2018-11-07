import { Event } from "es-objects";
import { Options } from "../get-options";
import { Query } from "./query/query";

export function commandsListener(query: Query, sendChatMessage: (msg: string) => void, options: Options) {
  return async (event: Event) => {
    if (event.aggregate === "viewer") {
      const successfulCommands = options.commands.filter((command) => command.when(event));
      if (successfulCommands.length > 0) {
        const viewer = await query.getViewerWithAchievements(event.id);
        if (viewer === undefined) { throw new Error(`couldnt get the viewer ${event.id}`); }
        successfulCommands.forEach((command) => {
          const message = command.say(viewer.name, viewer.achievements.map((a) => options.achievements[a].name));
          if (message) { sendChatMessage(message); }
        });
      }
    }

  };
}
