
they = require('../src')([key: 'value'])

describe 'they.config', ->

  they 'immutable part 1', (conf) ->
    conf.invalid = true

  they 'immutable part 2', (conf) ->
    should.not.exist conf.invalid
  
