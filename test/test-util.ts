import { Event } from "es-objects";
import { readFileSync } from "fs";
import { Pool } from "pg";
import { Readable } from "stream";
import { getOptions } from "../src/options";
import { Obj } from "../src/util";
// @ts-ignore
import * as testOptionsObj from "./test-options";

export const testOptions = getOptions(testOptionsObj);

export function makeViewerEvent(data: Obj = {}): Event {
  return {
    aggregate: "viewer",
    id: "123",
    sequence: 0,
    version: 1,
    date: new Date().toISOString(),
    ...data
  };
}

export function makeBroadcastEvent(data: Obj = {}): Event {
  return {
    aggregate: "broadcast",
    id: "broadcast",
    sequence: 0,
    version: 1,
    date: new Date().toISOString(),
    ...data
  };
}

export async function wait(ms: number = 50) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const schema = readFileSync("./src/schema.sql", "utf8");

export async function getCleanDb() {
  const db = new Pool({
    connectionString:
      "postgresql://postgres:admin@localhost:5432/deetzlabs_test"
  });
  await db.query(schema);
  return db;
}

export function arrayToStream(array: any[]): Readable {
  let index = 0;
  return new Readable({
    objectMode: true,
    read() {
      if (index >= array.length) {
        this.push(null); // tslint:disable-line:no-null-keyword
      } else {
        this.push(array[index]);
        index++;
      }
    }
  });
}
