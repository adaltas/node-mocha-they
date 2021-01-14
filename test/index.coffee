
config = require '../test'
they = require('../src').configure [
    null
  ,
    ssh: host: '127.0.0.1', username: process.env.USER
]

describe 'they', ->

  they 'return `true`', (conf) ->
    true

  they 'return `{}`', (conf) ->
    {}

  they 'return `Promise.resolve`', (conf) ->
    new Promise (resolve) -> setImmediate resolve

  they 'call next synchronously', (conf, next) ->
    next()

  they 'call next asynchronously', (conf, next) ->
    setImmediate ->
      next()
