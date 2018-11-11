import { Router, static as expressStatic } from "express";
import { join } from "path";

const adminPath = join(require.resolve("deetzlabs-web"), "..", "..", "build");

export class Admin {
  private router: Router;

  public constructor() {
    this.router = Router();
    this.router.use(expressStatic(adminPath));
    this.router.get("*", (req, res) => { res.sendfile(`${adminPath}/index.html`); });
  }

  public getRouter() {
    return this.router;
  }
}
