import { Event } from "es-objects";
import { Options } from "../options";
import { Query } from "./query/query";

export function commandsListener(
  query: Query,
  sendChatMessage: (msg: string) => void,
  options: Options
) {
  return async (event: Event) => {
    if (event.aggregate === "viewer") {
      const successfulCommands = options.commands.filter(command =>
        command.when(event)
      );
      if (successfulCommands.length > 0) {
        const viewer = await query.getViewerWithAchievements(event.id);
        if (viewer === undefined) {
          throw new Error(`couldnt get the viewer ${event.id}`);
        }
        if (viewer.banned) {
          // we don't react to commands if viewer is banned
          return;
        }
        successfulCommands.forEach(command => {
          const viewerName = viewer.name;
          const viewerAchievements = viewer.achievements;
          const message = command.say({
            event,
            viewerName,
            viewerAchievements,
            options
          });
          if (message) {
            sendChatMessage(message);
          }
        });
      }
    }
  };
}
