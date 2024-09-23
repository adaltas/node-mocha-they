import "should";
import { configure } from "../src/index.js";

interface Config {
  ssh: {
    host: string;
    username: string | undefined;
  };
}

const stack: string[] = [];

const they = configure<Config, Config>(
  [{ ssh: { host: "127.0.0.1", username: process.env.USER } }],
  (config: Config) => {
    stack.push("before");
    return config;
  },
  (): void => {
    stack.should.eql(["before", "handler"]);
  },
);

describe("they.handler", function () {
  they("call next synchronously", function () {
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        stack.push("handler");
        resolve();
      }, 200),
    );
  });
});
