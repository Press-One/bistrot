'use strict';

const { prsc, utilitas, uuid, prsUtility } = require('sushitrain');
const ecc = require('eosjs-ecc');

const hashAlgorithm = 'keccak256';

const assertString = (str, error, code = 400) => {
    return utilitas.assert(utilitas.isString(str) && str.length, error, code);
};

const assertObject = (object, error, code = 400) => {
    return utilitas.assert(utilitas.isObject(object), error, code);
};

const signData = (data, privateKey) => {
    const hash = prsUtility.hashBlockData(data);
    return { hash, signature: ecc.signHash(hash, privateKey) };
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
        ? prsUtility.signBlockData : signData)(data, privateKey);
    utilitas.assert(sg && sg.hash && sg.signature, 'Error signing data.', 500);
    meta.hash_alg = hashAlgorithm;
    const transaction = {
        id: options.id || prsUtility.keccak256(uuid.v4()),
        user_address, type, meta, data, hash: sg.hash, signature: sg.signature,
    };
    return transaction;
};

const prscSave = async (
    type, meta, data, account, publicKey, privateKey, options
) => {
    assertString(account, 'Invalid account.');
    assertString(publicKey, 'Invalid publicKey.');
    assertString(privateKey, 'Invalid privateKey.');
    const transaction = buildTransaction(
        type, meta, data, options && options.userAddress || publicKey,
        options && options.privateKey || privateKey, options
    );
    const resp = await prsc.save(account, privateKey, transaction);
    return resp;
};

const accountEvolution = async (
    userAddress, previousPrivateKey, account, publicKey, privateKey
) => {
    const resp = await prscSave('EVOLUTION:1', null, {
        from: userAddress,
        to: publicKey,
        field: 'user_address',
    }, account, publicKey, privateKey, {
        userAddress, privateKey: previousPrivateKey, legacySignature: true
    });
    return resp;
};

module.exports = {
    accountEvolution,
    prscSave,
};
