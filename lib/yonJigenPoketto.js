'use strict';

// ipfs config profile apply lowpower
// ipfs daemon

const childProcess = require('child_process');
const encryption = require('./encryption');
const prsUtility = require('prs-utility');
const request = require('request-promise');
const utility = require('./utility');
const helper = require('./helper');
const assert = require('assert');
const mime = require('mime-types');
const uuid = require('uuid/v4');
const path = require('path');
const util = require('util');
const ecc = require('eosjs-ecc');
const fs = require('fs').promises;
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
const defaultStorageTime = 1000 * 60 * 60 * 24 * defaultStorageDays;
const pricePerBytesMs = 0.0000000000001;

const ipfsPeerId = 'QmUkCDH8o8Ave8ihUgqqoMQPYs47yCeDMJZP22kSAhWMy6';

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
        method: 'GET',
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
    const isArray = utility.isArray(cid);
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
    const [isArray, result] = [utility.isArray(uri), []];
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
        && result.Pins.length === (utility.isArray(uri) ? uri : [url]).length,
        ipfsError
    );
    return result;
};

const verifyFormula = (formula) => {
    assert(formula, 'Invalid formula.');
    assert(formula.hash, 'Invalid hash in formula.');
    assert(formula.hash_alg, 'Invalid hash_alg in formula.');
    assert(utility.isArray(formula.slices)
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

// const privateKeyToAddress = (privateKey) => {
//     return prsUtility.privateKeyToAddress(privateKey);
// };

const buildBlock = (formula, publicKey, privateKey, options) => {
    options = options || {};
    verifyFormula(formula);
    const data = { hash: formula.hash };
    const signature = signData(data, privateKey);
    const encryption = formula.encryption
        ? utility.clone(formula.encryption) : null;
    if (encryption && encryption.key && options.private) {
        delete encryption.key;
    }
    return {
        id: uuid(),
        user_address: publicKey,
        type: 'PUBLISH:3',
        meta: {
            uri: formula.slices,
            mime: formula.mime,
            filename: formula.filename,
            extname: formula.extname,
            hash_alg: formula.hash_alg,
            size: formula.size,
            encryption: encryption,
        },
        data: data,
        hash: signature.hash,
        signature: signature.signature,
    };
};

const publicFile = async (filename, publicKey, privateKey, options) => {
    const formula = await add(filename, { encryption: true });
    const block = buildBlock(formula, publicKey, privateKey, options);
    const result = await helper.requestChainApi(
        'POST', 'chain/blocks', null, block, 'Error publishing file.'
    );
    return { formula, block, result };
};

const restoreFormulaByTransaction = (trx) => {
    const [data, meta] = trx ? [trx.data || {}, trx.meta || {}] : [];
    return {
        filename: meta.filename,
        extname: meta.extname,
        mime: meta.mime,
        hash: data.hash,
        hash_alg: meta.hash_alg,
        size: meta.size,
        encryption: meta.encryption,
        slices: meta.uri,
    };
};

const getTrxAndFormulaByTrxId = async (transactionId) => {
    const respTrx = await helper.getTransactionById(transactionId);
    assert(respTrx && respTrx.block, 'Transaction not found.');
    const formula = await restoreFormulaByTransaction(respTrx.block);
    verifyFormula(formula);
    return { block: respTrx.block, formula };
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
            const curIdx = utility.getShortestInArray(macros);
            macros[curIdx].push(
                allSlices.splice(utility.getRandomInArray(allSlices), 1)[0]
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
    const totalPrice = pricePerBytesMs * totalSize * period;
    const unitSize = totalSize / separate.length;
    const unitPrice = totalPrice / separate.length;
    const blocks = separate.map(x => {
        const block = {
            id: uuid(),
            user_address: publicKey,
            type: 'STORAGEREQUEST:1',
            meta: {
                transactionId,
                pricePerBytesMs,
                size: unitSize,
            },
            data: {
                currency: 'PRS',
                price: unitPrice,
                period,
                slices: x.map(y => { return trxFml.formula.slices[y]; }),
            },
        };
        const signature = signData(block.data, privateKey);
        block.hash = signature.hash;
        block.signature = signature.signature;
        return block;
    });
    const pms = [];
    blocks.map(x => {
        pms.push(helper.requestChainApi(
            'POST', 'chain/blocks', null, x, 'Error publishing storage request.'
        ))
    });
    const result = await Promise.all(pms);
    return { fileBlock: trxFml.block, formula: trxFml.formula, blocks, result };
};

const provideStorage = async (transactionId, publicKey, privateKey) => {
    const respTrx = await helper.getTransactionById(transactionId);
    assert(respTrx && respTrx.block, 'Transaction not found.');
    assert(respTrx.block.data
        && respTrx.block.data.slices
        && respTrx.block.data.slices.length, 'Slices not found.');
    const pinResult = await ipfsPin(respTrx.block.data.slices);
    const now = new Date();
    const block = {
        id: uuid(),
        user_address: publicKey,
        type: 'STORAGEPROMISE:1',
        meta: respTrx.block.meta,
        data: {
            request: transactionId,
            ipfs_peer_id: ipfsPeerId,
            currency: 'PRS',
            price: respTrx.block.data.price,
            period_begin: now.toISOString(),
            period_end: new Date(now.getTime() + respTrx.block.data.period).toISOString(),
            slices: respTrx.block.data.slices,
        },
    };
    const signature = signData(block.data, privateKey);
    block.hash = signature.hash;
    block.signature = signature.signature;
    const result = await helper.requestChainApi(
        'POST', 'chain/blocks', null, block, 'Error publishing promise.'
    );
    return { fileBlock: respTrx.block, pinResult, block, result };
};

const challengePromise = async (transactionId) => {
    const respTrx = await helper.getTransactionById(transactionId);
    assert(respTrx && respTrx.block, 'Transaction not found.');
    console.log(respTrx.block);
};

(async () => {
    try {
        await require('./utility').timeout(500);

        // const pResult = await publicFile(
        //     '/Users/leask/Desktop/t/1.pdf',
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        //     { private: false }
        // );
        // console.log(pResult);

        // const gResult = await getByTransactionId(
        //     '6b4639c0253b51f02cf2c57cb863b5dff5f7d7cf7144c7d5246986967ece0eaa'
        // );
        // console.log(gResult);

        // const rResult = await requestStorage(
        //     '6b4639c0253b51f02cf2c57cb863b5dff5f7d7cf7144c7d5246986967ece0eaa',
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        // );
        // console.log(JSON.stringify(rResult, null, 2));

        // const pResult = await provideStorage(
        //     '77cf72f25c18e714f7528e5b3a008bf6f85c1abf866d316bcbb74ae3311e270e',
        //     'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        // );
        // console.log(JSON.stringify(pResult, null, 2));

        const cResult = await challengePromise(
            '7ae3829f98752b7e354128d81219923dbca17067bca97c83a906fa51ce5cac52'
        );
        console.log(JSON.stringify(cResult, null, 2));

    } catch (err) {
        console.log(err);
    }
    process.exit(0);
})();
