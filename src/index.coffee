
{clone} = require 'mixme'

configure = (configs...) ->
  configs = configs.flat(Infinity)
  for config, i in configs
    configs[i] = config = {} unless config?
    configs[i].label ?= "#{i}"
  # Promise implementation
  handle_promise = (handler, context, args) ->
    handler.apply context, args
  # Callback implementation
  handle_callback = (handler, context, args) ->
    handler.apply context, args
    null
  to_args = (msg, handler, context, config)->
    [
      "#{msg} (#{config.label})"
    ,
      if [0, 1].includes handler.length
      then ->
        handler.call @, config
      else (next) ->
        handler.call @, config, next
        null
    ]
  # Define our main entry point
  they = (msg, handler) ->
    configs.map (config) ->
      it.apply null, to_args msg, handler, context, clone config
  they.only = (msg, handler) ->
    configs.map (config) ->
      it.only.apply null, to_args msg, handler, context, clone config
  they.skip = (msg, handler) ->
    configs.map (config) ->
      it.skip.apply null, to_args msg, handler, context, clone config
  # Return the final result
  they

module.exports = (configs...) ->
  configure configs...
