"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.they = void 0;
exports.configure = configure;
const mixme_1 = require("mixme");
// function configure<T extends Record<=string, unknown>[]>(...args: T) {
function configure(configs) {
    // Config normalization
    const labels = Array(configs.length);
    for (let i = 0; i < configs.length; i++) {
        let config = configs[i];
        if (typeof config === "object" && config !== null && "label" in config) {
            labels[i] = config?.label;
        }
        else {
            labels[i] = `${i}`;
        }
    }
    // fn implementation
    function handle(msg, label, fn, config) {
        if (typeof config === "function") {
            config = config();
        }
        else {
            config = (0, mixme_1.clone)(config);
        }
        return [
            `${msg} (${label})`,
            fn.length === 0 || fn.length === 1 ?
                function () {
                    return fn.call(this, config);
                }
                : function (next) {
                    return fn.call(this, config, next);
                },
        ];
    }
    // Define our main entry point
    function they(msg, fn) {
        return configs.map((config, i) => {
            return it(...handle.call(null, msg, labels[i], fn, config));
        });
    }
    // Mocha `only` implementation
    they.only = function (msg, fn) {
        return configs.map((config, i) => {
            return it.only(...handle.call(null, msg, labels[i], fn, config));
        });
    };
    // Mocha `skip` implementation
    they.skip = function (msg, fn) {
        return configs.map((config, i) => {
            return it.skip(...handle.call(null, msg, labels[i], fn, config));
        });
    };
    // Return the final result
    return they;
}
exports.they = configure;
//# sourceMappingURL=index.js.map