
Extends mocha with a function similar to `it` but 
running both locally and remotely

    connect = require 'ssh2-connect'
    
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
        configs[i].name ?= "#{i}.#{unless config.ssh?.host then 'local' else 'remote'}"
        if config.ssh is true
          configs[i].ssh = host: 'localhost', port: 22
      # Local execution for promises
      promise_local = (context, config, handler) ->
        handler.call context, {...config}
      # Remote execution for promises
      promise_remote = (context, config, handler) ->
        ssh = await connect config.ssh
        close = ->
          new Promise (resolve) ->
            opened = ssh._sshstream?.writable and ssh._sock?.writable
            return resolve() unless opened
            ssh.end()
            ssh.on 'end', ->
              process.nextTick -> resolve()
        try
          await handler.call context, {...config, ssh: ssh}
          close()
        catch err
          await close()
          throw err
      # Local execution for callbacks
      callback_local = (context, config, handler, next) ->
        handler.call context, {...config}, next
        return null
      # Remote execution for callbacks
      callback_remote = (context, config, handler, next) ->
        connect config.ssh, (err, ssh) ->
          return next err if err
          handler.call context, {...config, ssh: ssh}, (err) ->
            open = ssh._sshstream?.writable and ssh._sock?.writable
            return next() unless open
            ssh.end()
            ssh.on 'end', ->
              process.nextTick -> next err
        null
      # Define our main entry point
      they = (msg, handler) ->
        if [0, 1].includes handler.length
          for config, i in configs then do (config, i) ->
            unless config.ssh
            then it "#{msg} (#{config.name})", -> promise_local @, config, handler
            else it "#{msg} (#{config.name})", -> promise_remote @, config, handler
        else
          for config, i in configs then do (config, i) ->
            unless config.ssh
            then it "#{msg} (#{config.name})", (next) -> callback_local @, config, handler, next
            else it "#{msg} (#{config.name})", (next) -> callback_remote @, config, handler, next
      they.only = (msg, handler) ->
        if [0, 1].includes handler.length
          for config, i in configs then do (config, i) ->
            unless config.ssh
            then it.only "#{msg} (#{config.name})", -> promise_local @, config, handler
            else it.only "#{msg} (#{config.name})", -> promise_remote @, config, handler
        else
          for config, i in configs then do (config, i) ->
            unless config.ssh
            then it.only "#{msg} (#{config.name})", (next) -> callback_local @, config, handler, next
            else it.only "#{msg} (#{config.name})", (next) -> callback_remote @, config, handler, next
      they.skip = (msg, handler) ->
        if [0, 1].includes handler.length
          for config, i in configs then do (config, i) ->
            unless config.ssh
            then it.skip "#{msg} (#{config.name})", -> promise_local @, config, handler
            else it.skip "#{msg} (#{config.name})", -> promise_remote @, config, handler
        else
          for config, i in configs then do (config, i) ->
            unless config.ssh
            then it.skip "#{msg} (#{config.name})", (next) -> callback_local @, config, handler, next
            else it.skip "#{msg} (#{config.name})", (next) -> callback_remote @, config, handler, next
      # Return the final result
      they
        
    module.exports = configure()
    
    module.exports.configure = (configs...) ->
      configure configs...
