const { Deetzlabs } = require("../lib");
const testOptions = require("./test-options");

const deetzlabs = new Deetzlabs({
  ...testOptions,
  protect_api: false,
});
deetzlabs.start();
