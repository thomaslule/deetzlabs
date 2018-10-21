declare module 'express-http-proxy';

declare module "stream-filter" {
  import { Transform } from "stream";

  export function obj(filter: (data: any) => boolean): Transform;
}
