import { Event } from "es-objects";
import { getOptions } from "../src/get-options";
import { Obj } from "../src/util";
import * as testOptionsObj from "./test-options";

export const testOptions = getOptions(testOptionsObj);

export function makeEvent(data: Obj): Event {
  return {
    aggregate: "viewer",
    id: "123",
    sequence: 0,
    insertDate: new Date().toISOString(),
    ...data,
  };
}
