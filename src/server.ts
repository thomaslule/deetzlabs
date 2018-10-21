import { json } from "body-parser";
import { Express, NextFunction, Request, Response, Router } from "express";
import * as express from "express";
import * as morgan from "morgan";
import { log } from "./log";

const stream = { write: (message: string) => log.info(message.slice(0, -1)) };

export class Server {
  private app: Express;

  constructor(apiRouter: Router, /*widgetsRouter: any, adminRouter: any,*/ twitchProxy: any) {
    this.app = express();
    this.app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream }));
    this.app.use("/twitch-callback", twitchProxy);
    this.app.use(json());

    this.app.use("/api", apiRouter);
    // app.use("/widgets", widgets);
    // app.use("/admin", admin);
    this.app.get("/", (req, res) => { res.redirect("/admin"); });

    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      log.error("Request error: %s", err);
      res.sendStatus(500);
      next();
    });
  }

  public get(): Express {
    return this.app;
  }
}
