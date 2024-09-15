import "should";
import { configure } from "../src/index.js";

interface Config {
  get: string;
}

const they = configure<Config>([() => ({ get: "me" })]);

describe("they.config.function", function () {
  they("config is function return", function (conf: Config) {
    conf.get.should.eql("me");
    return true;
  });
});
