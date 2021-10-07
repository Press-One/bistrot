'use strict'

const [modName, interval, enabled] = ['rump2p', 1000, true];
const log = (content) => { silent || utilitas.modLog(content, modName); };
const getNode = async (opts) => { return (node = node || await init(opts)); };
const getPubSub = async (option) => { return (await getNode(option)).pubsub; };
const channelPrefix = { user: 'user_channel_', producer: 'prod_channel_' };
const packageTypes = ['Trx', 'Block'];
const trxTypes = [
    'PostItem', 'AUTH', 'SchemaItem', 'ReqBlock', 'ReqBlockResp', 'CHALLENGE',
    'CHALLENGE_RESP', 'NewBLockResp', 'ProducerListItem', 'AnnounceItem',
]; // 'BlockListItem', 'GroupItem'

let silent = false;
let node = null;

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

const addDHT = (libp2p) => { // old version
    const customDHT = new dht({
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
    const psPath = conf.rumStore && path.join(conf.rumStore, 'peerstore');
    const list = conf.rumBootstrap || [];
    try { psPath && await fs.mkdir(psPath, { recursive: true }); } catch (e) { }
    const peerId = await (
        conf.rumPeerId ? PeerId.createFromJSON(conf.rumPeerId) : PeerId.create()
    );
    const datastore = psPath ? await (new LevelDatastore(psPath)).open() : null;
    const [listen, transport, peerDiscoveryModule] = [[], [WS], [Bootstrap]];
    const peerDiscoveryConfig = {
        autoDial: true,
        [Bootstrap.tag]: { list, interval, enabled: !!list.length },
    };
    const modules = {
        transport, pubsub,
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
        peerDiscovery: peerDiscoveryModule,
    };
    const nodeConfig = {
        // protocolPrefix: 'quorum', // DONT ENABLE this option by @LeaskH
        // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy
        pubsub: { enabled, emitSelf: false },
        peerDiscovery: peerDiscoveryConfig,
        transport: {
            [WS.prototype[Symbol.toStringTag]]: { filter: filters.all }
        },
    };
    if (global._bistrot.runningInBrowser) {
    } else {
        transport.push(TCP);
        peerDiscoveryModule.push(MulticastDNS);
        peerDiscoveryConfig[MulticastDNS.tag] = { interval, enabled };
        modules['dht'] = dht;
        nodeConfig['dht'] = {
            enabled: true, protocolPrefix: '/quorum', randomWalk: {
                enabled: true,
                delay: 1000,
                interval: interval * 10,
                timeout: 5000,
            },
        };
        if (~~conf.rumTcpPort) {
            listen.push(`/ip4/0.0.0.0/tcp/${~~conf.rumTcpPort}`);
        }
        if (~~conf.rumWsPort) {
            listen.push(`/ip4/0.0.0.0/tcp/${~~conf.rumWsPort}/ws`);
        }
    }
    node = await Libp2p.create({
        addresses: { listen }, modules, datastore, peerId, config: nodeConfig,
        peerStore: { peerId, persistence: true, threshold: 5 },
    });
    node.on('peer:discovery', peerDiscovery);
    node.connectionManager.on('peer:connect', peerConnect);
    await node.start();
    log('Libp2p node has started!');
    node.multiaddrs.forEach(a => {
        log(`Listening: ${a.toString()}/p2p/${node.peerId.toB58String()}`);
    })
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

const protobufDecode = async (proto, type, data, options) => {
    const pbType = await etc.getProtoByName(proto, type, options);
    try { return pbType.decode(data); } catch (e) {
        log(`Error decoding ${proto} -> ${type}: ${e.message}`);
    }
};

const subscribeToTopic = async (topic, callback, options) => {
    assertTopic(topic);
    const pubSub = await getPubSub(options);
    pubSub.on(topic, async (msg) => {
        // msg.decodedData = await protobufDecode('Chain', 'Package', msg.data);
        // msg.decodedData.decodedData = await protobufDecode(
        //     'Chain', packageTypes[~~msg.decodedData.type], msg.decodedData.Data
        // );
        (callback || console.log)(msg);
    });
    log(`Subscribed to topic: ${topic}`);
    return await pubSub.subscribe(topic);
};

const unsubscribeFromTopic = async (topic, options) => {
    assertTopic(topic);
    const pubSub = await getPubSub(options);
    log(`Unsubscribed from topic: ${topic}`);
    return await pubSub.unsubscribe(topic);
};

const subscribeToGroup = async (groupId, cbf, opts) => {
    assertTopic(groupId);
    const pms = [];
    for (let c in channelPrefix) {
        pms.push(subscribeToTopic(`${channelPrefix[c]}${groupId}`, cbf, opts));
    }
    log(`Subscribed to group: ${groupId}`);
    return await Promise.all(pms);
};

const unsubscribeFromGroup = async (groupId, options) => {
    assertTopic(groupId);
    const pms = [];
    for (let c in channelPrefix) {
        pms.push(unsubscribeFromTopic(`${channelPrefix[c]}${groupId}`, options));
    }
    log(`Unsubscribed from group: ${groupId}`);
    return await Promise.all(pms);
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
    subscribeToGroup,
    subscribeToTopic,
    unsubscribeFromGroup,
    unsubscribeFromTopic,
};

// const uint8ArrayFromString = require('uint8arrays/from-string');
// const uint8ArrayToString = require('uint8arrays/to-string');
const { LevelDatastore } = require('datastore-level');
const { Multiaddr } = require('multiaddr');
const { utilitas } = require('utilitas');
const Bootstrap = require('libp2p-bootstrap');
const { NOISE } = require('@chainsafe/libp2p-noise');
const filters = require('libp2p-websockets/src/filters');
const pubsub = require('quorum-gossipsub');
const config = require('./config');
const PeerId = require('peer-id');
const Libp2p = require('libp2p');
const MPLEX = require('libp2p-mplex');
const path = require('path');
const etc = require('./etc');
const WS = require('libp2p-websockets');
const fs = require('fs').promises;

const [TCP, MulticastDNS, dht] = global._bistrot.runningInBrowser ? [] : [
    require('libp2p-tcp'), require('libp2p-mdns'), require('libp2p-kad-dht')
];
