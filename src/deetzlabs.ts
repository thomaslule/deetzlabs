import { Pool } from "pg";
import { Admin } from "./admin";
import { Api } from "./api";
import { Domain } from "./domain/domain";
import { configureLog, log } from "./log";
import { Options, getOptions } from "./options";
import { Server } from "./server";
import { PgStorage } from "./storage/pg-storage";
import { Twitch } from "./twitch";
import { Widgets } from "./widgets";

export class Deetzlabs {
  private opts: Options;
  private domain: Domain;
  private server: Server;
  private twitch: Twitch;

  constructor(options?: Partial<Options>) {
    this.opts = getOptions(options);
    configureLog(this.opts);
    this.twitch = new Twitch(this.opts);
    const widgets = new Widgets(this.opts);
    const admin = new Admin();
    this.domain = new Domain(
      new PgStorage(new Pool({ connectionString: this.opts.db_url })),
      (msg) => this.twitch.say(msg),
      (achievement, username, text, volume) =>
        widgets.showAchievement(achievement, username, text, volume),
      this.twitch,
      this.opts
    );
    this.twitch.connectToDomain(this.domain);
    const api = new Api(this.domain, this.twitch, widgets, this.opts);
    this.server = new Server(
      api.getRouter(),
      widgets.getRouter(),
      admin.getRouter(),
      this.twitch
    );
    widgets.setupSocket(this.server.get());
  }

  public async rebuild() {
    await this.domain.rebuild();
  }

  public async start() {
    this.server.get().listen(this.opts.port, () => {
      log.info(`listening on ${this.opts.port}`);
    });
    await Promise.all([this.domain.init(), this.twitch.connect()]);
  }

  public async stop() {
    await Promise.all([this.twitch.disconnect(), this.server.close()]);
  }
}
