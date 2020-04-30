'use strict'

const defaultsDeep = require('@nodeutils/defaults-deep');
const promisify = require('promisify-es6');
const IPFSRepo = require('ipfs-repo');
const PeerInfo = require('peer-info');
const pathJoin = require('path').join;
const KadDHT = require('libp2p-kad-dht');
const PeerId = require('peer-id');
const libp2p = require('libp2p');
const rimraf = require('rimraf');
const MPLEX = require('libp2p-mplex');
const SECIO = require('libp2p-secio');
const TCP = require('libp2p-tcp');
const ncp = require('ncp');
const os = require('os');

const baseRepo = pathJoin(__dirname, 'ipfsBaseRepo');
class Node extends libp2p {
    constructor(_options) {
        const defaults = {
            modules: {
                transport: [TCP],
                streamMuxer: [MPLEX],
                connEncryption: [SECIO],
                dht: KadDHT,
            },
            config: {
                dht: { enabled: Boolean(_options.DHT) }
            },
        }
        delete _options.DHT;
        super(defaultsDeep(_options, defaults));
    }
};

const createLibp2pNode = async (options = {}) => {
    const id = await PeerId.create({ bits: 2048 });
    const peerInfo = new PeerInfo(id);
    peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0');
    options.peerInfo = peerInfo;
    const node = new Node(options);
    await node.start();
    return node;
};

const createTempRepo = async () => {
    const date = Date.now().toString();
    const pth = pathJoin(os.tmpdir(), `bitswap-tests-${date}-${Math.random()}`);
    await promisify(ncp)(baseRepo, pth);
    const repo = new IPFSRepo(pth);
    repo.teardown = async () => {
        await repo.close()
        await promisify(rimraf)(pth)
    };
    await repo.open();
    return repo;
};

module.exports = {
    createLibp2pNode,
    createTempRepo,
};
