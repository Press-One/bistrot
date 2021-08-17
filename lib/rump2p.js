'use strict'

const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const { NOISE } = require('libp2p-noise')
const MPLEX = require('libp2p-mplex')
const { Multiaddr } = require('multiaddr')
const Gossipsub = require('quorum-gossipsub')
const MulticastDNS = require('libp2p-mdns')
const Bootstrap = require('libp2p-bootstrap')

const main = async () => {
    console.log(Libp2p.constants);
    const node = await Libp2p.create({
        addresses: {
            // add a listen address (localhost) to accept TCP connections on a random port
            listen: ['/ip4/127.0.0.1/tcp/0']
        },
        modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            // we add the Pubsub module we want
            pubsub: Gossipsub
        },
        config: {
            // protocolPrefix: '/quorum', // default
            pubsub: {                     // The pubsub options (and defaults) can be found in the pubsub router documentation
                enabled: true,
                emitSelf: true,                                  // whether the node should emit to self on publish
                // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy

            },
            peerDiscovery: {
                autoDial: true,             // Auto connect to discovered peers (limited by ConnectionManager minConnections)
                // The `tag` property will be searched when creating the instance of your Peer Discovery service.
                // The associated object, will be passed to the service when it is instantiated.
                [MulticastDNS.tag]: {
                    interval: 1000,
                    enabled: true
                },
                [Bootstrap.tag]: {
                    list: [ // A list of bootstrap peers to connect to starting up the node
                        '/ip4/127.0.0.1/tcp/10666/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN',
                        '/ip4/127.0.0.1/tcp/7002/p2p/16Uiu2HAmP5DUiQihxuCtUsC6Li3WLFX3nsnq9jV38aLJHUqei6bA',
                        '/ip4/127.0.0.1/tcp/7003/p2p/16Uiu2HAmF9qfkmQwv9wv3m1E3hNqNHVjw4798dEVNy8Fk6814se8'
                    ],
                    interval: 2000,
                    enabled: true
                }
                // .. other discovery module options.
            }
        }
    })

    node.on('peer:discovery', function(peerId) {
        console.log('found peer: ', peerId.toB58String())
    })

    node.connectionManager.on('peer:connect', (connection) => {
        console.log('Connected to %s', connection.remotePeer.toB58String()) // Log connected peer
    })

    // start libp2p
    await node.start()
    console.log('libp2p has started')

    // print out listening addresses
    console.log('listening on addresses:')
    node.multiaddrs.forEach(addr => {
        console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`)
    })





    // await remoteTM.listen([listenAddr])

    // // remoteAddr = remoteTM.getAddrs()[0].encapsulate(`/p2p/${remotePeerId.toB58String()}`)
    // // console.log(remoteAddr);
    // remoteAddr = '/ip4/127.0.0.1/tcp/7004/p2p/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN';

    // // remoteAddr = remoteTM.getAddrs()[0].encapsulate('/ip4/127.0.0.1/tcp/10666/p2p/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN')


    // const dialer = new Dialer({ transportManager: localTM, peerStore })

    // const connection = await dialer.connectToPeer(remoteAddr)
    // expect(connection).to.exist()

    // console.log(connection);

    // const add = '/ip4/127.0.0.1/tcp/10666/p2p/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN';
    const add = '/ip4/127.0.0.1/tcp/7003/p2p/16Uiu2HAmF9qfkmQwv9wv3m1E3hNqNHVjw4798dEVNy8Fk6814se8';

    // ping peer if received multiaddr
    const ma = new Multiaddr(add)
    // console.log(`pinging remote peer at ${add}`)
    const latency = await node.ping(ma)
    // console.log(`pinged ${add} in ${latency}ms`)

    const add2 = '/ip4/127.0.0.1/tcp/7002/p2p/16Uiu2HAmP5DUiQihxuCtUsC6Li3WLFX3nsnq9jV38aLJHUqei6bA';
    const ma2 = new Multiaddr(add2)
    // console.log(`pinging remote peer at ${add}`)
    const latency2 = await node.ping(ma2)
    // console.log(`pinged ${add} in ${latency}ms`)


    const uint8ArrayFromString = require('uint8arrays/from-string')
    const uint8ArrayToString = require('uint8arrays/to-string')


    const topic = 'dad4a07a-80ce-4b32-8b9c-3f69642ca5c0';
    node.pubsub.on(topic, (msg) => {
        console.log(msg);
        console.log(`node received: ${uint8ArrayToString(msg.data)}`)
    })
    await node.pubsub.subscribe(topic)

    const a = await node.pubsub.getTopics();
    console.log(a);
    const b = await node.pubsub.getSubscribers(topic);
    console.log(b);


    // setInterval(() => {
    //   node.pubsub.publish(topic, uint8ArrayFromString('this is a pub/sub test!'))
    // }, 1000 * 10)






    const stop = async () => {
        // stop libp2p
        await node.stop()
        console.log('libp2p has stopped')
        process.exit(0)
    }

    process.on('SIGTERM', stop)
    process.on('SIGINT', stop)
}

main()





































// 'use strict'

// const path = require('path')
// const Libp2p = require('./src')
// const { MULTIADDRS_WEBSOCKETS } = require('./test/fixtures/browser')
// const Peers = require('./test/fixtures/peers')
// const PeerId = require('peer-id')
// const WebSockets = require('libp2p-websockets')
// const Muxer = require('libp2p-mplex')
// const { NOISE: Crypto } = require('libp2p-noise')
// const pipe = require('it-pipe')
// const Gossipsub = require('libp2p-gossipsub');

// let libp2p

// const before = async () => {
//   // Use the last peer
//   const peerId = await PeerId.createFromJSON(Peers[Peers.length - 1])

//   libp2p = new Libp2p({
//     addresses: {
//       listen: [MULTIADDRS_WEBSOCKETS[0]]
//     },
//     peerId,
//     modules: {
//       transport: [WebSockets],
//       streamMuxer: [Muxer],
//       connEncryption: [Crypto]
//     },
//     config: {
//       relay: {
//         enabled: true,
//         hop: {
//           enabled: true,
//           active: false
//         }
//       },
//       nat: {
//         enabled: false
//       }
//     }
//   })
//   // Add the echo protocol
//   libp2p.handle('/echo/1.0.0', ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle('/quorum/meshsub/1.1.0', ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })

//   libp2p.handle('/quorum/1.0.0', ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })

//   libp2p.handle("/ipfs/id/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/ipfs/kad/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })

//   libp2p.handle("/ipfs/ping/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/randomsub/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/floodsub/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/meshsub/1.1.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/quorum/kad/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/quorum/meshsub/1.1.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/quorum/meshsub/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })
//   libp2p.handle("/quorum/floodsub/1.0.0", ({ stream }) => {
//     console.log(stream);
//     return pipe(stream, stream)
//   })





//   await libp2p.start()




// }

// const after = async () => {
//   await libp2p.stop()
// }

// (async () => {
//   console.log('start');
//   await before();

//   // const connection = await libp2p.dial(targetPeer)
//   // const { stream } = await connection.newStream('/contract-net/1.0.0')



//   const { expect } = require('aegir/utils/chai')
//   const sinon = require('sinon')
//   const Transport = require('libp2p-tcp')
//   const Muxer = require('libp2p-mplex')
//   const { NOISE: Crypto } = require('libp2p-noise')
//   const { Multiaddr } = require('multiaddr')
//   const PeerId = require('peer-id')
//   const delay = require('delay')
//   const pDefer = require('p-defer')
//   const pSettle = require('p-settle')
//   const pWaitFor = require('p-wait-for')
//   const pipe = require('it-pipe')
//   const pushable = require('it-pushable')
//   const AggregateError = require('aggregate-error')
//   const { Connection } = require('libp2p-interfaces/src/connection')
//   const { AbortError } = require('libp2p-interfaces/src/transport/errors')
//   const uint8ArrayFromString = require('uint8arrays/from-string')

//   const Libp2p = require('./src')
//   const Dialer = require('./src/dialer')
//   const AddressManager = require('./src/address-manager')
//   const PeerStore = require('./src/peer-store')
//   const TransportManager = require('./src/transport-manager')
//   const { codes: ErrorCodes } = require('./src/errors')
//   const Protector = require('./src/pnet')
//   const swarmKeyBuffer = uint8ArrayFromString(require('./test/fixtures/swarm.key'))

//   const mockUpgrader = require('./test/utils/mockUpgrader')
//   const createMockConnection = require('./test/utils/mockConnection')
//   const Peers = require('./test/fixtures/peers')
//   const { createPeerId } = require('./test/utils/creators/peer')

//   const listenAddr = new Multiaddr('/ip4/127.0.0.1/tcp/7004')
//   const unsupportedAddr = new Multiaddr('/ip4/127.0.0.1/tcp/9999/ws/p2p/QmckxVrJw1Yo8LqvmDJNUmdAsKtSbiKWmrXJFyKmUraBoN')

//   let remoteTM
//   let localTM
//   let peerStore
//   let remoteAddr

//   const [localPeerId, remotePeerId] = await Promise.all([
//     PeerId.createFromJSON(Peers[0]),
//     PeerId.createFromJSON(Peers[1])
//   ])

//   peerStore = new PeerStore({ peerId: remotePeerId })
//   remoteTM = new TransportManager({
//     libp2p: {
//       addressManager: new AddressManager(remotePeerId, { listen: [listenAddr] }),
//       peerId: remotePeerId,
//       peerStore
//     },
//     upgrader: mockUpgrader
//   })
//   remoteTM.add(Transport.prototype[Symbol.toStringTag], Transport)

//   localTM = new TransportManager({
//     libp2p: {
//       peerId: localPeerId,
//       peerStore: new PeerStore({ peerId: localPeerId })
//     },
//     upgrader: mockUpgrader
//   })
//   localTM.add(Transport.prototype[Symbol.toStringTag], Transport)

//   await remoteTM.listen([listenAddr])

//   // remoteAddr = remoteTM.getAddrs()[0].encapsulate(`/p2p/${remotePeerId.toB58String()}`)
//   // console.log(remoteAddr);
//   remoteAddr = '/ip4/127.0.0.1/tcp/7004/p2p/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN';

//   // remoteAddr = remoteTM.getAddrs()[0].encapsulate('/ip4/127.0.0.1/tcp/10666/p2p/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN')


//   const dialer = new Dialer({ transportManager: localTM, peerStore })

//   const connection = await dialer.connectToPeer(remoteAddr)
//   expect(connection).to.exist()

//   console.log(connection);







//   const gsub = new Gossipsub(libp2p, {})

//   await gsub.start()

//   gsub.on('/quorum/meshsub/1.1.0', (data) => {
//     console.log(data)
//   })
//   gsub.subscribe('/quorum/meshsub/1.1.0')

//   gsub.publish('/quorum/meshsub/1.1.0', new TextEncoder().encode('banana'))

//   // console.log(gsub);




//   // await connection.close()






























//   // remoteTM.close()
//   // sinon.restore()



















//   // console.log('end');
//   // await after();
// })();
