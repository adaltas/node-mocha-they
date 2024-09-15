import * as mocha from "mocha";
type TheyFunc<T> = (this: mocha.Context, config: T, done: mocha.Done) => void;
type TheyAsyncFunc<T> = (this: mocha.Context, config: T) => PromiseLike<any>;
declare function configure<T>(configs: (T | (() => T))[]): {
    (msg: string, fn: TheyFunc<T> | TheyAsyncFunc<T>): mocha.Test[];
    only(msg: string, fn: TheyFunc<T> | TheyAsyncFunc<T>): mocha.Test[];
    skip(msg: string, fn: TheyFunc<T> | TheyAsyncFunc<T>): mocha.Test[];
};
export { configure };
export declare const they: typeof configure;
