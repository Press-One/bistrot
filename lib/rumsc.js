'use strict';

const saveFields = [
    'id', 'user_address', 'type', 'meta', 'data', 'hash', 'signature'
];

const assertString = (str, error, code = 400) => {
    return utilitas.assert(utilitas.isString(str) && str.length, error, code);
};

const assertObject = (object, error, code = 400) => {
    return utilitas.assert(utilitas.isObject(object), error, code);
};

const buildTransaction = (type, meta, data, user_address, privateKey, opts) => {
    opts = opts || {};
    assertString(type, 'Invalid transaction type.');
    assertObject((meta = meta || {}), 'Invalid transaction meta.');
    assertObject((data = data || {}), 'Invalid transaction data.');
    assertString(user_address, 'Invalid account or user_address.');
    assertString(privateKey, 'Invalid privateKey.');
    const sg = crypto.signData(data, privateKey);
    utilitas.assert(sg && sg.hash && sg.signature, 'Error signing data.', 500);
    return {
        id: opts.id || encryption.hash(uuid.v4()), user_address, type,
        meta: Object.assign(meta, { hash_alg: sg.hash_algorithm }),
        data, hash: sg.hash, signature: sg.signature,
    };
};

const save = async (actor, privateKey, data, options) => {
    utilitas.assert(data, 'Invalid block data.', 400);
    data.meta = utilitas.isObject(data.meta)
        ? JSON.stringify(data.meta) : data.meta;
    data.data = utilitas.isObject(data.data)
        ? JSON.stringify(data.data) : data.data;
    const args = { caller: actor };
    for (let field of saveFields) {
        utilitas.assert(!utilitas.isUndefined(
            data[field]
        ), `Invalid transaction field: ${field}.`, 400);
        args[field] = data[field];
    }
    return await sushitrain.transact(
        actor, privateKey, 'prs.prsc', 'save', args, options
    );
};

const signSave = async (
    type, meta, data, account, publicKey, privateKey, options
) => {
    assertString(account, 'Invalid account.');
    assertString(publicKey, 'Invalid publicKey.');
    assertString(privateKey, 'Invalid privateKey.');
    return await save(account, privateKey, buildTransaction(
        type, meta, data, options && options.userAddress || account,
        options && options.privateKey || privateKey, options
    ));
};

const verify = async (trx) => {
    let { user_address, data, meta, hash, signature, verified } = trx || {};
    utilitas.assert(
        user_address && data && meta && hash && signature, 'Invalid block.', 400
    );
    utilitas.assert(
        meta.hash_alg === encryption.defaultAlgorithm, 'Invalid algorithm.', 400
    );
    utilitas.assert(
        hash === encryption.digestObject(data), 'Invalid hash.', 400
    );
    try {
        verified = /^SIG_K1_/i.test(signature)
            ? false // await crypto.verifySignatureOnChain(signature, hash, user_address)
            : crypto.verifySignatureLegacy(signature, hash, user_address);
    } catch (err) {
        console.log(err);
        utilitas.throwError('Invalid authentication.', 401);
    }
    utilitas.assert(verified, 'Invalid signature.', 401);
    return true;
};





// const save = async (data, options) => {
//     const abi = await etc.readAbi('RumSC');
//     const contract = new (await getEthClient(options)).Contract(abi, '0xaeab303FC1A4c364a16C8D86ad2563E44089E3a0');

//     console.log(await contract.methods.save("test", "PIP:2001", "test", "test", "0xfbd71db11e7d0038646252e19da21f68befd9db2d79dde02dded74088c2338aa", "9ca7c049d6c7b5509951eec902f9145265e666008b15af59f3405295c2a07568569fb6f2235176e9ca8d4ba70eb94c04e656db379774b80a694681e2b0c0bd3300").send({ from: '0x2AeF3da35e9A2EC29aE25A04d9C9e92110910A51' }));

//     // let instance = await PIP2001.at(合约地址)
// };







module.exports = {
    assertObject,
    assertString,
    buildTransaction,
    save,
    signSave,
    verify,
};

const { utilitas, uuid, encryption } = require('utilitas');
const sushitrain = require('./sushitrain');
const account = require('./account');
const crypto = require('./crypto');
