var hyperswarm = require('hyperswarm')

var swarm = hyperswarm()

var topic = Buffer.from('a49766a23610999dc5dfe05bc37cd98a9911d4b46bd25fc2cd037b9669a1e214', 'hex')

swarm.join(topic, {
  lookup: true, // find & connect to peers
  announce: true // optional- announce yourself as a connection target
})

// this event is fired every time you find and connect to a new peer also on the same key
swarm.on('connection', function (socket, details) {
  // `details` is a simple object that describes the peer we connected to
  console.log('found a peer', details)
  // `socket` is a duplex stream that you read from and write to it, e.g.,
  process.stdin.pipe(socket).pipe(process.stdout)
  //socket.write('hello peers')
})
