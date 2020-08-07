'use strict';

// ipfs daemon
const { sushitrain } = require('sushitrain');
const multihashing = require('multihashing');
const { utilitas } = require('utilitas');
const encryption = require('./encryption.js');
const prsUtility = require('prs-utility');
const ipfsUtils = require('./ipfsUtils.js');
const libPeerId = require('peer-id');
const request = require('request-promise');
const Bitswap = require('ipfs-bitswap');
const helper = require('./helper');
const mathjs = require('mathjs');
const mime = require('mime-types');
const path = require('path');
const ecc = require('eosjs-ecc');
const CID = require('cids');
const fs = require('fs').promises;
const os = require('os');

// const cryptoKeys = require('libp2p-crypto/src/keys');
// const childProcess = require('child_process');
// const util = require('util');
// const config = require('./config');
// const pExec = util.promisify(childProcess.exec);

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
    utilitas.assert(stat.isFile(), `${filename} is not a file.`, 400);
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
    utilitas.assert(result && result.Hash, ipfsError, 500);
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
    utilitas.assert(result && result.Objects, ipfsError, 500);
    return result;
};

const buildIpfsUri = (cid) => {
    const isArray = Array.isArray(cid);
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
    const [isArray, result] = [Array.isArray(uri), []];
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
    utilitas.assert(result && Buffer.isBuffer(result), ipfsError, 500);
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
    utilitas.assert(result
        && result.Pins
        && result.Pins.length === (Array.isArray(uri) ? uri : [url]).length,
        ipfsError, 500);
    return result;
};

const verifyFormula = (formula) => {
    utilitas.assert(formula, 'Invalid formula.', 400);
    utilitas.assert(formula.hash, 'Invalid hash in formula.', 400);
    utilitas.assert(formula.hash_alg, 'Invalid hash_alg in formula.', 400);
    utilitas.assert(Array.isArray(formula.slices)
        && formula.slices.length, 'Invalid slices in formula.', 400);
};

const getByformula = async (formula) => {
    verifyFormula(formula);
    let buffer = await batchCat(formula.slices);
    buffer = Buffer.concat(buffer);
    if (formula.encryption) {
        utilitas.assert(
            formula.encryption.algorithm === 'aes256-ctr',
            'Invalid encryption algorithm.', 400
        );
        utilitas.assert(formula.encryption.key, 'Invalid encryption key.', 400);
        buffer = encryption.autoDecrypt(buffer, formula.encryption.key, {
            asBinary: true,
        });
    }
    const hash = prsUtility.keccak256(buffer);
    utilitas.assert(
        formula.hash === hash, 'Invalid file hash, damaged file.', 500
    );
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
    const result = await sushitrain.transact(
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
    utilitas.assert(respTrx && respTrx.data, 'Transaction not found.', 404);
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
    utilitas.assert(
        (total = ~~total) >= t,
        `The request formula must be more than ${t} slices.`, 400
    );
    utilitas.assert(
        (share = ~~share) >= s,
        `The request formula must be split into at least ${s} parts.`, 400
    );
    utilitas.assert(
        (copy = ~~copy) >= c,
        `At least ${c} backups are required to stay reliable.`, 400
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
            macros[curIdx].push(allSlices.splice(
                utilitas.getRandomIndexInArray(allSlices), 1
            )[0]);
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
    copy,
    period,
    options = {}
) => {
    copy = copy || defaultStorageCopy;
    period = period || defaultStorageTime;
    utilitas.assert(
        (period = ~~period) >= defaultStorageTime,
        `The request storage must be more than ${defaultStorageDays} days.`, 400
    );
    const share = defaultStorageShare;
    const trxFml = options.formula
        ? { formula: options.formula }
        : await getTrxAndFormulaByTrxId(transactionId);
    utilitas.assert(
        trxFml.formula.size >= share, 'Invalid file size in formula.', 400
    );
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
        pms.push(sushitrain.transact(
            account, privateKey, 'prs.ipfs', 'addslice', x, options
        ))
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
    utilitas.assert(
        dmConfig, `Error reading IPFS daemon config file: ${filename}.`, 500
    );
    return dmConfig;
};

const getIpfsDaemonPrivateKey = async (ipfsFolder) => {
    const dmConfig = await getIpfsDaemonConfig(ipfsFolder);
    utilitas.assert(
        dmConfig && dmConfig.Identity && dmConfig.Identity.PrivKey,
        'Error reading private key from IPFS daemon config file.', 500
    );
    return dmConfig.Identity.PrivKey;
};

const getIpfsDaemonPeerId = async (ipfsFolder) => {
    const rawPrivKey = await getIpfsDaemonPrivateKey(ipfsFolder);
    const peerId = await libPeerId.createFromPrivKey(rawPrivKey);
    utilitas.assert(
        peerId, 'Invalid private key in IPFS daemon config file.', 500
    );
    return peerId;
};

const ipfsSign = async (privateKey, message) => {
    utilitas.assert(
        privateKey && privateKey.sign, 'Invalid IPFS private key object.', 400
    );
    utilitas.assert(message, 'Invalid message.', 400);
    const rawSign = await privateKey.sign(message);
    const b64Sign = utilitas.base64Encode(rawSign, true);
    utilitas.assert(
        b64Sign, 'Error signing message with IPFS private key.', 500
    );
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
    console.log('>>> Get Peer ID');
    const peerId = await getIpfsDaemonPeerId();
    console.log('>>> Get TRX ID');
    const respTrx = await helper.getTransactionById(transactionId);
    utilitas.assert(respTrx && respTrx.data, 'Transaction not found.', 400);
    utilitas.assert(respTrx.data
        && respTrx.data.slices
        && respTrx.data.slices.length, 'Slices not found.', 400);
    console.log('>>> PIN File');
    ////////////////////////////////////////////////////////////////////////////
    let pinResult = null;
    try {
        pinResult = await ipfsPin(respTrx.data.slices);
    } catch (err) { console.log(err); };
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
    };
    console.log('>>> Submit to chain');
    const result = await sushitrain.transact(
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
    utilitas.assert(result && result.PublicKey, ipfsError, 500);
    return result;
};

const resolveAddressesByIpfsPeerId = async (ipfsPeerId) => {
    const resp = await identifyIpfsPeerById(ipfsPeerId);
    utilitas.assert(
        resp && resp.Addresses && resp.Addresses.length, ipfsError, 500
    );
    const addresses = [];
    resp.Addresses.map(x => {
        if (!/\/(127\.0\.0\.1|10(\.\d+){3}|172\.16(\.\d+){2}|192.168(\.\d+){2}|::1)\//.test(
            x
        )) {
            addresses.push(x);
        }
    });
    utilitas.assert(
        addresses.length, 'Error resolve addresses by IPFS peer id.', 500
    );
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
    const addresses = await resolveAddressesByIpfsPeerId(ipfsPeerId);
    //////////////////////////////////////////////////////////////////////////// DEBUG ONLY
    // const addresses = [
    //     '/ip4/127.0.0.1/tcp/4001/p2p/QmUkCDH8o8Ave8ihUgqqoMQPYs47yCeDMJZP22kSAhWMy6'
    // ];
    const objCid = new CID(getIpfsCid(ipfsCid));
    const connectPms = [];
    let [data, recCid] = [null, null];
    try {
        addresses.map(x => { connectPms.push(p2pNode.libp2pNode.dial(x)); });
        await Promise.all(connectPms);
    } catch (err) {
        console.log(err);
        utilitas.assert(false, 'Error connecting IPFS peer: .', 500);
    }
    try {
        const block = await p2pNode.bitswap.get(objCid)
        const hash = multihashing((data = block._data), 'sha2-256');
        recCid = new CID(objCid.version, objCid.codec, hash);
        await p2pNode.bitswap.stop();
        await p2pNode.libp2pNode.stop();
        await p2pNode.repo.teardown();
    } catch (err) {
        utilitas.assert(false, 'Failed to get data slice from IPFS peer: '
            + `${ipfsCid}@${ipfsPeerId}.`, 500);
    }
    utilitas.assert(
        objCid.toString() === recCid.toString(), 'Data does not match CID', 500
    );
    return data;
};

const getSliceFromPeerTimeout = async (ipfsCid, ipfsPeerId, timeout) => {
    timeout = timeout || defaultChallengeTimeout;
    return await utilitas.asyncTimeout(
        getSliceFromPeer(ipfsCid, ipfsPeerId), 1000 * timeout,
        `The peer cannot respond within the ${timeout} seconds.`
    );
};

const challengePromise = async (transactionId, publicKey, options = {}) => {
    const peerId = await getIpfsDaemonPeerId();
    const pms = await helper.getTransactionById(transactionId);
    utilitas.assert(pms, 'Transaction of storage promise not found.', 404);
    const req = await helper.getTransactionById(pms.data.request);
    utilitas.assert(req, 'Transaction of storage request not found.', 404);
    const sliceIndex = options.sliceIndexSeed ? parseInt(mathjs.mod(
        mathjs.bignumber(options.sliceIndexSeed), pms.data.slices.length
    ).toString()) : utilitas.getRandomIndexInArray(pms.data.slices);
    const result = {
        requestData: req.data,
        promiseData: pms.data,
        peerId: peerId.toB58String(),
        sliceIndex,
        verification_time: new Date().toISOString(),
    };
    let buffer = null;
    try {
        utilitas.assert(await ipfsSignatureVerify(
            pms.data.ipfs_peer_id,
            pms.data.ipfs_peer_publickey,
            `${pms.data.request}${pms.data.ipfs_peer_id}`,
            pms.data.ipfs_signature), 'Invalid IPFS signature.', 500);
        utilitas.assert(
            utilitas.arrayEqual(pms.data.slices, req.data.slices),
            'Invalid file slices.', 500
        );
        buffer = await getSliceFromPeerTimeout(
            pms.data.slices[sliceIndex], pms.data.ipfs_peer_id
        );
    } catch (error) {
        result.error = error;
        return result;
    }
    result.verification_hash = prsUtility.keccak256(
        `${prsUtility.keccak256(buffer)}${result.peerId}${publicKey}`
    );
    return result;
};

const addReq = async (filename, account, publicKey, privateKey, options) => {
    const pResult = await publishFile(
        filename, account, privateKey, { private: false }
    );
    const rResult = await requestStorage(
        pResult.result.transaction_id, account, publicKey, privateKey,
        undefined, undefined, { formula: pResult.formula }
    );
    return { pResult, rResult };
};

module.exports = {
    addReq,
    provideStorage,
    challengePromise,
};

// (async () => {
//     try {
//         await utilitas.timeout(500);

//         const xResult = await addReq(
//             '/Users/leask/Desktop/IPFS/test.pdf',
//             'test.bp2',
//             'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
//             '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
//         );
//         console.log(JSON.stringify(xResult, null, 2));

        // const pResult = await publishFile(
        //     '/Users/leask/Desktop/IPFS/test.pdf',
        //     'test.bp2',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        //     { private: false }
        // );
        // console.log(JSON.stringify(pResult, null, 2));

        // const gResult = await getByTransactionId(
        //     'a8952c4c1870c0bf6e9bc9249dffefacbb9ed2102dc073acf5201ee9ffdcc84d'
        // );
        // console.log(gResult);

        // const rResult = await requestStorage(
        //     'a8952c4c1870c0bf6e9bc9249dffefacbb9ed2102dc073acf5201ee9ffdcc84d',
        //     'test.bp2',
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        // );
        // console.log(JSON.stringify(rResult, null, 2));

        // const pResult = await provideStorage(
        //     '2a8c6674954d64f7cdc4f40ae286deb09c4e01c30596400032d90c054fbecc21',
        //     'test.bp2',
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        // );
        // console.log(JSON.stringify(pResult, null, 2));

        // const cResult = await challengePromise(
        //     'c6a3bada9459bc432e4edfbe1a74a4d498d391a85efdf016853e8003afeae3ae',
        //     null,
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        // );
        // // console.log(cResult);
        // console.log(cResult.error instanceof Error
        //     ? cResult.error.message
        //     : JSON.stringify(cResult, 100000, 2));

//     } catch (err) {
//     console.log(err);
//     console.log(JSON.stringify(err, null, 2));
// }
//     // process.exit(0);
// }) ();
