import { json } from "body-parser";
import { NextFunction, Request, Response, Router } from "express";
import * as express from "express";
import { createServer, Server as HttpServer } from "http";
import * as morgan from "morgan";
import { log } from "./log";

const stream = { write: (message: string) => log.info(message.slice(0, -1)) };

export class Server {
  private server: HttpServer;

  constructor(apiRouter: Router, widgetsRouter: Router, adminRouter: Router, twitchProxy: any) {
    const app = express();
    app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream }));
    app.use("/twitch-callback", twitchProxy);
    app.use(json());

    app.use("/api", apiRouter);
    app.use("/widgets", widgetsRouter);
    app.use("/admin", adminRouter);
    app.get("/", (req, res) => { res.redirect("/admin"); });

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      log.error("Returning 500 because of error");
      log.error(err);
      res.sendStatus(500);
      next();
    });

    this.server = createServer(app);
  }

  public get(): HttpServer {
    return this.server;
  }

  public async close() {
    return new Promise((resolve) => this.server.close(resolve));
  }
}
