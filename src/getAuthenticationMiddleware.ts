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
        res.sendStatus(401);
        return;
      }
      const userResponse = await getLoginFromToken(authorization);
      if (!userResponse.success) {
        res.sendStatus(401);
        return;
      }
      const login = userResponse.login;
      if (!options.logins.map(login => login.toLowerCase()).includes(login)) {
        res.sendStatus(401);
        return;
      }
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
    {
      headers: { Authorization: authorization }
    }
  );
  if (!validateHttpResponse.ok) {
    return { success: false };
  }
  const validateResponse = await validateHttpResponse.json();
  return { success: true, login: validateResponse.login.toLowerCase() };
}
type TokenValidationResult = TokenValidationSuccess | TokenValidationFailure;
interface TokenValidationSuccess {
  success: true;
  login: string;
}
interface TokenValidationFailure {
  success: false;
}

function noopMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}
