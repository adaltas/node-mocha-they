const they = require("../src")([
  null,
  { ssh: { host: "127.0.0.1", username: process.env.USER } },
]);

describe("they.handler", function () {
  they("return `true`", function (conf) {
    return true;
  });

  they("return `{}`", function (conf) {
    return {};
  });

  they("return `Promise.resolve`", function (conf) {
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
