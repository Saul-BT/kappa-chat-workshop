var hyperswarm = require('hyperswarm')
var hypercore = require('hypercore')
var pump = require('pump')

var feed = hypercore('./single-chat-feed-clone',
  '{public key of the feed}', {
  valueEncoding: 'json'
})

// Creating a read-only steam to read
// data from the feed
feed.createReadStream({ live: true })
  .on('data', function(data) {
    console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`)
  })


var swarm = hyperswarm()

feed.ready(function() {
  // Printing feed keys
  console.log('public key:', feed.key.toString('hex'))
  console.log('discovery key:', feed.discoveryKey.toString('hex'))
  // This peer has not a secret key for the feed,
  // For this reason, It has read-only access to the feed.
  // console.log('secret key:', feed.secretKey.toString('hex'))
  
  // we use the discovery as the topic
  swarm.join(feed.discoveryKey, {
    lookup: true, // find & connect to peers
    announce: true // optional- announce self as a connection target
  })
  swarm.on('connection', function(socket, details) {
    // console.log('(New peer connected!)')

    // We use the pump module instead of stream.pipe(otherStream)
    // as it does stream error handling, so we do not have to do that
    // manually.

    // See below for more detail on how this work.
    pump(socket, feed.replicate(details.initiator, { live: true }), socket)
  })
})
