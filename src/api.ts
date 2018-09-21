import { createHash } from "crypto";
import { NextFunction, Request, Response, Router } from "express";
import * as expressjwt from "express-jwt";
import { check, validationResult } from "express-validator/check";
import { matchedData } from "express-validator/filter";
import { sign } from "jsonwebtoken";
import { Domain } from "./domain";
import { Options } from "./get-options";

const LOGIN_DURATION = 60 * 60 * 24 * 30;

const validationMiddleware = (req: any, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.mapped() });
    return;
  }
  req.validParams = matchedData(req);
  next();
};

export class Api {
  private router: Router;

  constructor(private domain: Domain, private options: Options) {
    this.router = Router();
    if (this.options.protect_api) {
      this.router.use(expressjwt({
        secret: this.options.secret,
      }).unless({ path: ["/api/login", "/api/followers_goal", "/api/credits"] }));
    }
    this.setRoutes();
  }

  public getRouter() {
    return this.router;
  }

  private setRoutes() {
    this.router.post(
      "/login",
      check("username").exists(),
      check("password").exists(),
      validationMiddleware,
      (req: any, res, next) => {
        try {
          if (this.options.protect_api) {
            const { username, password } = req.validParams;
            const { logins } = this.options;
            if (logins[username] && logins[username] === createHash("sha256").update(password).digest("base64")) {
              const token = sign({ username }, this.options.secret, { expiresIn: LOGIN_DURATION });
              const expiresAt = Date.now() + (LOGIN_DURATION * 1000);
              res.send({ token, expiresAt });
            } else {
              res.sendStatus(401);
            }
          } else {
            const expiresAt = Date.now() + (LOGIN_DURATION * 1000);
            res.send({ token: "DUMMY_TOKEN", expiresAt });
          }
        } catch (err) {
          next(err);
        }
      },
    );

    this.router.get("/distributed_achievements", async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.send(await this.domain.viewer.getDistributedAchievements());
      } catch (err) {
        next(err);
      }
    });
  }
}
