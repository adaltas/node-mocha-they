#!/usr/bin/env npx mocha samples/before-after-typescript.ts

import { configure } from "../src/index.js";
// import { configure } from "mocha-they";

type SshClient = {
  test: () => void;
  close: () => void;
};

const connect = (ssh: Config["ssh"]): undefined | Promise<SshClient> => {
  if (ssh === undefined) return undefined;
  console.info(" ".repeat(6) + `connected to ${ssh.host}`);
  return Promise.resolve({
    test: () => {
      console.info(" ".repeat(6) + `SSH client called`);
    },
    close: () => {
      console.info(" ".repeat(6) + `Disconnected from ${ssh.host}`);
    },
  });
};

interface Config {
  label?: string;
  ssh?: {
    host: string;
    username?: string;
  };
}
interface ConfigConnected {
  ssh?: SshClient;
}

const they = configure<Config, ConfigConnected>(
  [
    {
      label: "local",
      ssh: undefined,
    },
    {
      label: "ssh object",
      ssh: { host: "127.0.0.1", username: process.env.USER },
    },
    () => ({
      ssh: { host: "localhost" },
    }),
  ],
  async (config: Config): Promise<ConfigConnected> => {
    return {
      ssh: await connect(config.ssh),
    };
  },
);

describe("Test before/after usage", function () {
  they("Called 3 times", function (config: ConfigConnected) {
    if (config.ssh === undefined) {
      console.info(" ".repeat(6) + "SSH client not connected");
    } else {
      config.ssh.test();
    }
  });
});
