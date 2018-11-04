import { Event } from "es-objects";
import { Options } from "../get-options";

export function commandsCommandListenener(sendChatMessage: (msg: string) => void, options: Options) {
  return (event: Event) => {
    if (
      event.aggregate === "viewer"
      && event.type === "sent-chat-message"
      && event.message.commandsCommand
    ) {
      sendChatMessage(options.commands_answer);
    }
  };
}
