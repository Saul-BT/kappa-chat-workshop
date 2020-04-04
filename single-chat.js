// Save this file as single-chat.js

var hypercore = require('hypercore')
var feed = hypercore('./single-chat-feed', {
  valueEncoding: 'json'
})

// Printing feed keys
feed.ready(function () {
  console.log('public key:', feed.key.toString('hex'))
  console.log('discovery key:', feed.discoveryKey.toString('hex'))
  console.log('secret key:', feed.secretKey.toString('hex'))
})

// Appending new data from stdin to the feed
process.stdin.on('data', function(data) {
  feed.append({
    type: 'chat-message',
    nickname: 'cat-lover',
    text: data.toString().trim(),
    timestamp: new Date().toISOString()
  })
})

// Creating a read-only steam to read
// data from the feed
feed.createReadStream({ live: true })
  .on('data', function(data) {
    console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`)
  })
