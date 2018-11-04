import { Router, static as expressStatic } from "express";
import { resolve } from "path";

const adminPath = resolve(require.resolve("deetzlabs-web"), "..");

export class Admin {
  private router: Router;

  public constructor() {
    this.router = Router();
    this.router.get("/package.json", (req, res) => { res.sendStatus(404); });
    this.router.use(expressStatic(adminPath));
    this.router.get("*", (req, res) => { res.sendfile(`${adminPath}/index.html`); });
  }

  public getRouter() {
    return this.router;
  }
}
