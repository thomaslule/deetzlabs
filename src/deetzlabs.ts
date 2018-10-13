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
  private twitch: Twitch;

  constructor(options?: Partial<Options>) {
    this.opts = getOptions(options);
    configureLog(this.opts);
    this.twitch = new Twitch(this.opts);
    // const streamlabs = new Streamlabs();
    const widgets = new Widgets();
    // const admin = new Admin();
    const domain = new Domain(
      new PgStorage(new Pool({ connectionString: this.opts.db_url })),
      (msg) => this.twitch.say(msg),
      () => widgets.showAchievement(),
      this.opts,
    );
    this.twitch.on("chat", async (channel: string, userstate: any, message: string, isSelf: boolean) => {
      try {
        if (isSelf) { return; }
        const viewer = await domain.viewer.get(userstate["user-id"]);
        viewer.chatMessage(message, userstate["display-name"]);
      } catch (error) {
        log.error(error);
      }
    });
    const api = new Api(domain, this.opts);
    this.server = new Server(api.getRouter() /*widgets.getRouter(), admin.getRouter(), twitch.getRouter()*/);
  }

  public async start() {
    await this.twitch.connect();
    this.server.get().listen(this.opts.port, () => {
      log.info(`listening on ${this.opts.port}`);
    });
  }
}
