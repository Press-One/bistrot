'use strict';

// module.exports = [{
//     id: '12D3KooWNvSZnPi3RrhrTwEY4LuuBeB6K6facKUCJcyWG1aoDd2p',
//     privKey: 'CAESYHyCgD+3HtEHm6kzPO6fuwP+BAr/PxfJKlvAOWhc/IqAwrZjCNn0jz93sSl81cP6R6x/g+iVYmR5Wxmn4ZtzJFnCtmMI2fSPP3exKXzVw/pHrH+D6JViZHlbGafhm3MkWQ==',
//     pubKey: 'CAESIMK2YwjZ9I8/d7EpfNXD+kesf4PolWJkeVsZp+GbcyRZ'
// }, {
//     id: '12D3KooWLV3w42LqUb9MWE7oTzG7vwaFjPw9GvDqmsuDif5chTn9',
//     privKey: 'CAESYI44p8HiCHtCBhuUcetU9XdIEtWvon15a5ZLsfyssSj9nn3mt4oZI0t6wXTHOvIA0GSFWrYkdKp1338oFIambdKefea3ihkjS3rBdMc68gDQZIVatiR0qnXffygUhqZt0g==',
//     pubKey: 'CAESIJ595reKGSNLesF0xzryANBkhVq2JHSqdd9/KBSGpm3S'
// }, {
//     id: '12D3KooWDRHe5x3tEQfZi4yirsdhA3zgqhE8awxAjET7zVF23JHB',
//     privKey: 'CAESYP+GrxgDqKnx79W5l4sgpCEYvNF9bBlCSVu3McENPluhNYVEwxo5KboVuOPnYO6ZOeeTmglqc2vcN8pldRF8lq41hUTDGjkpuhW44+dg7pk555OaCWpza9w3ymV1EXyWrg==',
//     pubKey: 'CAESIDWFRMMaOSm6Fbjj52DumTnnk5oJanNr3DfKZXURfJau'
// }, {
//     id: '12D3KooWQJMnsoT7js35ZgkboxzUjXpVhfvG8cMqZnBJTP4XPuhU',
//     privKey: 'CAESYL1Fwm/+layh15V1ITWkK9tEQLuGeJFi16VkNDUU+GFs1y90DFs9vlkRziuJFZ/QtEIlYZWjFTsNRJxFA/etwCvXL3QMWz2+WRHOK4kVn9C0QiVhlaMVOw1EnEUD963AKw==',
//     pubKey: 'CAESINcvdAxbPb5ZEc4riRWf0LRCJWGVoxU7DUScRQP3rcAr'
// }, {
//     id: '12D3KooWFYyvJysHGbbYiruVY8bgjKn7sYN9axgbnMxrWVkGXABF',
//     privKey: 'CAESYCtlyHA9SQ9F0yO6frmkrFFmboLCzGt8syr0ix8QkuTcVTVAp9JiBXb2xI1lzK6Fn2mRJUxtQIuuW+3V2mu3DZZVNUCn0mIFdvbEjWXMroWfaZElTG1Ai65b7dXaa7cNlg==',
//     pubKey: 'CAESIFU1QKfSYgV29sSNZcyuhZ9pkSVMbUCLrlvt1dprtw2W'
// }, {
//     id: '12D3KooWHFKTMzwerBtsVmtz4ZZEQy2heafxzWw6wNn5PPYkBxJ5',
//     privKey: 'CAESYLU/qFxBHsdsQa63w3MrP8VvxJDyAk7rB7gLnIN01CyibmZCtQc7a1gIEDOGb10maUltL8wJxEdmOw3Bpjo7xrpuZkK1BztrWAgQM4ZvXSZpSW0vzAnER2Y7DcGmOjvGug==',
//     pubKey: 'CAESIG5mQrUHO2tYCBAzhm9dJmlJbS/MCcRHZjsNwaY6O8a6'
// }]

global.chainConfig = {
    debug: 1,
    // rumPeerId: {
    //     id: '12D3KooWNvSZnPi3RrhrTwEY4LuuBeB6K6facKUCJcyWG1aoDd2p',
    //     privKey: 'CAESYHyCgD+3HtEHm6kzPO6fuwP+BAr/PxfJKlvAOWhc/IqAwrZjCNn0jz93sSl81cP6R6x/g+iVYmR5Wxmn4ZtzJFnCtmMI2fSPP3exKXzVw/pHrH+D6JViZHlbGafhm3MkWQ==',
    //     pubKey: 'CAESIMK2YwjZ9I8/d7EpfNXD+kesf4PolWJkeVsZp+GbcyRZ'
    // },
    rumBootstrap: [
        // '/ip4/127.0.0.1/tcp/7020/http/p2p-webrtc-direct/p2p/12D3KooWNvSZnPi3RrhrTwEY4LuuBeB6K6facKUCJcyWG1aoDd2p',
        // '/ip4/167.114.61.179/tcp/10666/p2p/16Uiu2HAmE7TYnrYtC6tAsWvz4EUGQke1wsdrkw2kt8GFv6brfHFw',
        // '/ip4/127.0.0.1/tcp/10666/p2p/16Uiu2HAmCLkXgUUgisYjcwJwq3GFcvJLqqk3bX57gfJUUASk4MqN',
        // '/ip4/127.0.0.1/tcp/7002/p2p/16Uiu2HAmP5DUiQihxuCtUsC6Li3WLFX3nsnq9jV38aLJHUqei6bA',
        // '/ip4/127.0.0.1/tcp/7003/p2p/16Uiu2HAmF9qfkmQwv9wv3m1E3hNqNHVjw4798dEVNy8Fk6814se8'
    ],
};

const { utilitas } = require('utilitas');
const lib = require('.');

(async () => {

    const nid = ~~process.argv.pop();

    if (nid === 1) {
        global.chainConfig.rumPeerId = {
            id: '12D3KooWNvSZnPi3RrhrTwEY4LuuBeB6K6facKUCJcyWG1aoDd2p',
            privKey: 'CAESYHyCgD+3HtEHm6kzPO6fuwP+BAr/PxfJKlvAOWhc/IqAwrZjCNn0jz93sSl81cP6R6x/g+iVYmR5Wxmn4ZtzJFnCtmMI2fSPP3exKXzVw/pHrH+D6JViZHlbGafhm3MkWQ==',
            pubKey: 'CAESIMK2YwjZ9I8/d7EpfNXD+kesf4PolWJkeVsZp+GbcyRZ'
        };
        global.chainConfig.rumBootstrap = [
            '/ip4/127.0.0.1/tcp/7030/ws/p2p/12D3KooWLV3w42LqUb9MWE7oTzG7vwaFjPw9GvDqmsuDif5chTn9'
        ];
        global.chainConfig.rumWssPort = 7020;
    } else if (nid === 2) {
        global.chainConfig.rumPeerId = {
            id: '12D3KooWLV3w42LqUb9MWE7oTzG7vwaFjPw9GvDqmsuDif5chTn9',
            privKey: 'CAESYI44p8HiCHtCBhuUcetU9XdIEtWvon15a5ZLsfyssSj9nn3mt4oZI0t6wXTHOvIA0GSFWrYkdKp1338oFIambdKefea3ihkjS3rBdMc68gDQZIVatiR0qnXffygUhqZt0g==',
            pubKey: 'CAESIJ595reKGSNLesF0xzryANBkhVq2JHSqdd9/KBSGpm3S'
        };
        global.chainConfig.rumBootstrap = [
            '/ip4/127.0.0.1/tcp/7020/ws/p2p/12D3KooWNvSZnPi3RrhrTwEY4LuuBeB6K6facKUCJcyWG1aoDd2p'
        ];
        global.chainConfig.rumWssPort = 7030;
    } else {
        console.log('Error node id.');
        process.exit(1);
    }

    const topic = 'dad4a07a-80ce-4b32-8b9c-3f69642ca5c0';
    const node = await lib.rump2p.getNode();
    await lib.rump2p.subscribeToTopic(topic, console.log);

    // do {
    //     // if (global.chainConfig.nid === 0) {
    //     //     const connection = await lib.rump2p.dial('/ip4/127.0.0.1/tcp/7030/http/p2p-webrtc-direct/p2p/Qmf3xgvfDBAcQY7jN5wS1cQuEyyU6gE5ezcDFUz1DD2BoT');
    //     //     console.log(connection);
    //     // }
    //     console.log('xxx');
    //     await utilitas.timeout(1000 * 10);
    // } while (true);


    // export DEBUG=libp2p:peer-store:*

    // const leveljs = require('level-js')
    // const levelup = require('levelup');
    // const leveldown = require('leveldown');

    // const Libp2p = require('libp2p')
    // const TCP = require('libp2p-tcp')
    // const MPLEX = require('libp2p-mplex')
    // const { NOISE } = require('libp2p-noise')
    // const LevelStore = require('datastore-level')

    // const node = await Libp2p.create({
    //     modules: {
    //         transport: [TCP],
    //         streamMuxer: [MPLEX],
    //         connEncryption: [NOISE]
    //     },
    //     datastore: await (new LevelStore('/tmp/ds1')).open(),
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








    // for (let item of list) {
    //     console.log(item);
    //     const connection = await node.dialer.connectToPeer(item);
    //     // node.peerRouting.findPeer(item)
    //     // console.log(connection);
    // }
    // console.log(node.peerStore);
    // node.peerStore.protoBook.add(PeerId.createFromB58String('16Uiu2HAmF9qfkmQwv9wv3m1E3hNqNHVjw4798dEVNy8Fk6814se8'), [
    //     '/libp2p/circuit/relay/0.1.0',
    //     '/quorum/id/1.0.0',
    //     '/quorum/id/push/1.0.0',
    //     '/quorum/ping/1.0.0'
    // ]);
    // console.log(node.peerStore.protoBook);
    // db.put('nameaaa', 'LevelUPsdfasdfasdfsafsafasdfas', function(err) {
    //     if (err) return console.log('Ooops!', err) // some kind of I/O error

    //     // 3) fetch by key
    //     db.get('nameaaa', function(err, value) {
    //         if (err) return console.log('Ooops!', err) // likely the key was not found

    //         // ta da!
    //         console.log('nameaaa=' + value)
    //     })
    // })



})();
