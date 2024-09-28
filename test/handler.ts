import should from "should";
import { configure } from "../src/index.js";

interface Config {
  ssh: null | {
    host: string;
    username: string | undefined;
  };
}

const they = configure<Config>([
  { ssh: null },
  { ssh: { host: "127.0.0.1", username: process.env.USER } },
]);

describe("they.handler", function () {
  describe("promise", function () {
    they("argument is typed", function ({ ssh }) {
      // Test this
      this.retries(1);
      // Test function argument
      should(ssh === null || typeof ssh.host === "string").be.true();
      return true;
    });

    they("return `true`", function () {
      return true;
    });

    they("return `{}`", function () {
      return {};
    });

    they("return `Promise.resolve`", function () {
      return new Promise(function (resolve) {
        setImmediate(resolve);
      });
    });
  });

  describe("callbak", function () {
    they("argument is typed", function ({ ssh }, next) {
      // Test this
      this.retries(1);
      // Test function argument
      should(ssh === null || typeof ssh.host === "string").be.true();
      next();
    });

    they("call next synchronously", function (conf, next) {
      this.timeout(200);
      next();
    });

    they("call next asynchronously", function (conf, next) {
      setImmediate(function () {
        next();
      });
    });
  });
});
