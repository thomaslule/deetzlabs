// import { Admin } from "./admin";
import { Pool } from "pg";
import { Api } from "./api";
import { Domain } from "./domain/domain";
import { getOptions, Options } from "./get-options";
import { configureLog, log } from "./log";
import { Server } from "./server";
import { PgStorage } from "./storage/pg-storage";
// import { Server } from "./server";
// import { Storage } from "./storage/storage";
// import { Streamlabs } from "./streamlabs";
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
    // const streamlabs = new Streamlabs();
    const widgets = new Widgets();
    // const admin = new Admin();
    this.domain = new Domain(
      new PgStorage(new Pool({ connectionString: this.opts.db_url })),
      (msg) => this.twitch.say(msg),
      () => widgets.showAchievement(),
      this.opts,
    );
    this.twitch.connectToDomain(this.domain);
    const api = new Api(this.domain, this.twitch, this.opts);
    this.server = new Server(api.getRouter(), /*widgets.getRouter(), admin.getRouter(),*/ this.twitch.getProxy());
  }

  public async start() {
    await Promise.all([
      this.domain.init(),
      this.twitch.connect(),
    ]);
    this.server.get().listen(this.opts.port, () => {
      log.info(`listening on ${this.opts.port}`);
    });
  }
}
