import { Event } from "es-objects";
import { Options } from "../options";
import { Twitch } from "../twitch";
import { Domain } from "./domain";

export function commandsListener(
  domain: Domain,
  twitch: Twitch,
  sendChatMessage: (msg: string) => void,
  options: Options
) {
  return async (event: Event) => {
    if (event.aggregate === "viewer") {
      const successfulCommands = options.commands.filter((command) =>
        command.when(event)
      );
      if (successfulCommands.length > 0) {
        const viewer = await domain.query.getViewerWithAchievements(event.id);
        if (viewer === undefined) {
          throw new Error(`couldnt get the viewer ${event.id}`);
        }
        if (viewer.banned) {
          // we don't react to commands if viewer is banned
          return;
        }
        await Promise.all(
          successfulCommands.map(async (command) => {
            const viewerName = viewer.name;
            const viewerAchievements = viewer.achievements;
            if (command.say) {
              const message = command.say({
                event,
                viewerName,
                viewerAchievements,
                options,
              });
              if (message) {
                sendChatMessage(message);
              }
            }
            if (command.do) {
              await command.do({ event, domain, twitch, options });
            }
          })
        );
      }
    }
  };
}
