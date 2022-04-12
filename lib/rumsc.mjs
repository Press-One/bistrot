import { encryption, utilitas, uuid } from 'utilitas';
import { privateKeyToAddress, signData, verifySignature } from './crypto.mjs';
import { rumscSave } from './sushibar.mjs';

import {
    assertObject, assertString, sendToPreparedContractMethod
} from './quorum.mjs';

const abiName = 'RumSC';

const pkRules = {
    type: { key: 'protocol' }, meta: { json: true }, data: { json: true },
};

const saveFields = [
    'id', 'user_address', 'type', 'meta', 'data', 'hash', 'signature'
];

saveFields.map(x => { pkRules[x] = pkRules[x] || {}; });

const buildTransaction = (type, meta, data, user_address, privateKey, opts) => {
    opts = opts || {};
    assertString(type, 'Invalid transaction type.');
    assertObject((meta = meta || {}), 'Invalid transaction meta.');
    assertObject((data = data || {}), 'Invalid transaction data.');
    assertString(user_address, 'Invalid user_address.');
    assertString(privateKey, 'Invalid privateKey.');
    const sg = signData(data, privateKey);
    assert(sg && sg.hash && sg.signature, 'Error signing data.', 500);
    return {
        id: opts.id || encryption.hash(uuid.v4()), user_address, type,
        meta: Object.assign(meta, { hash_alg: sg.hash_algorithm }),
        data, hash: sg.hash, signature: sg.signature,
    };
};

const unpackTransaction = async (data) => {
    assertObject(data, 'Invalid transaction data.');
    const r = {};
    for (let f in pkRules) {
        const k = pkRules[f]?.key || f;
        r[f] = data[k];
        if (pkRules[f]?.json) { try { r[k] = JSON.parse(r[k]); } catch (e) { } }
    }
    return r;
};

const save = async (privateKey, data, options) => {
    assertObject(data, 'Invalid block data.');
    data.meta = data.meta ?? null;
    data.meta = (Object.isObject(data.meta) || !utilitas.isSet(data.meta, 1))
        ? JSON.stringify(data.meta) : data.meta;
    data.data = Object.isObject(data.data)
        ? JSON.stringify(data.data) : data.data;
    const args = [];
    for (let field of saveFields) {
        let value = data[field];
        assert(!utilitas.isUndefined(
            value
        ), `Invalid transaction field: ${field}.`, 400);
        // switch (field) { case 'hash': value = `0x${value}`; break; }
        args.push(value);
    }
    return await sendToPreparedContractMethod(
        abiName, 'save', args, { ...options || {}, privateKey }
    );
};

const signSave = async (type, meta, data, privateKey, options) => {
    const transaction = buildTransaction(
        type, meta, data, privateKeyToAddress(privateKey),
        privateKey, options
    );
    if (options?.official) {
        return await rumscSave(
            transaction, { ...options || {}, skipVerify: true }
        );
    }
    return await save(privateKey, transaction, options);
};

const verify = async (trx) => {
    let { user_address, data, meta, hash, signature, verified } = trx || {};
    assert(user_address && data && meta && hash && signature, 'Invalid block.', 400);
    assert(meta.hash_alg === encryption.defaultAlgorithm, 'Invalid algorithm.', 400);
    assert(hash === encryption.digestObject(data), 'Invalid hash.', 400);
    try {
        verified = verifySignature(signature, hash, user_address);
    } catch (err) {
        utilitas.throwError(`Invalid authentication: ${err.message}`, 401);
    }
    assert(verified, 'Invalid signature.', 401);
    return true;
};

export {
    buildTransaction,
    save,
    signSave,
    unpackTransaction,
    verify,
};
