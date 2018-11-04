import { EventEmitter } from "events";
import * as proxy from "express-http-proxy";
import * as TwitchChannel from "twitch-channel";
import { TwitchChannelInstance } from "twitch-channel";
import { Domain } from "./domain/domain";
import { Options } from "./get-options";
import { log } from "./log";

export class Twitch {
  private channel: TwitchChannelInstance;
  private proxy: any;
  private bus = new EventEmitter();

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
    this.channel.on("error", (err) => { log.error("an error happened in a twitch-channel handler: %s", err); });
    this.proxy = proxy(`http://localhost:${options.webhook_port}`);
  }

  public say(message: string) {
    this.channel.say(message);
  }

  public connectToDomain(domain: Domain) {
    this.channel.on("chat", async (channel: string, userstate: any, message: string, isSelf: boolean) => {
      if (isSelf) { return; }
      const viewer = await domain.store.getViewer(userstate["user-id"]);
      const broadcastNo = domain.query.getBroadcastNumber();
      await viewer.chatMessage(message, userstate["display-name"], broadcastNo);
    });

    this.channel.on("cheer", async (channel: string, userstate: any, message: string) => {
      const viewer = await domain.store.getViewer(userstate["user-id"]);
      const broadcastNo = domain.query.getBroadcastNumber();
      await viewer.cheer(userstate.bits, message, userstate["display-name"], broadcastNo);
    });

    this.channel.on("subscription", async (channel, username: string, method, message: string) => {
      const twitchViewer = await this.channel.getTwitchUserByName(username);
      const viewer = await domain.store.getViewer(twitchViewer.id);
      const broadcastNo = domain.query.getBroadcastNumber();
      await viewer.subscribe(message, username, broadcastNo);
    });

    this.channel.on("resub", async (channel, username: string, months: number, message: string, userstate, methods) => {
      const twitchViewer = await this.channel.getTwitchUserByName(username);
      const viewer = await domain.store.getViewer(twitchViewer.id);
      const broadcastNo = domain.query.getBroadcastNumber();
      await viewer.resub(message, months, username, broadcastNo);
    });

    this.channel.on("subgift", async (channel, username, recipient, method) => {
      const twitchViewer = await this.channel.getTwitchUserByName(username);
      const twitchRecipient = await this.channel.getTwitchUserByName(recipient);
      const viewer = await domain.store.getViewer(twitchViewer.id);
      await viewer.giveSub(twitchRecipient.id, username);
    });

    this.channel.on("donation", async ({ name, amount}) => {
      const twitchViewer = await this.channel.getTwitchUserByName(name);
      if (!twitchViewer) {
        log.warn("donation from an unknown viewer: %s", name);
      } else {
        const viewer = await domain.store.getViewer(twitchViewer.id);
        await viewer.donate(amount, twitchViewer.display_name);
      }
    });

    this.channel.on("host", async ({ name, viewers }) => {
      const twitchViewer = await this.channel.getTwitchUserByName(name);
      const viewer = await domain.store.getViewer(twitchViewer.id);
      await viewer.host(viewers, twitchViewer.display_name);
    });

    this.channel.on("raid", async ({ raider, viewers }) => {
      const twitchViewer = await this.channel.getTwitchUserByName(raider);
      const viewer = await domain.store.getViewer(twitchViewer.id);
      await viewer.raid(viewers, twitchViewer.display_name);
    });

    this.channel.on("follow", async (viewerId) => {
      const viewer = await domain.store.getViewer(viewerId);
      await viewer.follow();
    });

    this.channel.on("stream-begin", async (game) => {
      const broadcast = await domain.store.getBroadcast();
      await broadcast.begin(game);
    });

    this.channel.on("stream-change-game", async (game) => {
      const broadcast = await domain.store.getBroadcast();
      await broadcast.changeGame(game);
    });

    this.channel.on("stream-end", async () => {
      const broadcast = await domain.store.getBroadcast();
      await broadcast.end();
    });

    this.bus.on("top-clipper", async (viewerId: string) => {
      await domain.service.setTopClipper(viewerId);
    });
  }

  public async getViewer(viewerName: string): Promise<any> {
    const twitchViewer = await this.channel.getTwitchUserByName(viewerName);
    return twitchViewer ? twitchViewer : undefined;
  }

  public async connect(): Promise<void> {
    await this.channel.connect();
    await this.fetchTopClipper();
    setInterval(async () => {
      try { this.fetchTopClipper(); } catch (err) { log.error(err); }
    }, 5 * 60 * 1000);
  }

  public getProxy(): any {
    return this.proxy;
  }

  private async fetchTopClipper() {
    const topClipper = await this.channel.getTopClipper();
    log.info("fetched top clipper: %s", topClipper);
    if (topClipper !== undefined) {
      this.bus.emit("top-clipper", topClipper);
    }
  }
}
