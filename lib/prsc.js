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
    if (!options?.skipAuth) {
        await account.ensureAuth(actor, null, privateKey);
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
            ? await crypto.verifySignatureOnChain(signature, hash, user_address)
            : crypto.verifySignatureLegacy(signature, hash, user_address);
    } catch (err) {
        console.log(err);
        utilitas.throwError('Invalid authentication.', 401);
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
const sushitrain = require('./sushitrain');
const account = require('./account');
const crypto = require('./crypto');
