import { NextFunction, Request, RequestHandler, Response } from "express";
import fetch from "node-fetch";
import { Options } from "./options";

export function getAuthenticationMiddleware(options: Options): RequestHandler {
  async function authenticationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authorization = req.get("Authorization");
      if (authorization === undefined) {
        res.status(401).send({ error: "Authorization header not found" });
        return;
      }
      const userResponse = await getLoginFromToken(authorization);
      if (!userResponse.success) {
        res.status(401).send({ error: userResponse.error });
        return;
      }
      const login = userResponse.login.toLowerCase();
      if (!options.logins.map((login) => login.toLowerCase()).includes(login)) {
        res.status(403).send({ error: `Login ${login} not authorized` });
        return;
      }
      res.locals.userLogin = login;
      next();
    } catch (err) {
      next(err);
    }
  }

  return options.protect_api ? authenticationMiddleware : noopMiddleware;
}

async function getLoginFromToken(
  authorization: string
): Promise<TokenValidationResult> {
  const validateHttpResponse = await fetch(
    "https://id.twitch.tv/oauth2/validate",
    { headers: { Authorization: authorization } }
  );
  if (!validateHttpResponse.ok) {
    const twitchError = await validateHttpResponse.text();
    return { success: false, error: `Twitch answered; ${twitchError}` };
  }
  const validateResponse = await validateHttpResponse.json();
  return { success: true, login: validateResponse.login };
}
type TokenValidationResult = TokenValidationSuccess | TokenValidationFailure;
interface TokenValidationSuccess {
  success: true;
  login: string;
}
interface TokenValidationFailure {
  success: false;
  error: string;
}

function noopMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}
