const { Deetzlabs } = require("../lib");
const testOptions = require("./test-options");

const deetzlabs = new Deetzlabs({
  ...testOptions,
  secret: "secret",
});
deetzlabs.start();
