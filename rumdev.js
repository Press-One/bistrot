'use strict';

global.chainConfig = {
    debug: 1,
    rumBootstrap: [
        '/ip4/127.0.0.1/tcp/10666/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN',
        '/ip4/127.0.0.1/tcp/7002/p2p/16Uiu2HAmP5DUiQihxuCtUsC6Li3WLFX3nsnq9jV38aLJHUqei6bA',
        '/ip4/127.0.0.1/tcp/7003/p2p/16Uiu2HAmF9qfkmQwv9wv3m1E3hNqNHVjw4798dEVNy8Fk6814se8'
    ]
};

const { utilitas } = require('utilitas');
const lib = require('.');

(async () => {
    const topic = 'dad4a07a-80ce-4b32-8b9c-3f69642ca5c0';
    const node = await lib.rump2p.getNode();
    await lib.rump2p.subscribeToTopic(topic, console.log);

    // const Libp2p = require('libp2p')
    // const TCP = require('libp2p-tcp')
    // const MPLEX = require('libp2p-mplex')
    // const { NOISE } = require('libp2p-noise')
    // const LevelStore = require('datastore-level')

    // const leveljs = require('level-js')

    // const node = await Libp2p.create({
    //     modules: {
    //         transport: [TCP],
    //         streamMuxer: [MPLEX],
    //         connEncryption: [NOISE]
    //     },
    //     datastore: new LevelStore('my/db/name', {
    //         db: (path) => leveljs(path, {
    //             prefix: 'IDBWrapper-'
    //         })
    //     }),
    //     peerStore: {
    //         persistence: true,
    //         threshold: 5
    //     }
    // })
    // await node.start();

    // const connection = await lib.rump2p.dial(global.chainConfig.rumBootstrap[1]);
    // console.log(connection);
    // const latency = await lib.rump2p.ping(global.chainConfig.rumBootstrap[2]);
    // console.log(latency);

    // const uint8ArrayFromString = require('uint8arrays/from-string')
    // const uint8ArrayToString = require('uint8arrays/to-string')
    // uint8ArrayFromString(content);
    // uint8ArrayToString(msg.data);
})();
