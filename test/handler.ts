import { configure } from "../src/index.js";

interface Config {
  ssh: {
    host: string;
    username: string | undefined;
  };
}

const they = configure<null | Config>([
  null,
  { ssh: { host: "127.0.0.1", username: process.env.USER } },
]);

describe("they.handler", function () {
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