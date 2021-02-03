'use strict';

const hashAlgorithm = 'keccak256';

const saveFields = [
    'id', 'user_address', 'type', 'meta', 'data', 'hash', 'signature'
];

const assertString = (str, error, code = 400) => {
    return utilitas.assert(utilitas.isString(str) && str.length, error, code);
};

const assertObject = (object, error, code = 400) => {
    return utilitas.assert(utilitas.isObject(object), error, code);
};

const sign = (data, privateKey) => {
    const hash = prsUtility.hashBlockData(data);
    return { hash, signature: eosEcc.signHash(hash, privateKey) };
};

const buildTransaction = (
    type, meta, data, user_address, privateKey,
    options = { id: null, legacySignature: false }
) => {
    assertString(type, 'Invalid transaction type.');
    assertObject((meta = meta || {}), 'Invalid transaction meta.');
    assertObject((data = data || {}), 'Invalid transaction data.');
    assertString(user_address, 'Invalid user_address.');
    assertString(privateKey, 'Invalid privateKey.');
    const sg = (options.legacySignature
        ? prsUtility.signBlockData : sign)(data, privateKey);
    utilitas.assert(sg && sg.hash && sg.signature, 'Error signing data.', 500);
    meta.hash_alg = hashAlgorithm;
    const transaction = {
        id: options.id || prsUtility.keccak256(uuid.v4()),
        user_address, type, meta, data, hash: sg.hash, signature: sg.signature,
    };
    return transaction;
};

const save = async (actor, privateKey, data, options = {}) => {
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
    const transaction = buildTransaction(
        type, meta, data, options && options.userAddress || publicKey,
        options && options.privateKey || privateKey, options
    );
    const resp = await save(account, privateKey, transaction);
    return resp;
};

module.exports = {
    buildTransaction,
    save,
    sign,
    signSave,
};

const { utilitas, uuid } = require('utilitas');
const sushitrain = require('./sushitrain');
const prsUtility = require('prs-utility');
const eosEcc = require('eosjs-ecc');
