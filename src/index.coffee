
flatten =  (arr) ->
  ret = []
  for i in [0 ... arr.length]
    if Array.isArray arr[i]
      ret.push flatten(arr[i])...
    else
      ret.push arr[i]
  ret

configure = (configs...) ->
  configs = flatten configs
  for config, i in configs
    configs[i] = config = {} unless config?
    configs[i].label ?= "#{i}"
  # Local execution for promises
  handle_promise = (context, config, handler) ->
    handler.call context, config
  # Remote execution for promises
  # Local execution for callbacks
  handle_callback = (context, config, handler, next) ->
    handler.call context, config, next
    null
  # Define our main entry point
  they = (msg, handler) ->
    if [0, 1].includes handler.length
      for config in configs then do (config) ->
        it "#{msg} (#{config.label})", -> handle_promise @, config, handler
    else
      for config in configs then do (config) ->
        it "#{msg} (#{config.label})", (next) -> handle_callback @, config, handler, next
  they.only = (msg, handler) ->
    if [0, 1].includes handler.length
      for config in configs then do (config) ->
        it.only "#{msg} (#{config.label})", -> handle_promise @, config, handler
    else
      for config in configs then do (config) ->
        it.only "#{msg} (#{config.label})", (next) -> handle_callback @, config, handler, next
  they.skip = (msg, handler) ->
    if [0, 1].includes handler.length
      for config in configs then do (config) ->
        it.skip "#{msg} (#{config.label})", -> handle_promise @, config, handler
    else
      for config in configs then do (config) ->
        it.skip "#{msg} (#{config.label})", (next) -> handle_callback @, config, handler, next
  # Return the final result
  they
    
module.exports = configure()

module.exports.configure = (configs...) ->
  configure configs...
