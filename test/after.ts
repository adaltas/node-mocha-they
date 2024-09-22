import { configure } from "../src/index.js";
import { FakeSsh, type Config, type ConfigNormalized } from "./before.js";

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
  (config: ConfigNormalized) => {
    config.ssh.end();
  },
);

describe("they.after", function () {
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
