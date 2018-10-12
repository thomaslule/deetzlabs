// import { Admin } from "./admin";
import { Pool } from "pg";
import { Api } from "./api";
import { Domain } from "./domain";
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
  private server: Server;
  private opts: Options;

  constructor(options?: Partial<Options>) {
    this.opts = getOptions(options);
    configureLog(this.opts);
    const twitch = new Twitch();
    // const streamlabs = new Streamlabs();
    const widgets = new Widgets();
    // const admin = new Admin();
    const domain = new Domain(
      new PgStorage(new Pool({ connectionString: this.opts.db_url })),
      (msg) => twitch.say(msg),
      () => widgets.showAchievement(),
      this.opts,
    );
    const api = new Api(domain, this.opts);
    this.server = new Server(api.getRouter() /*widgets.getRouter(), admin.getRouter(), twitch.getRouter()*/);
  }

  public start() {
    this.server.get().listen(this.opts.port, () => {
      log.info(`listening on ${this.opts.port}`);
    });
  }
}
