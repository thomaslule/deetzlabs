import { readFileSync } from "fs";
import { Pool } from "pg";
import { Deetzlabs } from "../src";
import { secretOptions } from "./secret-options";
import { testOptions } from "./test-options";

async function start() {
  const db = new Pool({
    connectionString:
      "postgresql://postgres:admin@localhost:5432/deetzlabs_test"
  });
  const schema = readFileSync("./src/schema.sql", "utf8");
  await db.query(schema);
  await db.end();
  const deetzlabs = new Deetzlabs({
    ...testOptions,
    ...secretOptions
  });
  await deetzlabs.start();
}

start().catch(err => {
  console.log(err);
});
