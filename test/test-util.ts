import { Event } from "es-objects";
import { getOptions } from "../src/get-options";

const isGG = (event: Event) => event.type === "sent-chat-message" && event.message.gg;

export const testOptions = getOptions({
  messageToObject: (message: string) => ({
    commandsCommand: message === "!commands" ? true : undefined,
    achievementsCommand: message === "!achievements" ? true : undefined,
    gg: message === "gg" ? true : undefined,
  }),
  achievements: {
    cheerleader: {
      name: "Cheerleader",
      text: "Thank you %USER%!",
      distributeWhen: (state, event) => event.type === "cheered",
    },
    supporter: {
      name: "Supporter",
      text: "Thank you %USER%!",
      reducer: (state = 0, event) => isGG(event) ? state + 1 : state,
      distributeWhen: (state, event) => isGG(event) && state >= 5,
    },
  },
});
