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
  type AsyncFunc = (this: Context) => PromiseLike<unknown>;
}
*/

export type TheyFunc<T> = (
  this: mocha.Context,
  config: T,
  done: mocha.Done,
) => void;

type They<T> = {
  only: (msg: string, fn: TheyFunc<T>) => mocha.Test[];
  skip: (msg: string, fn: TheyFunc<T>) => mocha.Test[];
  (msg: string, fn: TheyFunc<T>): mocha.Test[];
};

function configure<T>(configs: (T | (() => T))[]): They<T>;
function configure<T, U>(
  configs: (T | (() => T))[],
  before: (config: T) => U | Promise<U>,
  after?: (config: U) => void,
): They<U>;
function configure<T, U = T>(
  configs: (T | (() => T))[],
  before?: (config: T) => Promise<U>,
  after?: (config: T | U) => void | Promise<void>,
): They<U> {
  // Config normalization
  const labels = Array(configs.length);
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
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
    fn: TheyFunc<U>,
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
          // Promise Style
          return Promise.resolve()
            .then(async () => {
              // Before hook
              const configNormalized =
                // eslint-disable-next-line mocha/no-top-level-hooks
                before === undefined ? config : await before(config);
              return configNormalized;
            })
            .then(async (config): Promise<[T | U, unknown, unknown]> => {
              // Handler execution
              try {
                return [
                  config,
                  undefined,
                  await (fn as TheyFunc<T | U>).call(this, config, () => {}),
                ];
              } catch (err: unknown) {
                return [config, err, undefined];
              }
            })
            .then(async ([config, err, prom]) => {
              // After hook
              if (after !== undefined) {
                // eslint-disable-next-line mocha/no-top-level-hooks
                await after(config);
              }
              if (err) {
                throw err;
              } else {
                return prom;
              }
            });
        } as mocha.AsyncFunc)
      : (function (this: mocha.Context, next: mocha.Done) {
          // Callback Style
          Promise.resolve()
            .then(async () => {
              // Before hook
              const configNormalized =
                // eslint-disable-next-line mocha/no-sibling-hooks,mocha/no-top-level-hooks
                before === undefined ? config : await before(config);
              return configNormalized;
            })
            .then(
              (config) =>
                // Handler execution
                new Promise<[T | U, unknown, unknown[]]>((resolve) => {
                  try {
                    (fn as TheyFunc<T | U>).call(
                      this,
                      config,
                      (...args: unknown[]) => {
                        resolve([config, null, args]);
                      },
                    );
                  } catch (err) {
                    resolve([config, err, []]);
                  }
                }),
            )
            .then(async ([config, err, args]: [T | U, unknown, unknown[]]) => {
              // After hook
              if (after !== undefined) {
                // eslint-disable-next-line mocha/no-top-level-hooks,mocha/no-sibling-hooks
                await after(config);
              }
              if (err) {
                throw next(err);
              } else {
                return next(...args);
              }
            });
        } as mocha.Func),
    ];
  }
  // Define the main entry point
  const they: They<U> = (msg, fn) => {
    return configs.map((config, i) => {
      return it(...handle.call(null, msg, labels[i], fn, config));
    });
  };
  // Mocha `only` implementation
  they.only = function (msg, fn) {
    return configs.map((config, i) => {
      // eslint-disable-next-line mocha/no-exclusive-tests
      return it.only(...handle.call(null, msg, labels[i], fn, config));
    });
  };
  // Mocha `skip` implementation
  they.skip = function (msg, fn) {
    return configs.map((config, i) => {
      // eslint-disable-next-line mocha/no-skipped-tests
      return it.skip(...handle.call(null, msg, labels[i], fn, config));
    });
  };
  // Return the final result
  return they;
}

export default configure;
export { configure };
export const they = configure;
