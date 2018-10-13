const { Deetzlabs, resetDatabase } = require("../lib");
const testOptions = require("./test-options");
const secretOptions = require("./secret-options");

async function start() {
  await resetDatabase("postgresql://postgres:admin@localhost:5432/deetzlabs")
  const deetzlabs = new Deetzlabs({
    ...testOptions,
    ...secretOptions,
    protect_api: false,
  });
  await deetzlabs.start();
}

start().catch((err) => { console.log(err); });
