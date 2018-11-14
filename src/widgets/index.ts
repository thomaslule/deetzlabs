import { Router, static as expressStatic } from "express";
import { Server } from "http";
import * as socketio from "socket.io";
import { log } from "../log";
import { Options } from "../options";

export class Widgets {
  private router: Router;
  private socket: socketio.Server | undefined;

  constructor(options: Options) {
    this.router = Router();
    this.router.get("/config.js", (req, res, next) => {
      try {
        const publicConfig = {
          channel: options.channel,
          client_id: options.client_id,
        };
        res.type("application/javascript");
        res.send(`window.config = ${JSON.stringify(publicConfig)}`);
      } catch (err) {
        next(err);
      }
    });
    if (options.widgets_folder) {
      this.router.use(expressStatic(options.widgets_folder));
    }
    this.router.use(expressStatic(`${__dirname}/public`));
  }

  public setupSocket(server: Server) {
    this.socket = socketio.listen(server);
  }

  public showAchievement(achievement: string, username: string, text: string, volume: number) {
    if (this.socket === undefined) {
      log.error("socket has not yet been set");
    } else {
      this.socket.emit("achievement", {
        achievement, username, text, volume,
      });
    }
  }

  public getRouter() {
    return this.router;
  }
}
