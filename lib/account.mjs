import { assertAddress, assertRecipient, privateKeyToAddress } from './crypto.mjs';
import { balanceOf } from './erc20.mjs';
import { assertAmount } from './finance.mjs';
import { getMirroredAsset } from './mixin.mjs';
import { math, utilitas } from 'utilitas';
import web3 from 'web3';

import {
    assertObject, buildClient, callPreparedContractMethod,
    getEthClient, sendToPreparedContractMethod,
} from './quorum.mjs';

const [bindingPrice, bindingAsset] = ['0.0001', 'CNB'];
const voidAddress = '0x0000000000000000000000000000000000000000';
const maxTransferAmount = 1000;
const abiName = 'RumAccount';
const pkRules = { meta: { json: true } };

const saveFields = [
    'user', 'payment_provider', 'payment_account', 'meta', 'memo'
];

saveFields.map(x => pkRules[x] = pkRules[x] || {});

const getBalanceByAddress = async (address, opts) => {
    let resp = await (await getEthClient(null, opts)).getBalance(address);
    resp = opts?.asWei ? resp : web3.utils.fromWei(resp, opts?.unit || 'ether');
    if (opts?.rumOnly) { return resp; }
    let [assets, keys, resps, result] = [getMirroredAsset(), [], [], {
        'RUM': opts?.amountOnly ? resp : {
            index: 0,
            id: '4f2ec12c-22f4-3a9e-b757-c84b6415ea8f',
            name: 'RumSystem.net RUM',
            icon: 'https://rumsystem.net/assets/logo_rumsystem.a9098eea.svg',
            rumAddress: '0x0000000000000000000000000000000000000000',
            symbol: 'RUM',
            symbolDisplay: 'RUM',
            rumSymbol: 'RUM',
            amount: resp,
            native: true,
        }
    }];
    for (let i in assets) {
        keys.push(i);
        resps.push(balanceOf(assets[i].rumAddress, address));
    }
    resps = await Promise.all(resps);
    for (let i in keys) {
        result[assets[keys[i]].rumSymbol] = opts?.amountOnly
            ? resps[i] : { ...assets[keys[i]], amount: resps[i] };
    }
    return result;
};

const getByAddress = async (address, options) => {
    const [assets, bounds] = await Promise.all([
        getBalanceByAddress(address, options),
        queryBoundsByAddress(address, options),
    ]);
    return { assets, bounds };
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

const unBind = async (privateKey, add, type, options) => {
    if (String.isString(add) && !add.startsWith('0x')) {
        add = `0x${add.toLowerCase()}`;
    }
    assertAddress(add);
    type = utilitas.ensureString(type, { case: 'UP' });
    assert(type, 'Identity-provider is required.', 400);
    return await sendToPreparedContractMethod(
        abiName, 'unBind', [add, type], { ...options || {}, privateKey }
    );
};

const selfBind = async (privateKey, type, id, meta, memo, options) => {
    type = utilitas.ensureString(type, { case: 'UP' });
    assert(type, 'Identity-provider is required.', 400);
    assert(id, 'Identity-id is required.', 400);
    meta = Object.assign({ request: { type } }, meta || {});
    meta.request.type = utilitas.ensureString(meta.request.type, { case: 'UP' });
    return await sendToPreparedContractMethod(abiName, 'selfBind', [
        type, id, JSON.stringify(meta), utilitas.ensureString(memo)
    ], { ...options || {}, privateKey });
};

const selfUnBind = async (privateKey, type, options) => {
    type = utilitas.ensureString(type, { case: 'UP' });
    assert(type, 'Identity-provider is required.', 400);
    return await sendToPreparedContractMethod(
        abiName, 'selfUnBind', [type], { ...options || {}, privateKey }
    );
};

const prepareSelfBind = (type, id, meta, memo) => {
    type = utilitas.ensureString(type, { case: 'UP' });
    assert(type, 'Identity-provider is required.', 400);
    assert(id, 'Identity-id is required.', 400);
    meta = Object.assign({ request: { type } }, meta || {});
    meta.request.type = utilitas.ensureString(meta.request.type, { case: 'UP' });
    return lib.utilitas.assembleUrl('/counter', {
        contract: abiName, func: 'selfBind', params: JSON.stringify([
            type, id, JSON.stringify(meta), utilitas.ensureString(memo)
        ]),
    });
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

const transfer = async (privateKey, to, amount, options) => {
    const from = privateKeyToAddress(privateKey);
    const client = (await buildClient(privateKey, options)).eth;
    const nonce = options?.nonce || await client.getTransactionCount(from);
    const b = math.bignumber(await getBalanceByAddress(from, { rumOnly: 1 }));
    to = assertRecipient(to);
    amount = assertAmount(amount);
    assert(math.smaller(amount, maxTransferAmount)
        && math.smaller(amount, b), 'Invalid amount.', 400);
    return await client.sendTransaction({
        from, to, value: web3.utils.toWei(amount), nonce
    });
};

export {
    bind,
    bindingAsset,
    bindingPrice,
    countBoundsByProvider,
    getBalanceByAddress,
    getByAddress,
    prepareSelfBind,
    queryAddressByBound,
    queryBoundsByAddress,
    queryMixinBoundByAddress,
    selfBind,
    selfUnBind,
    transfer,
    unBind,
    unpackTransaction,
};
