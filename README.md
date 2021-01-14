
# Node.js mocha-they

Extends [Mocha](https://mochajs.org/) with a new `they` function replacing `it`. The goal is to execute the same test in multiple configuration environments.

This package was originally written to test [ssh2-fs](https://github.com/adaltas/node-ssh2-fs), [ssh2-exec](https://github.com/adaltas/node-ssh2-exec) and [Nikita](http://nikita.js.org/). For example, in those packages, each test is run twice: the first time on a local environment and a second time on a remote environment with SSH.

## Installation

This is OSS and licensed under the [MIT license](https://github.com/adaltas/node-mocha-they/blob/master/LICENSE.md).

```bash
npm install mocha-fs
```

## Usage

The package  `mocha-they` exports a function. Call this function with an array of configuration to initialize it.

The configuration elements can be anything. When an an object, an optional label property can be provided to customized the message output.

It returns a new function which behave exactly like the `it` function in mocha. The only difference is the precence of the configuration element as the first argument of the test. Like with `it`, you can customize Mocha with the `only` and `skip` directives.

## Example

The below example found inspiration in the [Nikita `execute` action](https://nikita.js.org) which execute a Shell command.

This test will connect to localhost with the current working user:

```js
const should = require('should')
const fs = require('ssh2-fs')
const they = require('ssh2-they')([{
  label: 'local',
  ssh: null
}, {
  label: 'remote',
  ssh: {
    host: 'localhost',
    username: 'root',
    private_key_path: '~/.ssh/id_rsa'
  }
}])

describe('exists', function(){

  they('on file', function({ssh}){
    const {whoami} = await nikita({
      ssh: ssh
    }).execute('whoami')
    whoami.should.eql(
      !ssh ? require("os").userInfo().username : ssh.username
    )
  })

})
```

## Contributors

*   David Worms: <https://github.com/wdavidw>
