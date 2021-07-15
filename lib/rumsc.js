'use strict';

const abiName = 'RumSC';

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
    assertString(user_address, 'Invalid user_address.');
    assertString(privateKey, 'Invalid privateKey.');
    const sg = crypto.signData(data, privateKey);
    utilitas.assert(sg && sg.hash && sg.signature, 'Error signing data.', 500);
    return {
        id: opts.id || encryption.hash(uuid.v4()), user_address, type,
        meta: Object.assign(meta, { hash_alg: sg.hash_algorithm }),
        data, hash: sg.hash, signature: sg.signature,
    };
};

const save = async (privateKey, data, options) => {
    assertString(privateKey, 'Invalid privateKey.');
    assertObject(data, 'Invalid block data.');
    data.meta = utilitas.isObject(data.meta)
        ? JSON.stringify(data.meta) : data.meta;
    data.data = utilitas.isObject(data.data)
        ? JSON.stringify(data.data) : data.data;
    const args = [];
    for (let field of saveFields) {
        let value = data[field];
        utilitas.assert(!utilitas.isUndefined(
            value
        ), `Invalid transaction field: ${field}.`, 400);
        switch (field) {
            case 'hash': value = `0x${value}`; break;
        }
        args.push(value);
    }
    const from = crypto.privateKeyToAddress(privateKey);
    const instance = await quorum.initPreparedContract(
        abiName, { ...options || {}, privateKey }
    );
    return instance.methods.save.apply(null, args).send({ from });
};

const signSave = async (type, meta, data, privateKey, options) => {
    const transaction = buildTransaction(
        type, meta, data, crypto.privateKeyToAddress(privateKey),
        privateKey, options
    );
    return await save(privateKey, transaction, options);
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
        verified = crypto.verifySignature(signature, hash, user_address);
    } catch (err) {
        utilitas.throwError(`Invalid authentication: ${err.message}`, 401);
    }
    utilitas.assert(verified, 'Invalid signature.', 401);
    return true;
};

module.exports = {
    assertObject,
    assertString,
    buildTransaction,
    save,
    signSave,
    verify,
};

const { utilitas, uuid, encryption } = require('utilitas');
const crypto = require('./crypto');
const quorum = require('./quorum');
