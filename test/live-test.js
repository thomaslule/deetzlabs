const { Deetzlabs, resetDatabase } = require("../lib");
const testOptions = require("./test-options");

async function start() {
  await resetDatabase("postgresql://postgres:admin@localhost:5432/deetzlabs")
  const deetzlabs = new Deetzlabs({
    ...testOptions,
    protect_api: false,
  });
  deetzlabs.start();
}

start().catch((err) => { console.log(err); });
