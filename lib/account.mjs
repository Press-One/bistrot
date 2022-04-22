import { assertAddress } from './crypto.mjs';
import { utilitas } from 'utilitas';
import web3 from 'web3';

import {
    assertObject, callPreparedContractMethod,
    getEthClient, sendToPreparedContractMethod,
} from './quorum.mjs';

const bindingPrice = '0.0001';
const voidAddress = '0x0000000000000000000000000000000000000000';
const abiName = 'RumAccount';
const pkRules = { meta: { json: true } };

const saveFields = [
    'user', 'payment_provider', 'payment_account', 'meta', 'memo'
];

saveFields.map(x => pkRules[x] = pkRules[x] || {});

const getBalanceByAddress = async (address, opts) => {
    let resp = await (await getEthClient(null, opts)).getBalance(address);
    return opts?.asWei ? resp : web3.utils.fromWei(resp, opts?.unit || 'ether');
};

const getByAddress = async (address, options) => {
    const [balance, bounds] = await Promise.all([
        getBalanceByAddress(address, options),
        queryBoundsByAddress(address, options),
    ]);
    return { balance, bounds };
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

const bind = async (privateKey, add, type, id, meta, memo, options) => {
    if (String.isString(add) && !add.startsWith('0x')) {
        add = `0x${add.toLowerCase()}`;
    }
    assertAddress(add);
    type = utilitas.ensureString(type, { case: 'UP' });
    assert(type, 'Identity-provider is required.', 400);
    assert(id, 'Identity-id is required.', 400);
    meta = Object.assign({ request: { type } }, meta || {});
    meta.request.type = utilitas.ensureString(meta.request.type, { case: 'UP' });
    return await sendToPreparedContractMethod(abiName, 'bind', [
        add, type, id, JSON.stringify(meta), utilitas.ensureString(memo)
    ], { ...options || {}, privateKey });
};

const verifyBound = (item) => item && item.payment_provider
    && item.payment_account && item.user && item.user !== voidAddress;

const queryBoundsByAddress = async (add, options) => {
    assertAddress(add); // ['MIXIN', 'PRSLEGACY']
    const provider = options?.provider;
    const [m, a] = provider ? ['account', [add, provider]] : ['accounts', [add]];
    const [resp, result] = [utilitas.ensureArray(
        await callPreparedContractMethod(abiName, m, a, options)
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

const queryMixinBoundByAddress = (address, options) =>
    queryBoundsByAddress(address, { ...options || {}, provider: 'MIXIN' });

const queryAddressByBound = async (provider, id, options) => {
    assert(provider, 'Identity-provider is required.', 400);
    assert(id, 'Identity-id is required.', 400);
    const resp = await callPreparedContractMethod(
        abiName, 'userAddress', [provider, id], options
    );
    return resp === voidAddress ? null : resp;
};

const countBoundsByProvider = async (provider, options) => {
    assert(provider, 'Identity-provider is required.', 400);
    return utilitas.ensureInt(await callPreparedContractMethod(
        abiName, 'providerUsersCount', [provider], options
    ), { min: 0 });
};

export {
    bindingPrice,
    bind,
    countBoundsByProvider,
    getBalanceByAddress,
    getByAddress,
    queryAddressByBound,
    queryBoundsByAddress,
    queryMixinBoundByAddress,
    unpackTransaction,
};
