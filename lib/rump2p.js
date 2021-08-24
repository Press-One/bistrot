'use strict'

const [modName, interval, enabled] = ['rump2p', 1000, true];
const log = (content) => { silent || utilitas.modLog(content, modName); };
const getNode = async (opts) => { return (node = node || await init(opts)); };
const getPubSub = async (option) => { return (await getNode(option)).pubsub; };

let silent = false;
let node = null;

const packageTypes = ['Trx', 'Block'];
const trxTypes = ['Post', 'Auth', 'REQ_BLOCK', 'REQ_BLOCK_RESP', 'CHALLENGE', 'CHALLENGE_RESP', 'NEW_BLOCK_RESP'];

const assertTopic = (topic) => {
    utilitas.assert(topic, 'Topic is required.', 400);
    return topic;
};

const assertMultiadd = (multiadd) => {
    utilitas.assert(multiadd, 'MultiAddress is required.', 400);
    return new Multiaddr(multiadd);
};

const callbacks = { peerDiscovery: null, peerConnect: null };

const runCallback = async (type, func, ar, o) => {
    try { return await (callbacks[type] || func)(ar, o); } catch (e) { log(e); }
};

const peerDiscovery = async (arg) => {
    return await runCallback('peerDiscovery', async (peerId) => {
        log(`Found peer: ${peerId.toB58String()}`);
    }, arg);
};

const peerConnect = async (arg) => { // connection.remotePeer.toB58String()
    return await runCallback('peerConnect', async (connection) => {
        log(`Connected to: ${connection.remoteAddr.toString()}`);
    }, arg);
};

const addDHT = (libp2p) => {
    const customDHT = new KadDHT({
        libp2p,
        dialer: libp2p.dialer,
        peerId: libp2p.peerId,
        peerStore: libp2p.peerStore,
        registrar: libp2p.registrar,
        protocolPrefix: '/quorum'
    });
    customDHT.start();
    customDHT.on('peer', libp2p._onDiscoveryPeer);
    log(`KAD-DHT service has started: ${customDHT.protocol}`);
    return customDHT;
};

const init = async (options) => {
    const conf = { ...{}, ...await config(), ...options || {} };
    const list = conf.rumBootstrap || [];
    node = await Libp2p.create({
        addresses: { listen: [`/ip4/0.0.0.0/tcp/${~~conf.rumP2pPort}`] }, // random port
        modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            peerDiscovery: [Bootstrap, MulticastDNS],
            pubsub: Gossipsub,
        },
        config: {
            // protocolPrefix: '/quorum',
            // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy
            pubsub: { enabled, emitSelf: false },
            peerDiscovery: {
                autoDial: true,
                [MulticastDNS.tag]: { interval, enabled },
                [Bootstrap.tag]: { list, interval, enabled: !!list.length },
            }
        }
    });
    node.on('peer:discovery', peerDiscovery);
    node.connectionManager.on('peer:connect', peerConnect)
    await node.start()
    log('Libp2p node has started!')
    node.multiaddrs.forEach(a => {
        log(`Listening: ${a.toString()}/p2p/${node.peerId.toB58String()}`);
    })
    addDHT(node);
    // process.on('SIGTERM', stop)
    // process.on('SIGINT', stop)
    return node;
};

const stop = async () => {
    if (!node) { return log('Libp2p node is not running.'); }
    await node.stop();
    log('Libp2p node has stopped.');
    // process.exit();
};

const dial = async (multiadd, options) => {
    return await (await getNode(options)).dial(assertMultiadd(multiadd));
};

const ping = async (multiadd, options) => {
    return await (await getNode(options)).ping(assertMultiadd(multiadd));
};

const subscribeToTopic = async (topic, callback, options) => {
    assertTopic(topic);
    const pubSub = await getPubSub(options);
    const typePkg = await etc.getProtoByName('Chain', 'Package');
    const typeTrx = await etc.getProtoByName('Chain', 'Trx');
    const typeBlk = await etc.getProtoByName('Chain', 'Block');
    pubSub.on(topic, (msg) => {
        try {
            msg.decodedData = typePkg.decode(msg.data);
        } catch (e) { log(` Error decoding package: ${e.message}`); }
        try {
            switch (~~msg.decodedData.type) {
                case 0:
                    console.log(typeTrx.decode(msg.decodedData.Data));
                    break;
                case 1:
                    console.log(typeBlk.decode(msg.decodedData.Data));
                    break;
                default:
            }
        } catch (e) {
            console.log(e);
        }
        (callback || console.log)(msg);
    });
    await pubSub.subscribe(topic);
};

const getSubscribedTopics = async (options) => {
    return await (await getPubSub(options)).getTopics();
};

const getSubscribersByTopic = async (topic, options) => {
    return await (await getPubSub(options)).getSubscribers(assertTopic(topic));
};

const publishToTopic = async (topic, data, options) => {
    utilitas.assert(data, 'Data is required.', 400);
    return await (await getPubSub(options)).publish(assertTopic(topic), data);
};

module.exports = {
    dial,
    getNode,
    getPubSub,
    getSubscribedTopics,
    getSubscribersByTopic,
    init,
    ping,
    publishToTopic,
    stop,
    subscribeToTopic,
};

// const uint8ArrayFromString = require('uint8arrays/from-string');
// const uint8ArrayToString = require('uint8arrays/to-string');
const { Multiaddr } = require('multiaddr');
const MulticastDNS = require('libp2p-mdns');
const { utilitas } = require('utilitas');
const Bootstrap = require('libp2p-bootstrap');
const Gossipsub = require('quorum-gossipsub');
const { NOISE } = require('libp2p-noise');
const KadDHT = require('libp2p-kad-dht');
const config = require('./config');
const Libp2p = require('libp2p');
const MPLEX = require('libp2p-mplex');
const TCP = require('libp2p-tcp');
const etc = require('./etc');
