import { json } from "body-parser";
import { Express, NextFunction, Request, Response, Router } from "express";
import * as express from "express";
import * as morgan from "morgan";

const stream = { write: (message: string) => console.log(message.slice(0, -1)) }; // TODO real log

export class Server {
  private app: Express;

  constructor(apiRouter: Router /*widgetsRouter: any, adminRouter: any, twitchRouter: any*/) {
    this.app = express();
    this.app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream }));
    // app.use('/twitch-callback', twitchProxy);
    this.app.use(json());

    this.app.use("/api", apiRouter);
    // app.use("/widgets", widgets);
    // app.use("/admin", admin);
    this.app.get("/", (req, res) => { res.redirect("/admin"); });

    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error(err); // TODO real log
      if (err.message.startsWith("bad_request")) {
        res.status(400).send({ error: err.message });
      } else {
        res.sendStatus(500);
      }
      next();
    });
  }

  public get(): Express {
    return this.app;
  }
}
