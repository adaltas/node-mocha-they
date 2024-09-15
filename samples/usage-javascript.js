#!/usr/bin/env npx mocha samples/usage-javascript.js

import { configure } from "../src/index.js";
// import { configure } from "mocha-they";

const they = configure([
  {
    ssh: undefined,
  },
  {
    ssh: { host: "127.0.0.1", username: process.env.USER },
  },
  () => ({
    ssh: { host: "127.0.0.1", username: process.env.USER },
  }),
]);
describe("Test mocha-they", function () {
  they("Call 2 times", function (conf) {
    if (conf.ssh === undefined) {
      console.info(" ".repeat(6) + "Got null.");
    } else {
      console.info(" ".repeat(6) + "Got an ssh configuration.");
    }
  });
});
