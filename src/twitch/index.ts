import { Client } from "twitch-js";
import { Options } from "../get-options";

export class Twitch {
  private chatbot: Client;

  constructor(private options: Options) {
    this.chatbot = new Client({
      options: { debug: false },
      connection: { reconnect: true },
      identity: {
        username: this.options.bot_name,
        password: this.options.bot_token,
      },
      channels: [`#${this.options.channel}`],
    });
  }

  public async connect() {
    await this.chatbot.connect();
  }

  public async disconnect() {
    await this.chatbot.disconnect();
  }

  public say(message: string) {
    this.chatbot.say(`#${this.options.channel}`, message);
  }

  public getRouter() {
  }

  public on(event: string, handler: any) {
    this.chatbot.on(event, handler);
  }
}
