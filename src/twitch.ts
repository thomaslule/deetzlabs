import { EventEmitter } from "events";
import * as proxy from "express-http-proxy";
import { TwitchChannel } from "twitch-channel";
import { Domain } from "./domain/domain";
import { log } from "./log";
import { Options } from "./options";

export class Twitch {
  private channel: TwitchChannel;
  private proxy: any;
  private bus = new EventEmitter();
  private intervalId?: NodeJS.Timer;

  constructor(options: Options) {
    this.channel = new TwitchChannel({
      channel: options.channel,
      bot_name: options.bot_name,
      bot_token: options.bot_token,
      client_id: options.client_id,
      client_secret: options.client_secret,
      streamlabs_socket_token: options.streamlabs_socket_token,
      callback_url: `${options.self_url}/twitch-callback`,
      secret: options.secret,
      port: options.webhook_port,
    });
    this.channel.on("debug", (message) => {
      log.debug("twitch-channel: %s", message);
    });
    this.channel.on("info", (message) => {
      log.info("twitch-channel: %s", message);
    });
    this.channel.on("error", (err) => {
      log.error("twitch-channel error");
      log.error(err as string);
    });
    this.proxy = proxy(`http://localhost:${options.webhook_port}`);
  }

  public say(message: string) {
    this.channel.say(message);
  }

  public connectToDomain(domain: Domain) {
    this.channel.on("chat", async ({ viewerId, viewerName, message }) => {
      try {
        const viewer = await domain.store.getViewer(viewerId);
        const broadcastNo = domain.query.getBroadcastNumber();
        await viewer.setName(viewerName);
        await viewer.chatMessage(message, broadcastNo);
      } catch (err) {
        log.error("chat command error");
        log.error(err as string);
      }
    });

    this.channel.on(
      "cheer",
      async ({ viewerId, viewerName, amount, message }) => {
        try {
          const viewer = await domain.store.getViewer(viewerId);
          const broadcastNo = domain.query.getBroadcastNumber();
          await viewer.setName(viewerName);
          await viewer.cheer(amount, message, broadcastNo);
        } catch (err) {
          log.error("cheer command error");
          log.error(err as string);
        }
      }
    );

    this.channel.on("sub", async ({ viewerId, viewerName, plan, message }) => {
      try {
        const viewer = await domain.store.getViewer(viewerId);
        const broadcastNo = domain.query.getBroadcastNumber();
        await viewer.setName(viewerName);
        await viewer.subscribe(plan || "1000", message, broadcastNo);
      } catch (err) {
        log.error("sub command error");
        log.error(err as string);
      }
    });

    this.channel.on(
      "resub",
      async ({ viewerId, viewerName, months, plan, message }) => {
        try {
          const viewer = await domain.store.getViewer(viewerId);
          const broadcastNo = domain.query.getBroadcastNumber();
          await viewer.setName(viewerName);
          await viewer.resub(months || 0, plan || "1000", message, broadcastNo);
        } catch (err) {
          log.error("resub command error");
          log.error(err as string);
        }
      }
    );

    this.channel.on(
      "subgift",
      async ({ viewerId, viewerName, recipientId, recipientName, plan }) => {
        try {
          const viewer = await domain.store.getViewer(viewerId);
          await viewer.setName(viewerName);
          await viewer.giveSub(recipientId, plan || "1000");
          const recipient = await domain.store.getViewer(recipientId);
          await recipient.setName(recipientName);
        } catch (err) {
          log.error("subgift command error");
          log.error(err as string);
        }
      }
    );

    this.channel.on(
      "streamlabs/donation",
      async ({ viewerId, viewerName, amount, message }) => {
        if (viewerId) {
          try {
            const viewer = await domain.store.getViewer(viewerId);
            await viewer.setName(viewerName);
            await viewer.donate(amount, message);
          } catch (err) {
            log.error("donation command error");
            log.error(err as string);
          }
        } else {
          log.info("got a donation from an unknown viewer: %s", viewerName);
        }
      }
    );

    this.channel.on("host", async ({ viewerId, viewerName, viewers }) => {
      try {
        const viewer = await domain.store.getViewer(viewerId);
        await viewer.setName(viewerName);
        await viewer.host(viewers);
      } catch (err) {
        log.error("host command error");
        log.error(err as string);
      }
    });

    this.channel.on("raid", async ({ viewerId, viewerName, viewers }) => {
      try {
        const viewer = await domain.store.getViewer(viewerId);
        await viewer.setName(viewerName);
        await viewer.raid(viewers);
      } catch (err) {
        log.error("raid command error");
        log.error(err as string);
      }
    });

    this.channel.on("follow", async ({ viewerId, viewerName }) => {
      try {
        const viewer = await domain.store.getViewer(viewerId);
        await viewer.setName(viewerName);
        await viewer.follow();
      } catch (err) {
        log.error("follow command error");
        log.error(err as string);
      }
    });

    this.channel.on("ban", async ({ viewerId, viewerName }) => {
      try {
        const viewer = await domain.store.getViewer(viewerId);
        await viewer.setName(viewerName);
        await viewer.receiveBan();
      } catch (err) {
        log.error("ban command error");
        log.error(err as string);
      }
    });

    this.channel.on("stream-begin", async ({ game }) => {
      try {
        const broadcast = await domain.store.getBroadcast();
        await broadcast.begin(game);
      } catch (err) {
        log.error("stream-begin command error");
        log.error(err as string);
      }
    });

    this.channel.on("stream-change-game", async ({ game }) => {
      try {
        const broadcast = await domain.store.getBroadcast();
        await broadcast.changeGame(game);
      } catch (err) {
        log.error("stream-change-game command error");
        log.error(err as string);
      }
    });

    this.channel.on("stream-end", async () => {
      try {
        const broadcast = await domain.store.getBroadcast();
        await broadcast.end();
      } catch (err) {
        log.error("stream-end command error");
        log.error(err as string);
      }
    });

    this.bus.on("top-clipper", async ({ viewerId, viewerName }) => {
      try {
        await domain.service.setTopClipper(viewerId, viewerName);
      } catch (err) {
        log.error("top-clipper command error");
        log.error(err as string);
      }
    });
  }

  public async getViewer(
    viewerName: string
  ): Promise<{ id: string; display_name: string } | undefined> {
    const twitchViewer = await this.channel.getTwitchUserByName(viewerName);
    return twitchViewer
      ? (twitchViewer as unknown as { id: string; display_name: string })
      : undefined;
  }

  public async connect(): Promise<void> {
    await this.channel.connect();
    await this.fetchTopClipper();
    this.intervalId = setInterval(async () => {
      try {
        this.fetchTopClipper();
      } catch (err) {
        log.error(err as string);
      }
    }, 30 * 60 * 1000);
  }

  public async disconnect(): Promise<void> {
    await this.channel.disconnect();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public getProxy(): any {
    return this.proxy;
  }

  private async fetchTopClipper() {
    const topClipper = await this.channel.getTopClipper();
    log.info(
      "fetched top clipper: %s",
      topClipper ? topClipper.viewerName : undefined
    );
    if (topClipper !== undefined) {
      this.bus.emit("top-clipper", topClipper);
    }
  }
}
