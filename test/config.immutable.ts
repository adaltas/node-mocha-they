import { configure } from "../src/index.js";

type Config = {
  immutable: string;
};

const they = configure<Config>([{ immutable: "value" }]);

describe("they.config.immutable", function () {
  they("immutable part 1", function (conf: Config) {
    conf.immutable = "ohno";
  });

  they("immutable part 2", function (conf: Config) {
    conf.immutable.should.eql("value");
  });
});
