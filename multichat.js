var hyperswarm = require('hyperswarm')
var hypercore = require('hypercore')
var multifeed = require('multifeed')
const crypto = require('crypto')
var pump = require('pump')

// Check args
if (!process.argv[2] || process.argv.length > 5) {
  console.log('USAGE: "node multifeed.js nickname [topic] [num]"')
  console.log(' - the default [topic] is "meh"')
  console.log(' - [num] arg is used for store multiple feeds on the same machine (default 0)')

  process.exit(1)
  return
}

var nickname = process.argv[2]
var topic = process.argv[3] || 'meh' // meh is the default topic
var num = process.argv[4] || 0

// Creating topic
const topicHex = crypto.createHash('sha256')
  .update(topic)
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
      nickname: nickname,
      text: data.toString(),
      timestamp: new Date().toISOString()
    })
  })
})

multi.ready(function() {
  var feeds = multi.feeds()

  // iterate over each feed that exists locally..
  feeds.forEach(function(feed) {
    // feed is a hypercore! (remember reading from hypercores in previous exercises?)
    feed.createReadStream({ live: true })
      .on('data', function(data) {
        console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`)
      })
  })

  // listen for new feeds that might be shared with us during runtime..
  multi.on('feed', function(feed) {
    feed.createReadStream({ live: true })
      .on('data', function(data) {
        console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`)
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
