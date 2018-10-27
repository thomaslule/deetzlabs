import { createHash } from "crypto";
import { NextFunction, Request, Response, Router } from "express";
import * as expressjwt from "express-jwt";
import { check, validationResult } from "express-validator/check";
import { matchedData, sanitize } from "express-validator/filter";
import { sign } from "jsonwebtoken";
import mapValues = require("lodash.mapvalues");
import { Domain } from "./domain/domain";
import { Options } from "./get-options";
import { Twitch } from "./twitch";

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

  constructor(private domain: Domain, private twitch: Twitch, private options: Options) {
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

    this.router.get("/viewers", async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.send(await this.domain.viewer.getAllViewersState());
      } catch (err) {
        next(err);
      }
    });

    this.router.get("/last_achievements", async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.send(await this.domain.viewer.getLastAchievements());
      } catch (err) {
        next(err);
      }
    });

    this.router.get("/achievements", (req: Request, res: Response, next: NextFunction) => {
      try {
        const achievements = mapValues(this.options.achievements, (achievement) => achievement.name);
        res.send(achievements);
      } catch (err) {
        next(err);
      }
    });

    this.router.get("/achievement_alert_volume", async (req: Request, res: Response, next: NextFunction) => {
      try {
        const volume = await this.domain.settings.getAchievementVolume();
        res.send({ volume });
      } catch (err) {
        next(err);
      }
    });

    this.router.get("/credits", async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.send(await this.domain.credits.get());
      } catch (err) {
        next(err);
      }
    });

    this.router.post(
      "/give_achievement",
      check("achievement").not().isEmpty(),
      check("viewerName").not().isEmpty(),
      validationMiddleware,
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const { achievement, viewerName } = req.validParams;
          const twitchUser = await this.twitch.getViewer(viewerName);
          if (!twitchUser) {
            throw new Error(`couldnt give achievement to ${viewerName}, twitch user not found`);
          }
          const viewer = await this.domain.viewer.get(twitchUser.id);
          await viewer.giveAchievement(achievement, twitchUser.display_name);
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      },
    );

    this.router.post(
      "/replay_achievement",
      check("achievement").not().isEmpty(),
      check("viewer").not().isEmpty(),
      validationMiddleware,
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const { achievement, viewer } = req.validParams;
          const viewerEntity = await this.domain.viewer.get(viewer);
          await viewerEntity.replayAchievement(achievement);
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      },
    );

    this.router.post(
      "/achievement_alert_volume",
      check("volume").isFloat({ min: 0.1, max: 1 }),
      sanitize("volume").toFloat(),
      validationMiddleware,
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const { volume } = req.validParams;
          const settings = await this.domain.settings.get();
          settings.changeAchievementVolume(volume);
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      },
    );
  }
}
