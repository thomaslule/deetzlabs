import { NextFunction, Request, Response, Router } from "express";
import { check, validationResult } from "express-validator/check";
import { matchedData, sanitize } from "express-validator/filter";
import { Domain } from "./domain/domain";
import { getAuthenticationMiddleware } from "./getAuthenticationMiddleware";
import { Options } from "./options";
import { Twitch } from "./twitch";
import { Widgets } from "./widgets";
import mapValues = require("lodash.mapvalues");

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

  constructor(
    private domain: Domain,
    private twitch: Twitch,
    private widgets: Widgets,
    private options: Options
  ) {
    this.router = Router();
    this.setRoutes();
  }

  public getRouter() {
    return this.router;
  }

  private setRoutes() {
    this.router.get(
      "/client_id",
      (req: Request, res: Response, next: NextFunction) => {
        try {
          res.send({ clientId: this.options.client_id });
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/check_token",
      getAuthenticationMiddleware(this.options),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (req: Request, res: Response, next: NextFunction) => {
        res.sendStatus(204);
      }
    );

    this.router.get(
      "/viewer_names",
      getAuthenticationMiddleware(this.options),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          res.send(await this.domain.query.getRecentViewerNames());
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/viewer_achievements",
      getAuthenticationMiddleware(this.options),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          res.send(await this.domain.query.getAllViewerAchievements());
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/last_achievements",
      getAuthenticationMiddleware(this.options),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          res.send(await this.domain.query.getLastViewerAchievements());
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/achievements",
      getAuthenticationMiddleware(this.options),
      (req: Request, res: Response, next: NextFunction) => {
        try {
          const achievements = mapValues(
            this.options.achievements,
            (achievement) => ({
              name: achievement.name,
              description: achievement.description,
            })
          );
          res.send(achievements);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/muted",
      getAuthenticationMiddleware(this.options),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const muted = (await this.domain.query.getSettings()).muted;
          res.send({ muted });
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/achievement_alert_volume",
      getAuthenticationMiddleware(this.options),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const volume = (await this.domain.query.getSettings())
            .achievementVolume;
          res.send({ volume });
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/followers_goal",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          res.send((await this.domain.query.getSettings()).followersGoal);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.get(
      "/credits",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          res.send(await this.domain.query.getCredits());
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.post(
      "/give_achievement",
      getAuthenticationMiddleware(this.options),
      check("achievement").not().isEmpty(),
      check("viewerName").not().isEmpty(),
      validationMiddleware,
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const { achievement, viewerName } = req.validParams;
          const twitchUser = await this.twitch.getViewer(viewerName);
          if (!twitchUser) {
            throw new Error(
              `couldnt give achievement to ${viewerName}, twitch user not found`
            );
          }
          const viewer = await this.domain.store.getViewer(twitchUser.id);
          await viewer.setName(twitchUser.display_name);
          await viewer.giveAchievement(achievement);
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.post(
      "/replay_achievement",
      getAuthenticationMiddleware(this.options),
      check("achievement").not().isEmpty(),
      check("viewerId").not().isEmpty(),
      validationMiddleware,
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const { achievement, viewerId } = req.validParams;
          const viewer = await this.domain.store.getViewer(viewerId);
          await viewer.replayAchievement(achievement);
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.post(
      "/show_test_achievement",
      getAuthenticationMiddleware(this.options),
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const volume = (await this.domain.query.getSettings())
            .achievementVolume;
          this.widgets.showAchievement(
            "Test",
            this.options.channel,
            "%USER% is testing the alert",
            volume
          );
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.post(
      "/mute",
      getAuthenticationMiddleware(this.options),
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const settings = await this.domain.store.getSettings();
          await settings.mute();
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.post(
      "/unmute",
      getAuthenticationMiddleware(this.options),
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const settings = await this.domain.store.getSettings();
          await settings.unmute();
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.post(
      "/achievement_alert_volume",
      getAuthenticationMiddleware(this.options),
      check("volume").isFloat({ min: 0.1, max: 1 }),
      sanitize("volume").toFloat(),
      validationMiddleware,
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const { volume } = req.validParams;
          const settings = await this.domain.store.getSettings();
          await settings.changeAchievementVolume(volume);
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      }
    );

    this.router.post(
      "/change_followers_goal",
      getAuthenticationMiddleware(this.options),
      check("goal").isInt({ min: 1 }),
      check("html").exists(),
      check("css").exists(),
      sanitize("goal").toInt(),
      validationMiddleware,
      async (req: any, res: Response, next: NextFunction) => {
        try {
          const { goal, html, css } = req.validParams;
          const settings = await this.domain.store.getSettings();
          await settings.changeFollowersGoal({ goal, html, css });
          res.sendStatus(200);
        } catch (err) {
          next(err);
        }
      }
    );
  }
}
