var kappa = require('kappa-core')
var memdb = require('memdb')
var list = require('kappa-view-list')

var timestampView = list(memdb(), function(msg, next) {
  if (msg.value.timestamp && typeof msg.value.timestamp === 'string') {
    // sort on the 'timestamp' field
    next(null, [msg.value.timestamp])
  } else {
    next()
  }
})

var core = kappa('./multichat', { valueEncoding: 'json' })
core.use('chats', timestampView)

core.writer('local', function(err, feed) {
  feed.append({ type: 'chat-message', timestamp: new Date().toISOString() })
})

core.api.chats.read()
  .on('data', console.log)
