var hyperswarm = require('hyperswarm')
var hypercore = require('hypercore')
var multifeed = require('multifeed')
const crypto = require('crypto')
var pump = require('pump')

// Check args
if (! process.argv[2] || process.argv.length > 4) {
  console.log('USAGE: "node multifeed.js topic [num]"')
  console.log(' - num arg is used for store multiple feeds on the same machine')
  
  process.exit(1)
  return
}

var topic = pocess.argv[2]
var num = process.argv[3] || 0

// Creating topic
const topicHex = crypto.createHash('sha256')
		    .update()
		    .digest()

// Creating multifeed
var multi = multifeed(`./multichat-${num}`, {
  valueEncoding: 'json'
})

// Creating writer
multi.writer('local', function(err, feed) {
  startSwarm(topicHex)

  process.stdin.on('data', function(data) {
    feed.append({
      type: 'chat-message',
      nickname: 'cat-lover',
      text: data.toString(),
      timestamp: new Date().toISOString()
    })
  })
})

// Joining swarm by topic
function startSwarm(topic) {
  var swarm = hyperswarm()

  swarm.join(topic, {
    lookup: true, // find & connect to peers
    announce: true // optional- announce self as a connection target
  })
  swarm.on('connection', function(connection, info) {
    console.log('(New peer connected!)')
    pump(connection, multi.replicate(info.client, { live: true }), connection)
  })
}
