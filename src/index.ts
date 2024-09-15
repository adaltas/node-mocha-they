import { clone } from "mixme";
import * as mocha from "mocha";

/*
// For reference, extract from @types/mocha/index.d.ts
declare module "mocha" {
  // line 2429
  it: TestFunction;
  // line 2469
  interface TestFunction {
    (title: string, fn?: Func): Test;
    (title: string, fn?: AsyncFunc): Test;
  };
  // line 2290
  type Func = (this: Context, done: Done) => void;
  // line 2295
  type AsyncFunc = (this: Context) => PromiseLike<any>;
}
*/

type TheyFunc<T> = (this: mocha.Context, config: T, done: mocha.Done) => void;
type TheyAsyncFunc<T> = (this: mocha.Context, config: T) => PromiseLike<any>;

type ExcludeFunction<T> = T extends Function ? never : T;

// function configure<T extends Record<=string, unknown>[]>(...args: T) {
function configure<T>(configs: (T | (() => T))[]) {
  // Config normalization
  const labels = Array(configs.length);
  for (let i = 0; i < configs.length; i++) {
    let config = configs[i];
    if (typeof config === "object" && config !== null && "label" in config) {
      labels[i] = config?.label;
    } else {
      labels[i] = `${i}`;
    }
  }
  // fn implementation
  function handle(
    msg: string,
    label: string,
    fn: TheyFunc<T> | TheyAsyncFunc<T>,
    config: T | (() => T),
  ): [string, mocha.Func | mocha.AsyncFunc] {
    if (typeof config === "function") {
      config = (config as () => T)();
    } else {
      config = clone(config);
    }
    return [
      `${msg} (${label})`,
      fn.length === 0 || fn.length === 1 ?
        (function (this: mocha.Context) {
          return (fn as TheyAsyncFunc<T>).call(this, config);
        } as mocha.AsyncFunc)
      : (function (this: mocha.Context, next: mocha.Done) {
          return (fn as TheyFunc<T>).call(this, config, next);
        } as mocha.Func),
    ];
  }
  // Define our main entry point
  function they(msg: string, fn: TheyFunc<T> | TheyAsyncFunc<T>): mocha.Test[] {
    return configs.map((config, i) => {
      return it(...handle.call(null, msg, labels[i], fn, config));
    });
  }
  // Mocha `only` implementation
  they.only = function (
    msg: string,
    fn: TheyFunc<T> | TheyAsyncFunc<T>,
  ): mocha.Test[] {
    return configs.map((config, i) => {
      return it.only(...handle.call(null, msg, labels[i], fn, config));
    });
  };
  // Mocha `skip` implementation
  they.skip = function (
    msg: string,
    fn: TheyFunc<T> | TheyAsyncFunc<T>,
  ): mocha.Test[] {
    return configs.map((config, i) => {
      return it.skip(...handle.call(null, msg, labels[i], fn, config));
    });
  };
  // Return the final result
  return they;
}

export { configure };
export const they = configure;
