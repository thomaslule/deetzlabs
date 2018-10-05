import { Event } from "es-objects";
import { getOptions } from "../src/get-options";
import { Obj } from "../src/util";
import * as testOptionsObj from "./test-options";

export const testOptions = getOptions(testOptionsObj);

export function makeViewerEvent(data: Obj): Event {
  return {
    aggregate: "viewer",
    id: "123",
    sequence: 0,
    insertDate: new Date().toISOString(),
    ...data,
  };
}

export function makeBroadcastEvent(data: Obj): Event {
  return {
    aggregate: "broadcast",
    id: "broadcast",
    sequence: 0,
    insertDate: new Date().toISOString(),
    ...data,
  };
}
