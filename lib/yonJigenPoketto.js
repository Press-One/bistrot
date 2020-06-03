'use strict';

// ipfs daemon
// const childProcess = require('child_process');
const multihashing = require('multihashing');
const cryptoKeys = require('libp2p-crypto/src/keys');
const encryption = require('./encryption');
const prsUtility = require('prs-utility');
const ipfsUtils = require('./ipfsUtils');
const libPeerId = require('peer-id');
const utilitas = require('utilitas');
const request = require('request-promise');
const Bitswap = require('ipfs-bitswap');
const helper = require('./helper');
const assert = require('assert');
const mathjs = require('mathjs');
const mime = require('mime-types');
const uuid = require('uuid/v4');
const path = require('path');
const util = require('util');
const atm = require('./atm');
const ecc = require('eosjs-ecc');
const CID = require('cids');
const fs = require('fs').promises;
const os = require('os');

// const config = require('./config');
// const pExec = util.promisify(childProcess.exec);

// for (let i in global.prsAtmConfig || {}) {
//     config[i] = typeof global.prsAtmConfig[i] === 'undefined'
//         ? config[i] : global.prsAtmConfig[i];
// }

const ipfsError = 'Error querying IPFS.';
const hashAlg = 'keccak256';
const minStorageSlices = 2;
const defaultStorageCopy = 2;
const defaultStorageShare = 2;
const defaultStorageDays = 7;
const defaultChallengeTimeout = 60;
const defaultStorageTime = 1000 * 60 * 60 * 24 * defaultStorageDays;
const pricePerBytesMs = 0.0000000000001;

// const exec = async (command) => {
//     const { stdout, stderr } = await pExec(command);
//     assert(!stderr, stderr);
//     return stdout;
// };

const analyzeFile = async (filename) => {
    const stat = await fs.stat(filename);
    assert(stat.isFile(), `${filename} is not a file.`);
    const content = await fs.readFile(filename, 'binary');
    return {
        content,
        filename: path.basename(filename),
        extname: path.extname(filename).replace(/^\.|\.$/g, ''),
        mime: mime.lookup(filename) || 'application/octet-stream',
        hash: prsUtility.keccak256(content),
        hash_alg: hashAlg,
        size: stat.size,
    };
};

const ipfsAdd = async (content, filename) => {
    const req = {
        method: 'POST',
        json: true,
        uri: helper.assembleIpfsApiUrl('add'),
        formData: { file: content || fs.createReadStream(filename) },
    };
    const result = await request(req).then((resp) => {
        return Promise.resolve(resp);
    });
    assert(result && result.Hash, ipfsError);
    return result;
};

const ipfsLs = async (cid) => {
    const req = {
        method: 'POST',
        json: true,
        uri: helper.assembleIpfsApiUrl('ls', {
            arg: cid,
            headers: true,
            'resolve-type': true,
            size: true,
        }),
    };
    const result = await request(req).promise();
    assert(result && result.Objects, ipfsError);
    return result;
};

const buildIpfsUri = (cid) => {
    const isArray = utilitas.isArray(cid);
    let cids = isArray ? cid : [cid];
    cids = cids.map(x => { return `ipfs://${x}`; });
    return isArray ? cids : cids[0];
};

const add = async (filename, options) => {
    options = options || {};
    const file = await analyzeFile(filename);
    if (options.encryption) {
        const enc = encryption.autoEncrypt(file.content, { asBinary: true });
        file.content = enc.content;
        file.encryption = { algorithm: enc.algorithm, key: enc.key };
    }
    const respAdd = await ipfsAdd(file.content);
    const respLs = await ipfsLs(respAdd.Hash);
    delete file.content;
    if (options.ipfsUri) {
        file.uri = buildIpfsUri(respAdd.Hash);
    }
    file.slices = buildIpfsUri(respLs.Objects[0].Links.map(x => {
        return x.Hash;
    }));
    return file;
};

const getIpfsCid = (uri) => {
    const [isArray, result] = [utilitas.isArray(uri), []];
    (isArray ? uri : [uri]).map(x => {
        const y = String(x || '');
        result.push(/^ipfs:\/\//i.test(y) ? y.replace(/^ipfs:\/\//i, '') : y);
    });
    return isArray ? result : result[0];
};

const ipfsCat = async (uri) => {
    const req = {
        method: 'POST',
        json: true,
        encoding: null,
        uri: helper.assembleIpfsApiUrl('cat', { arg: getIpfsCid(uri) }),
    };
    const result = await request(req).promise();
    assert(result && Buffer.isBuffer(result), ipfsError);
    return result;
};

const batchCat = async (uris) => {
    const pms = [];
    (uris || []).map(x => { pms.push(ipfsCat(x)) });
    const result = await Promise.all(pms);
    return result;
};

const ipfsPin = async (uri) => {
    const req = {
        method: 'POST',
        json: true,
        uri: helper.assembleIpfsApiUrl('pin/add', { arg: getIpfsCid(uri), progress: true }),
    };
    const result = await request(req).promise();
    assert(result
        && result.Pins
        && result.Pins.length === (utilitas.isArray(uri) ? uri : [url]).length,
        ipfsError
    );
    return result;
};

const verifyFormula = (formula) => {
    assert(formula, 'Invalid formula.');
    assert(formula.hash, 'Invalid hash in formula.');
    assert(formula.hash_alg, 'Invalid hash_alg in formula.');
    assert(utilitas.isArray(formula.slices)
        && formula.slices.length, 'Invalid slices in formula.');
};

const getByformula = async (formula) => {
    verifyFormula(formula);
    let buffer = await batchCat(formula.slices);
    buffer = Buffer.concat(buffer);
    if (formula.encryption) {
        assert(
            formula.encryption.algorithm === 'aes256-ctr',
            'Invalid encryption algorithm.'
        );
        assert(formula.encryption.key, 'Invalid encryption key.');
        buffer = encryption.autoDecrypt(buffer, formula.encryption.key, {
            asBinary: true,
        });
    }
    const hash = prsUtility.keccak256(buffer);
    assert(formula.hash === hash, 'Invalid file hash, damaged file.');
    return buffer;
};

const signData = (data, privateKey) => {
    const hash = prsUtility.hashBlockData(data);
    return { hash, signature: ecc.signHash(hash, privateKey) };
};

const verifySignature = (signature, hash, pubkey) => {
    return ecc.verifyHash(signature, hash, pubkey);
};

const publishToChain = async (formula, ipfsPeerId, account, privateKey, options) => {
    options = options || {};
    verifyFormula(formula);
    const encryption = utilitas.clone(formula.encryption);
    if (encryption && encryption.key && options.private) {
        delete encryption.key;
    }
    const data = {
        user: account,
        ipfs_id: ipfsPeerId,
        uri: formula.slices,
        mime: formula.mime,
        filename: formula.filename,
        extname: formula.extname,
        hash_alg: formula.hash_alg,
        size: formula.size,
        encry_alg: encryption ? (encryption.algorithm || '') : '',
        encry_key: encryption ? (encryption.key || '') : '',
        hash: formula.hash,
    }
    const result = await atm.transact(
        account, privateKey, 'prs.ipfs', 'addfile', data, options
    );
    return { data, result };
};

const publishFile = async (filename, account, privateKey, options) => {
    const formula = await add(filename, { encryption: true });
    const peerId = await getIpfsDaemonPeerId();
    const trxResult = await publishToChain(
        formula, peerId.toB58String(), account, privateKey, options
    );
    return {
        formula,
        data: trxResult ? trxResult.data : null,
        result: trxResult ? trxResult.result : null,
    };
};

const restoreFormulaByTransactionData = (data) => {
    return {
        filename: data.filename,
        extname: data.extname,
        mime: data.mime,
        hash: data.hash,
        hash_alg: data.hash_alg,
        size: data.size,
        encryption: { algorithm: data.encry_alg, key: data.encry_key, },
        slices: data.uri,
    };
};

const getTrxAndFormulaByTrxId = async (transactionId) => {
    const respTrx = await helper.getTransactionById(transactionId);
    assert(respTrx && respTrx.data, 'Transaction not found.');
    const formula = await restoreFormulaByTransactionData(respTrx.data);
    verifyFormula(formula);
    return { data: respTrx.data, formula };
};

const getByTransactionId = async (transactionId) => {
    const trxFml = await getTrxAndFormulaByTrxId(transactionId);
    return await getByformula(trxFml.formula);
};

const makeSlicesArray = (num) => {
    const arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(i);
    }
    return arr;
};

const randomSeparate = (total, share, copy) => {
    const [t, s, c]
        = [minStorageSlices, defaultStorageShare, defaultStorageCopy];
    assert(
        (total = ~~total) >= t,
        `The request formula must be more than ${t} slices.`
    );
    assert(
        (share = ~~share) >= s,
        `The request formula must be split into at least ${s} parts.`
    );
    assert(
        (copy = ~~copy) >= c,
        `At least ${c} backups are required to stay reliable.`
    );
    let result = [];
    for (let j = 0; j < copy; j++) {
        const macros = [];
        for (let i = 0; i < share; i++) {
            macros.push([]);
        }
        const allSlices = makeSlicesArray(total);
        while (allSlices.length) {
            const curIdx = utilitas.getShortestInArray(macros);
            macros[curIdx].push(
                allSlices.splice(utilitas.getRandomInArray(allSlices), 1)[0]
            );
            macros[curIdx].sort((x, y) => { return x - y; });
        }
        result = result.concat(macros);
    }
    return result;
};

// @todo: 计算部分需要换成 mathjs
const requestStorage = async (
    transactionId,
    account,
    publicKey,
    privateKey,
    copy = defaultStorageCopy,
    period = defaultStorageTime,
    options = {}
) => {
    assert(
        (period = ~~period) >= defaultStorageTime,
        `The request storage must be more than ${defaultStorageDays} days.`
    );
    const share = defaultStorageShare;
    const trxFml = await getTrxAndFormulaByTrxId(transactionId);
    assert(trxFml.formula.size >= share, 'Invalid file size in formula.');
    const separate = randomSeparate(trxFml.formula.slices.length, share, copy);
    const totalSize = trxFml.formula.size * copy;
    // const totalPrice = pricePerBytesMs * totalSize * period;
    const unitSize = Math.ceil(totalSize / separate.length);
    // const unitPrice = totalPrice / separate.length;
    // 考虑需要验证 account 与 publicKey 是否一致？
    const data = separate.map(x => {
        return {
            user: account,
            user_address: publicKey,
            publish_id: transactionId,
            size: unitSize,
            period,
            slices: x.map(y => { return trxFml.formula.slices[y]; }),
        };
    });
    const pms = [];
    data.map(x => {
        pms.push(
            atm.transact(
                account, privateKey, 'prs.ipfs', 'addslice', x, options
            )
        )
    });
    const result = await Promise.all(pms);
    return { publishData: trxFml.data, formula: trxFml.formula, data, result };
};

const getIpfsDaemonConfig = async (ipfsFolder) => {
    const filename = `${ipfsFolder || (os.homedir() + '/.ipfs')}/config`;
    let dmConfig = await fs.readFile(filename, 'utf8');
    try {
        dmConfig = JSON.parse(dmConfig);
    } catch (err) { }
    assert(dmConfig, `Error reading IPFS daemon config file: ${filename}.`);
    return dmConfig;
};

const getIpfsDaemonPrivateKey = async (ipfsFolder) => {
    const dmConfig = await getIpfsDaemonConfig(ipfsFolder);
    assert(
        dmConfig && dmConfig.Identity && dmConfig.Identity.PrivKey,
        'Error reading private key from IPFS daemon config file.'
    );
    return dmConfig.Identity.PrivKey;
};

const getIpfsDaemonPeerId = async (ipfsFolder) => {
    const rawPrivKey = await getIpfsDaemonPrivateKey(ipfsFolder);
    const peerId = await libPeerId.createFromPrivKey(rawPrivKey);
    assert(peerId, 'Invalid private key in IPFS daemon config file.');
    return peerId;
};

const ipfsSign = async (privateKey, message) => {
    assert(privateKey && privateKey.sign, 'Invalid IPFS private key object.');
    assert(message, 'Invalid message.');
    const rawSign = await privateKey.sign(message);
    const b64Sign = utilitas.base64Encode(rawSign, true);
    assert(b64Sign, 'Error signing message with IPFS private key.');
    return b64Sign;
};

const ipfsSignatureVerify = async (ipfsPeerId, publicKey, msg, signature) => {
    try {
        const [peerIdDrt, peerIdPky, bufSign] = [
            await libPeerId.createFromCID(ipfsPeerId),
            await libPeerId.createFromPubKey(publicKey),
            utilitas.base64Decode(signature, true),
        ];
        return ipfsPeerId && publicKey && msg && bufSign
            && peerIdDrt && peerIdDrt._idB58String
            && peerIdPky && peerIdPky._idB58String
            && peerIdPky.equals(peerIdDrt)
            && await peerIdPky._pubKey.verify(msg, bufSign);
    } catch (err) {
        console.log(err);
        return false;
    }
};

const provideStorage = async (
    transactionId, account, publicKey, privateKey, options
) => {
    const peerId = await getIpfsDaemonPeerId();
    const respTrx = await helper.getTransactionById(transactionId);
    assert(respTrx && respTrx.data, 'Transaction not found.');
    assert(respTrx.data
        && respTrx.data.slices
        && respTrx.data.slices.length, 'Slices not found.');
    const pinResult = await ipfsPin(respTrx.data.slices);
    const now = new Date();
    const data = {
        user: account,
        ipfs_id: peerId.toB58String(), // duplicate
        size: respTrx.data.size,
        publish_id: respTrx.data.publish_id,
        ipfs_signature: await ipfsSign(peerId._privKey, `${transactionId}${peerId.toB58String()}`),
        request: transactionId,
        ipfs_peer_id: peerId.toB58String(),
        ipfs_peer_publickey: utilitas.base64Encode(peerId._pubKey.bytes, true),
        user_account: account, // 不再需要
        period_of_begin: now.toISOString(),
        period_of_end: new Date(now.getTime() + parseInt(respTrx.data.period)).toISOString(),
        slices: respTrx.data.slices,
    }
    const result = await atm.transact(
        account, privateKey, 'prs.ipfs', 'addpromise', data, options
    );
    return { requestData: respTrx.data, pinResult, data, result };
};

const identifyIpfsPeerById = async (ipfsPeerId) => {
    const req = {
        method: 'POST',
        json: true,
        uri: helper.assembleIpfsApiUrl(
            'id', ipfsPeerId ? { arg: ipfsPeerId } : null
        ),
    };
    const result = await request(req).promise();
    assert(result && result.PublicKey, ipfsError);
    return result;
};

const resolveAddressesByIpfsPeerId = async (ipfsPeerId) => {
    const resp = await identifyIpfsPeerById(ipfsPeerId);
    assert(resp && resp.Addresses && resp.Addresses.length, ipfsError);
    const addresses = [];
    resp.Addresses.map(x => {
        if (!/\/(127\.0\.0\.1|10(\.\d+){3}|172\.16(\.\d+){2}|192.168(\.\d+){2}|::1)\//.test(
            x
        )) {
            addresses.push(x);
        }
    });
    assert(addresses.length, 'Error resolve addresses by IPFS peer id.');
    return addresses;
};

const createLibp2pNodeWithBitswap = async (dht) => {
    const repo = await ipfsUtils.createTempRepo();
    const libp2pNode = await ipfsUtils.createLibp2pNode({ DHT: dht });
    const bitswap = new Bitswap(libp2pNode, repo.blocks);
    bitswap.start();
    return { repo, libp2pNode, bitswap };
};

const getSliceFromPeer = async (ipfsCid, ipfsPeerId) => {
    const p2pNode = await createLibp2pNodeWithBitswap(true);
    // const addresses = await resolveAddressesByIpfsPeerId(ipfsPeerId);
    //////////////////////////////////////////////////////////////////////////// DEBUG ONLY
    const addresses = [
        '/ip4/127.0.0.1/tcp/4001/p2p/QmUkCDH8o8Ave8ihUgqqoMQPYs47yCeDMJZP22kSAhWMy6'
    ];
    const objCid = new CID(getIpfsCid(ipfsCid));
    const connectPms = [];
    let [data, recCid] = [null, null];
    try {
        addresses.map(x => { connectPms.push(p2pNode.libp2pNode.dial(x)); });
        await Promise.all(connectPms);
    } catch (err) {
        console.log(err);
        assert(false, 'Error connecting IPFS peer: .');
    }
    try {
        const block = await p2pNode.bitswap.get(objCid)
        const hash = multihashing((data = block._data), 'sha2-256');
        recCid = new CID(objCid.version, objCid.codec, hash);
    } catch (err) {
        assert(
            false,
            `Failed to get data slice from IPFS peer: ${ipfsCid}@${ipfsPeerId}.`
        );
    }
    assert(objCid.toString() === recCid.toString(), 'Data does not match CID');
    return data;
};

const getSliceFromPeerTimeout = async (ipfsCid, ipfsPeerId, timeout) => {
    timeout = timeout || defaultChallengeTimeout;
    return await utilitas.asyncTimeout(
        getSliceFromPeer(ipfsCid, ipfsPeerId), 1000 * timeout,
        `The peer cannot respond within the ${timeout} seconds.`
    );
};

const challengePromise = async (transactionId, sliceIndexSeed, publicKey) => {
    const pms = await helper.getTransactionById(transactionId);
    assert(pms, 'Transaction of storage promise not found.');
    const req = await helper.getTransactionById(pms.data.request);
    assert(req, 'Transaction of storage request not found.');
    const sliceIndex = sliceIndexSeed ? parseInt(mathjs.mod(
        mathjs.bignumber(sliceIndexSeed), pms.data.slices.length
    ).toString()) : utilitas.getRandomInArray(pms.data.slices);
    const result = {
        requestData: req.data,
        promiseData: pms.data,
        sliceIndex,
        verification_time: new Date().toISOString(),
    };
    let buffer = null;
    try {
        assert(await ipfsSignatureVerify(
            pms.data.ipfs_peer_id,
            pms.data.ipfs_peer_publickey,
            `${pms.data.request}${pms.data.ipfs_peer_id}`,
            pms.data.ipfs_signature), 'Invalid IPFS signature.');
        assert(
            utilitas.arrayEqual(pms.data.slices, req.data.slices),
            'Invalid file slices.'
        );
        buffer = await getSliceFromPeerTimeout(
            pms.data.slices[sliceIndex], pms.data.ipfs_peer_id
        );
    } catch (error) {
        result.error = error;
        return result;
    }
    result.verification_hash = prsUtility.keccak256(
        `${prsUtility.keccak256(buffer)}${publicKey}`
    );
    return result;
};

module.exports = {
    challengePromise,
};

(async () => {
    try {
        await require('utilitas').timeout(500);

        // const pResult = await publishFile(
        //     '/Users/leask/Desktop/IPFS/test.pdf',
        //     'test.bp2',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        //     { private: false }
        // );
        // console.log(JSON.stringify(pResult, null, 2));

        // const gResult = await getByTransactionId(
        //     'a893a8f4e2c474fe9068cbc296a9baa189262f1a5e9803b65de5e1017cc93000'
        // );
        // console.log(gResult);

        // const rResult = await requestStorage(
        //     'a893a8f4e2c474fe9068cbc296a9baa189262f1a5e9803b65de5e1017cc93000',
        //     'test.bp2',
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        // );
        // console.log(JSON.stringify(rResult, null, 2));

        // const pResult = await provideStorage(
        //     '94013c4d41405d159223270478dfe4c1f1c47dc9389412b656a7bed378497863',
        //     'test.bp2',
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        // );
        // console.log(JSON.stringify(pResult, null, 2));

        // const cResult = await challengePromise(
        //     '9eb79429d0955d0ea33a9154e1ff401007d3da051a88b9e0b6464900585b81ea',
        //     null,
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        // );
        // console.log(cResult.error instanceof Error
        //     ? cResult.error.message
        //     : JSON.stringify(cResult, 100000, 2));

    } catch (err) {
        console.log(err);
    }
    // process.exit(0);
})();
