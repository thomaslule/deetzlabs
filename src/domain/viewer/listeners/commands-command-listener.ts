import { Event } from "es-objects";
import { Options } from "../../../get-options";

export class CommandsCommandListenener {
  constructor(private sendChatMessage: (msg: string) => void, private options: Options) {
  }

  public handleEvent(event: Event) {
    if (
      event.aggregate === "viewer"
      && event.type === "sent-chat-message"
      && event.message.commandsCommand
    ) {
      this.sendChatMessage(this.options.commands_answer);
    }
  }
}
