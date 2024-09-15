#!/usr/bin/env npx mocha samples/usage-typescript.ts

import { configure } from "../src/index.js";
// import { configure } from "mocha-they";

interface Config {
  ssh?: {
    host: string;
    username?: string;
  };
}

const they = configure<Config>([
  {
    ssh: undefined,
  },
  {
    ssh: { host: "127.0.0.1", username: process.env.USER },
  },
  () => ({
    ssh: { host: "localhost" },
  }),
]);

describe("Test mocha-they", function () {
  they("Call 2 times", function (conf: Config) {
    if (conf.ssh === undefined) {
      console.info(" ".repeat(6) + "Got null.");
    } else {
      console.info(" ".repeat(6) + "Got an ssh configuration.");
    }
  });
});
