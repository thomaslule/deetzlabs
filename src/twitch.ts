import * as proxy from "express-http-proxy";
import * as TwitchChannel from "twitch-channel";
import { TwitchChannelInstance } from "twitch-channel";
import { Domain } from "./domain";
import { Options } from "./get-options";
import { log } from "./log";

export class Twitch {
  private channel: TwitchChannelInstance;
  private proxy: any;

  constructor(options: Options) {
    this.channel = TwitchChannel({
      channel: options.channel,
      bot_name: options.bot_name,
      bot_token: options.bot_token,
      client_id: options.client_id,
      client_secret: options.client_secret,
      streamlabs_socket_token: options.streamlabs_socket_token,
      callback_url: `${options.self_url}/twitch-callback`,
      secret: options.secret,
      port: options.webhook_port,
      logger: log,
    });
    this.proxy = proxy(`http://localhost:${options.webhook_port}`);
  }

  public say(message: string) {
    this.channel.say(message);
  }

  public connectToDomain(domain: Domain) {
    this.channel.on("chat", async (channel: string, userstate: any, message: string, isSelf: boolean) => {
      try {
        if (isSelf) { return; }
        const viewer = await domain.viewer.get(userstate["user-id"]);
        const broadcastNo = domain.broadcast.getBroadcastNumber();
        viewer.chatMessage(message, userstate["display-name"], broadcastNo);
      } catch (error) {
        log.error(error);
      }
    });
  }

  public async connect(): Promise<void> {
    await this.channel.connect();
  }

  public getProxy(): any {
    return this.proxy;
  }
}
