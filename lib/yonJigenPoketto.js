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
    uri = String(uri || '');
    return /^ipfs:\/\//i.test(uri) ? uri.replace(/^ipfs:\/\//i, '') : uri;
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
        type: 'PUBLISH:2',
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
    const req = {
        method: 'POST',
        json: true,
        uri: helper.assembleChainApiUrl('chain/blocks'),
        body: block,
    };
    const result = await request(req).promise();
    assert(result && result.data && !result.errors, 'Error querying statement.');
    return { formula, block, result };
};

const getByTransactionId = async (transactionId) => {
    const req = {
        method: 'POST',
        json: true,
        uri: helper.assembleChainApiUrl('chain/blocks'),
        body: block,
    };
    const result = await request(req).promise();
    assert(result && result.data && !result.errors, 'Error querying statement.');
};

(async () => {
    try {
        await require('./utility').timeout(500);

        const result = await publicFile(
            '/Users/leask/Desktop/t/1.pdf',
            'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR',
            '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
            { private: false }
        );
        console.log(result);

    } catch (err) {
        console.log(err);
    }
    process.exit(0);
})();
