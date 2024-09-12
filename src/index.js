import { clone } from "mixme";

function configure(...configs) {
  // Config normalization
  configs = configs.flat(Infinity);
  for (let i = 0; i < configs.length; i++) {
    if (configs[i] == null) {
      configs[i] = {};
    }
    if (configs[i].label == null) {
      configs[i].label = `${i}`;
    }
  }
  // Handler implementation
  function call(msg, handler, context, config) {
    return [
      `${msg} (${config.label})`,
      [0, 1].includes(handler.length)
        ? function () {
            return handler.call(this, config);
          }
        : function (next) {
            handler.call(this, config, next);
            return null;
          },
    ];
  }
  // Define our main entry point
  function they(msg, handler) {
    return configs.map((config) => {
      return it.apply(null, call(msg, handler, context, clone(config)));
    });
  }
  // Mocha `only` implementation
  they.only = function (msg, handler) {
    return configs.map((config) => {
      return it.only.apply(null, call(msg, handler, context, clone(config)));
    });
  };
  // Mocha `skip` implementation
  they.skip = function (msg, handler) {
    return configs.map((config) => {
      return it.skip.apply(null, call(msg, handler, context, clone(config)));
    });
  };
  // Return the final result
  return they;
}

export default configure;

export { configure };
