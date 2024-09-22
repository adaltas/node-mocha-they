import { configure, TheyFunc, TheyAsyncFunc } from "../src/index.js";

export class FakeSsh {
  async open() {}
  async end() {}
  async test() {}
}
export interface Config {
  ssh: {
    host: string;
    username: string | undefined;
  };
}
export interface ConfigNormalized {
  ssh: FakeSsh;
}

const they = configure<Config, ConfigNormalized>(
  [{ ssh: { host: "127.0.0.1", username: process.env.USER } }],
  (config: Config): ConfigNormalized => {
    const ssh = new FakeSsh();
    ssh.open();
    const configNormalized: ConfigNormalized = {
      ssh: ssh,
    };
    return configNormalized;
  },
);

describe("they.before", function () {
  they("with promise", async function (config: { ssh: FakeSsh }) {
    await config.ssh.test();
    return Promise.resolve();
  });
  they("with callback", function (config: { ssh: FakeSsh }, callback) {
    config.ssh.test().then(() => {
      callback();
    });
  });
});
