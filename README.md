# Node.js mocha-they

The package extends [Mocha](https://mochajs.org/) with a new `they` function as an alternative to `it`. Its purpose is the execution of a test with multiple configuration settings.

This package was originally written to test [ssh2-fs](https://github.com/adaltas/node-ssh2-fs), [ssh2-exec](https://github.com/adaltas/node-ssh2-exec) and [Nikita](http://nikita.js.org/). For example, in those packages, each test is run twice: the first time on a local environment and a second time on a remote environment with SSH.

## Installation

This is OSS and licensed under the [MIT license](https://github.com/adaltas/node-mocha-they/blob/master/LICENSE.md).

```bash
npm i -D mocha-they
```

## Usage

Main steps:

1. Import the `configure` function from the `mocha-they` package.
2. If using Typescript, type the configuration argument.
3. Initialize `they` by calling `configure` with an array of configurations.
4. Use the `they` function just like `it`.

The package exports a function, `configure`. It is written in Typescript and exported in both CommonJs and ESM.

```ts
import { configure } from "mocha-they";
```

Test functions receive a new argument.

For Typescript users, configure is a generic. The first type is required and defines the configuraiton object. The second is optional when `before` is used to alter the configuration

```ts
function configure<T>(configs: (T | (() => T))[]): They<T>;
function configure<T, U>(
  configs: (T | (() => T))[],
  before: (config: T) => U,
  after?: (config: U) => void,
): They<U>;
```

Call the `configure` function with an array of values to initialize `they`.

A configuration may be of any type. The value is passed as the first argument of the test handler function.

Functions receive a special treatment. They are called before the test and its value is passed to the tet handler as first argument.

```ts
interface Config {
  ssh?: {
    host: string;
    username: string | undefined;
  };
}
const they = configure<Config>([
  {
    ssh: undefined,
  },
  {
    ssh: { host: "127.0.0.1", username: process.env.USER },
  },
  () => ({
    ssh: { host: "localhost" },
  }),
]);
```

```ts
interface Config {
  ssh?: {
    host: string;
    username: string | undefined;
  };
}
const they = configure<Config>(
  [
    {
      ssh: undefined,
    },
    {
      ssh: { host: "127.0.0.1", username: process.env.USER },
    },
    () => ({
      ssh: { host: "localhost" },
    }),
  ],
  (config: Config) => {},
);
```

Finally, use `they` just like `it`.

```ts
describe("Test mocha-they", function () {
  they("With a promise", function (conf: Config) {
    // Run test
    return promise.resolve();
  });
  they("With a callback", function (conf: Config, next) {
    // Run test
    return next();
  });
});
```

## Example

The [Javascript example](samples/usage-javascript.js) is executed with `npx mocha samples/usage-javascript.js`.

```js
import { configure } from "mocha-they";

const they = configure([
  {
    ssh: undefined,
  },
  {
    ssh: { host: "127.0.0.1", username: process.env.USER },
  },
]);
describe("Test mocha-they", function () {
  they("Call 2 times", function (conf) {
    if (conf.ssh === undefined) {
      console.info(" ".repeat(6) + "Got null.");
    } else {
      console.info(" ".repeat(6) + "Got an ssh configuration.");
    }
  });
});
```

The [Typescript example](samples/usage-typescript.js) is executed with `npx mocha samples/usage-typescript.ts`.

```ts
import { configure } from "mocha-they";

interface Config {
  ssh?: {
    host: string;
    username: string | undefined;
  };
}

const they = configure<Config>([
  {
    ssh: undefined,
  },
  {
    ssh: { host: "127.0.0.1", username: process.env.USER },
  },
]);

describe("Test mocha-they", function () {
  they("Call 2 times", function (conf: Config) {
    if (conf.ssh === undefined) {
      console.info(" ".repeat(6) + "Got null.");
    } else {
      console.info(" ".repeat(6) + "Got an ssh configuration.");
    }
  });
});
```

The configuration elements can be anything. When an an object, an optional label property can be provided to customized the message output.

It returns a new function which behave exactly like the `it` function in mocha. The only difference is the presence of the configuration element as the first argument of the test. Like with `it`, you can customize Mocha with the `only` and `skip` directives.

## Example using the before and after configuration hooks

A more complexe example covers the [usage of `before` and `after`](./samples/before-after-typescript.ts). In this example, an `ssh` object is converted to a fake SSH client and the connection is closed after the tests.

```ts
Test before/after usage
    SSH client not connected
  ✔ Called 3 times (local)
    connected to 127.0.0.1
    SSH client called
  ✔ Called 3 times (ssh object)
    connected to localhost
    SSH client called
  ✔ Called 3 times (2)
```

## Release

Versions are incremented using semantic versioning. Test and publishing are handled with Github Actions. To create a new version and publish it to NPM, run:

```bash
npm run release
# Or (`git push` is only supported for the release script)
npm run release:<major|minor|patch>
git push --follow-tags origin master
```

The NPM publication is handled with the GitHub action.

## Contributors

The project is sponsored by [Adaltas](https://www.adaltas.com), a company based in Paris, France. Adaltas offers support and consulting on distributed system, big data and open source.

- David Worms: <https://github.com/wdavidw>
