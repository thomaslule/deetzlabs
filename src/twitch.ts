import { EventEmitter } from "events";
import { TwitchChannel } from "twitch-channel";
import { Domain } from "./domain/domain";
import { log } from "./log";
import { Options } from "./options";
import { Client } from "tmi.js";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { Express } from "express";

export class Twitch {
  private channel: TwitchChannel;
  private bus = new EventEmitter();
  private intervalId?: NodeJS.Timer;
  private bot: Client;
  private api: ApiClient;

  constructor(private options: Options) {
    this.channel = new TwitchChannel({
      channel: options.channel,
      clientId: options.client_id,
      clientSecret: options.client_secret,
      callbackUrl: `${options.self_url}/twitch-callback`,
      removePreviousEventSubSubscriptions: true,
    });
    this.bot = Client({
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: options.bot_name,
        password: options.bot_token,
      },
      channels: [options.channel],
      logger: {
        info: (message) => {
          log.debug("tmi.js: %s", message);
        },
        warn: (message) => {
          log.warn("tmi.js: %s", message);
        },
        error: (message) => {
          log.error("tmi.js: %s", message);
        },
      },
    });
    this.channel.on("log", (logEvent) => {
      if (logEvent.level === "error") {
        log.error("twitch-channel: %s %s", logEvent.message, logEvent.error);
      } else if (logEvent.level === "warn") {
        log.warn("twitch-channel: %s", logEvent.message);
      } else if (logEvent.level === "info") {
        log.info("twitch-channel: %s", logEvent.message);
      } else if (logEvent.level === "debug") {
        log.debug("twitch-channel: %s", logEvent.message);
      }
    });
    const authProvider = new ClientCredentialsAuthProvider(
      options.client_id,
      options.client_secret
    );
    this.api = new ApiClient({ authProvider });
  }

  public say(message: string) {
    this.bot.say(this.options.channel, message);
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

    this.channel.on(
      "sub",
      async ({ viewerId, viewerName, tier, message, months }) => {
        try {
          const viewer = await domain.store.getViewer(viewerId);
          const broadcastNo = domain.query.getBroadcastNumber();
          await viewer.setName(viewerName);
          await viewer.subscribe(months, tier, message, broadcastNo);
        } catch (err) {
          log.error("sub command error");
          log.error(err as string);
        }
      }
    );

    this.channel.on(
      "sub-gift",
      async ({ viewerId, viewerName, number, tier, total }) => {
        try {
          if (viewerId) {
            const viewer = await domain.store.getViewer(viewerId);
            await viewer.setName(viewerName!);
            await viewer.giveSubs(tier, number, total);
          }
        } catch (err) {
          log.error("sub-gift-received command error");
          log.error(err as string);
        }
      }
    );

    this.channel.on(
      "sub-gift-received",
      async ({ gifterId, gifterName, recipientId, recipientName, tier }) => {
        try {
          if (gifterId) {
            const gifter = await domain.store.getViewer(gifterId);
            await gifter.setName(gifterName!);
          }
          const recipient = await domain.store.getViewer(recipientId);
          await recipient.setName(recipientName);
          await recipient.receiveSub(tier, gifterId);
        } catch (err) {
          log.error("sub-gift-received command error");
          log.error(err as string);
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

    this.channel.on("stream-begin", async ({ categoryName }) => {
      try {
        const broadcast = await domain.store.getBroadcast();
        await broadcast.begin(categoryName);
      } catch (err) {
        log.error("stream-begin command error");
        log.error(err as string);
      }
    });

    this.channel.on("stream-change-category", async ({ categoryName }) => {
      try {
        const broadcast = await domain.store.getBroadcast();
        await broadcast.changeGame(categoryName);
      } catch (err) {
        log.error("stream-change-category command error");
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
  ): Promise<{ viewerId: string; viewerName: string } | undefined> {
    const viewer = await this.api.users.getUserByName(viewerName);
    if (!viewer) {
      return undefined;
    }
    return { viewerId: viewer.id, viewerName: viewer.displayName };
  }

  public async connect(): Promise<void> {
    await this.channel.connect();
    await this.bot.connect();
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
    await this.bot.disconnect();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public applyMiddleware(server: Express): void {
    this.channel.applyEventSubMiddleware(server);
  }

  private async fetchTopClipper() {
    const lastWeek = new Date(
      new Date().getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const topClips = await this.api.clips.getClipsForBroadcaster(
      this.options.channel,
      { limit: 1, startDate: lastWeek }
    );
    if (topClips.data.length > 0) {
      const topClip = topClips.data[0];
      this.bus.emit("top-clipper", {
        viewerId: topClip.creatorId,
        viewerName: topClip.creatorDisplayName,
      });
    }
  }
}
