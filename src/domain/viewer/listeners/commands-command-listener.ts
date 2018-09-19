import { Event } from "es-objects";

export class CommandsCommandListenener {
  constructor(private sendChatMessage: (msg: string) => void, private options: any) {
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
