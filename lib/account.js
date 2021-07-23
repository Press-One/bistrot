'use strict';

const bindingPrice = '0.0001';
const abiName = 'RumAccount';
const pkRules = { meta: { json: true } };

const saveFields = [
    'user', 'payment_provider', 'payment_account', 'meta', 'memo'
];

saveFields.map(x => { pkRules[x] = pkRules[x] || {}; });

const getBalanceByAddress = async (address, opts) => {
    let resp = await (await quorum.getEthClient(null, opts)).getBalance(address);
    return opts?.asWei ? resp : web3.utils.fromWei(resp, opts?.unit || 'ether');
};

const unpackTransaction = async (data) => {
    quorum.assertObject(data, 'Invalid transaction data.');
    const r = {};
    for (let f in pkRules) {
        const k = pkRules[f]?.key || f;
        r[f] = data[k];
        if (pkRules[f]?.json) { try { r[k] = JSON.parse(r[k]); } catch (e) { } }
    }
    return r;
};

const bind = async (privateKey, add, provider, id, meta, memo, options) => {
    if (utilitas.isString(add) && !add.startsWith('0x')) {
        add = `0x${add.toLowerCase()}`;
    }
    quorum.assertAddress(add);
    provider = utilitas.ensureString(provider, { case: 'UP' });
    utilitas.assert(provider, 'Identity-provider is required.', 400);
    utilitas.assert(id, 'Identity-id is required.', 400);
    meta = Object.assign({ request: { type: provider } }, meta || {});
    meta.request.type = utilitas.ensureString(meta.request.type, { case: 'UP' });
    return await quorum.sendToPreparedContractMethod(
        abiName, 'bind',
        [add, provider, id, JSON.stringify(meta), utilitas.ensureString(memo)],
        { ...options || {}, privateKey }
    );
};

const verifyBound = (item) => {
    return item && item.payment_provider && item.payment_account && item.user
        && item.user !== '0x0000000000000000000000000000000000000000';
};

const queryBoundByAddress = async (add, options) => {
    quorum.assertAddress(add);
    const provider = options?.provider;
    const [m, a] = provider ? ['account', [add, provider]] : ['accounts', [add]];
    const [resp, result] = [utilitas.ensureArray(
        await quorum.callPreparedContractMethod(abiName, m, a, options)
    ), []];
    for (let x of resp) {
        let item = {}
        saveFields.map((k, i) => { item[k] = x[String(i)]; });
        if (verifyBound(item)) {
            try { result.push(await unpackTransaction(item)); } catch (e) { }
        }
    }
    return provider ? result?.[0] : result;
};

const queryMixinBoundByAddress = async (add, opts) => {
    return await queryBoundByAddress(add, { ...opts || {}, provider: 'MIXIN' });
};

module.exports = {
    bindingPrice,
    bind,
    getBalanceByAddress,
    queryBoundByAddress,
    queryMixinBoundByAddress,
    unpackTransaction,
};

const { utilitas } = require('utilitas');
const quorum = require('./quorum');
const web3 = require('web3');
