import { Event } from "es-objects";
import { Options } from "../src/options";

const isGG = (event: Event) =>
  event.type === "sent-chat-message" && event.message.gg;

export const testOptions: Partial<Options> = {
  db_url: process.env.DEETZLABS_db_url,
  protect_api: false,
  log_level: "debug",
  log_to_file: false,
  log_to_console: true,
  messageToObject: (message) => ({
    commandsCommand: message === "!commands" ? true : undefined,
    achievementsCommand: message === "!achievements" ? true : undefined,
    gg: message.startsWith("gg") ? true : undefined,
  }),
  achievements: {
    cheerleader: {
      name: "Cheerleader",
      text: "Thank you %USER%!",
      description: "Automatically distributed when a viewer sends bits",
      distributeWhen: (state, event) => event.type === "cheered",
    },
    supporter: {
      name: "Supporter",
      text: "Thank you %USER%!",
      description: "Automatically distributed when a viewer says gg 5 times",
      reducer: (state = 0, event) => (isGG(event) ? state + 1 : state),
      distributeWhen: (state, event) => isGG(event) && state >= 5,
    },
    host: {
      name: "Host",
      text: "Thank you %USER%!",
      description: "Automatically distributed when a viewer hosts or raid",
      distributeWhen: (state, event) =>
        event.type === "hosted" || event.type === "raided",
    },
  },
  commands: [
    {
      when: (event) =>
        event.type === "sent-chat-message" && event.message.commandsCommand,
      say: () => "Say !achievements to see your current achievements",
    },
    {
      when: (event) =>
        event.type === "sent-chat-message" && event.message.achievementsCommand,
      say: ({ viewerName, viewerAchievements, options }) => {
        const achievements = viewerAchievements
          .map((a) => options.achievements[a].name)
          .join(", ");
        return viewerAchievements.length === 0
          ? `${viewerName} doesn't have any achievement but their time will come!`
          : `Congratulations ${viewerName} for your achievements: ${achievements}`;
      },
    },
    {
      when: (event) => event.type === "followed",
      say: ({ viewerName }) => `Welcome ${viewerName}!`,
    },
  ],
};
