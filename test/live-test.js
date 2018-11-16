const { Pool } = require("pg");
const { readFileSync } = require("fs");
const { Deetzlabs } = require("../lib");
const testOptions = require("./test-options");
const secretOptions = require("./secret-options");

async function start() {
  const db = new Pool({ connectionString: "postgresql://postgres:admin@localhost:5432/deetzlabs_test" });
  const schema = readFileSync("./src/schema.sql", "utf8");
  await db.query(schema);
  await db.end();
  const deetzlabs = new Deetzlabs({
    ...testOptions,
    ...secretOptions,
    log_to_console: true,
    protect_api: false,
  });
  await deetzlabs.start();
}

start().catch((err) => { console.log(err); });
