'use strict';

const { TextEncoder, TextDecoder } = require('util');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const assert = require('assert');
const mathjs = require('mathjs');
const uuidV1 = require('uuid/v1');
const fetch = require('node-fetch');
const utility = require('./utility');
const config = require('./config');

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const rpc = new JsonRpc(config.rpcApi, { fetch });
const defaultTransMemo = 'Transfer via PRESS.one';
const defaultDepositMemo = 'Deposit on PRESS.one';
const defaultWithdrawMemo = 'Withdraw from PRESS.one';
const transactConfig = { blocksBehind: 10, expireSeconds: 60 };
const chainCurrency = 'SRP';
const mixinCurrency = 'PRS'; // config.debug ? 'CNB' : 'PRS';
const prsMixinAccountId = 'beb05804-f083-498e-ac0f-af6d7fbcd694';
const paymentTimeout = 1000 * 60 * 60 * 24 * 7;

const currencies = {
    CNB: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
    PRS: '3edb734c-6d6f-32ff-ab03-4eb43640c758',
    EOS: '6cfe566e-4aad-470b-8c9a-2fd35b49c68d',
};

const verifyAccountName = (name) => {
    return typeof name === 'string'
        && /(^[a-z1-5\.]{1,11}[a-z1-5]$)|(^[a-z1-5\.]{12}[a-j1-5]$)/.test(name);
};

const assertAccountName = (name, error) => {
    assert(verifyAccountName(name), error || 'Invalid account name.');
};

const verifyMxinId = (mixinId) => {
    return /^[0-9]{1,}$/.test(mixinId);
};

const bigFormat = (bignumber) => {
    return mathjs.format(bignumber, {
        notation: 'fixed',
        precision: 4,
    }).replace(/"/g, '');
};

const parseAmount = (amount) => {
    return /^-?\d+(\.\d+)?$/.test(amount = String(amount))
        && mathjs.larger('1000000000000000000000000000000', amount)
        && mathjs.larger(amount, 0) // max length = 30 // + 1 for checking
        && amount;
};

const makeStringByLength = (string, length) => {
    string = String(string || '');
    length = parseInt(length) || 0;
    let result = '';
    while (string && length && result.length < length) {
        result += string;
    }
    return result;
};

const fullLengthLog = (string, maxLength) => {
    string = String(string || '');
    maxLength = parseInt(maxLength) || process.stdout.columns;
    const pad = '=';
    if (string.length + 4 > maxLength) {
        console.log(makeStringByLength(pad, maxLength));
        console.log(string);
        console.log(makeStringByLength(pad, maxLength));
    } else {
        string = string ? ` ${string} ` : '';
        const lLen = Math.floor((maxLength - string.length) / 2);
        const rLen = maxLength - lLen - string.length;
        console.log(
            `${makeStringByLength(pad, lLen)}${string}`
            + `${makeStringByLength(pad, rLen)}`
        );
    }
    return { string, maxLength };
};

const parseAndFormat = (amount) => {
    return parseAmount(amount) && bigFormat(amount);
};

const convertBase = (ipt, from, to) => {
    return parseInt(ipt || 0, from).toString(to);
};

const convertFrom16to10 = (ipt) => {
    return parseInt(convertBase(ipt, 16, 10));
};

const getTimestampFromUuid = (uuid) => {
    return uuid ? Math.ceil((convertFrom16to10(
        String(uuid).replace(/^(.{8})-(.{4})-.(.{3})-.{4}-.{12}$/, '$3$2$1')
    ) - 122192928000000000) / 10000) : 0;
};

const parseAmountAndCurrency = (string) => {
    return [
        string.replace(/(^[\d\.]*) ([a-z]*$)/i, '$1'),
        string.replace(/(^[\d\.]*) ([a-z]*$)/i, '$2'),
    ];
};

const parseBalance = (balance) => {
    const result = {};
    for (let item of balance) {
        const res = parseAmountAndCurrency(item);
        result[res[1]] = res[0];
    }
    return result;
};

const buildClient = (privateKey, options) => {
    options = options || {};
    assert(options.noKey || privateKey, 'Invalid private key.');
    const signatureProvider = new JsSignatureProvider(
        privateKey ? [privateKey] : []
    );
    assert(signatureProvider, 'Error configurating signature provider.');
    const api = new Api({
        rpc, signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
    });
    assert(api, 'Error configurating api client.');
    return { signatureProvider, api };
};

const defaultClient = () => {
    return buildClient(null, { noKey: true });
};

const makeActions = (account, name, data, actor) => {
    return {
        actions: [{
            account, name, data,
            authorization: [{ actor, permission: 'active' }]
        }]
    };
};

const verifyPaymentArgs = (
    chainAccount, mixinAccount, mixinId, mixinName,
    email, currency, amount, trace, memo, options
) => {
    options = options || {};
    let currencyId = currencies[currency];
    mixinAccount = String(mixinAccount || '').trim();
    mixinId = String(mixinId || '').trim();
    mixinName = String(mixinName || '').trim();
    email = String(email || '').trim();
    amount = parseAndFormat(amount);
    trace = String(trace || '').trim() || uuidV1();
    if (options.chainAccountRequired) {
        assertAccountName(chainAccount);
    }
    assert(
        !options.mixinAccountRequired || utility.verifyUuid(mixinAccount),
        'Invalid Mixin account.');
    assert(
        !options.mixinAccountOrIdRequired
        || (utility.verifyUuid(mixinAccount)
            || (verifyMxinId(mixinId) && mixinName)),
        'Invalid Mixin account');
    assert(!email || utility.verifyEmail(email), 'Invalid email.');
    assert(currencyId, 'Invalid currency.');
    assert(amount, 'Invalid amount.');
    assert(utility.verifyUuid(trace), 'Invalid trace.');
    return {
        chainAccount, mixinAccount, mixinId, mixinName,
        email, currency, currencyId, amount, trace,
        requestId: getTimestampFromUuid(trace),
        memo: memo || defaultTransMemo,
    };
};

const createMixinPaymentUrl = (
    mixinAccount, currency, amount, trace, memo, options
) => {
    options = options || {};
    options.mixinAccountRequired = true;
    var { mixinAccount, currencyId, amount, trace, memo } = verifyPaymentArgs(
        null, mixinAccount, null, null, null,
        currency, amount, trace, memo, options
    );
    return utility.assemblyUrl('https://mixin.one/pay', {
        recipient: mixinAccount, asset: currencyId, amount, trace, memo
    });
};

const createMixinPaymentUrlToSystemAccount = (amount, trace, memo, options) => {
    return createMixinPaymentUrl(
        prsMixinAccountId, mixinCurrency, amount, trace, memo, options
    );
};

const transact = async (actor, privateKey, account, name, data, options) => {
    options = options || {};
    assert(actor, 'Actor is required.');
    assert(account, 'Action account is required.');
    assert(name, 'Action name is required.');
    assert(data, 'Action data is required.');
    const client = buildClient(privateKey);
    let action = null;
    let result = null;
    try {
        action = makeActions(account, name, data, actor);
        // console.log(utility.json(client));
        // console.log(utility.json(action));
        result = await client.api.transact(action, transactConfig);
    } catch (err) {
        if (options.ignoreError && options.ignoreError.test(err)) {
            result = {};
            // console.log(err);
        } else {
            const strErr = `PRS API > ${String(err)}`;
            if (config.debug) {
                fullLengthLog('VERBOSE LOG FOR DEBUG ONLY');
                // console.log(strErr);
                console.log(`Client:\n${utility.json(client)}`);
                console.log(`\nActor: ${actor} (${privateKey})`);
                console.log(`\nAction: ${account} -> ${name}`);
                console.log(`\nPayload:\n${utility.json(action)}`);
                if (err instanceof RpcError) {
                    console.log(`\nRPC Error:\n${utility.json(err.json)}`);
                }
                fullLengthLog();
            }
            assert(false, strErr);
        }
    }
    assert(result, 'Error pushing PRS transaction.');
    return result;
};

const updateAuth = async (chainAccount, publicKey, privateKey, options) => {
    assert(publicKey, 'Invalid publicKey key.');
    return await transact(chainAccount, privateKey, 'eosio', 'updateauth', {
        parent: 'owner',
        account: chainAccount,
        permission: 'active',
        auth: {
            threshold: 1,
            waits: [],
            keys: [{ key: publicKey, weight: 1 }],
            accounts: [{
                weight: 1,
                permission: { actor: 'prs.prsc', permission: 'eosio.code' }
            }, {
                weight: 1,
                permission: { actor: 'prs.tproxy', permission: 'eosio.code' }
            }],
        },
    }, options);
};

const claimRewards = async (chainAccount, privateKey, options) => {
    return await transact(chainAccount, privateKey, 'eosio', 'claimrewards', {
        owner: chainAccount,
    }, options);
};

const getStakeQuantity = (amount) => {
    return `${amount || '0.0000'} ${chainCurrency}`;
};

const rawDelegateBw = async (
    from, action, receiver, cpuQuantity, netQuantity, privateKey, options
) => {
    if (receiver) {
        assertAccountName(receiver, 'Invalid receiver.');
    } else {
        receiver = from;
    }
    cpuQuantity = parseAndFormat(cpuQuantity);
    netQuantity = parseAndFormat(netQuantity);
    assert(cpuQuantity || netQuantity, 'Invalid CPU or NET quantity.');
    const data = { from, receiver };
    switch ((action = String(action || '').toLowerCase())) {
        case 'delegatebw':
            data.transfer = false;
            data.stake_cpu_quantity = getStakeQuantity(cpuQuantity);
            data.stake_net_quantity = getStakeQuantity(netQuantity);
            break;
        case 'undelegatebw':
            data.unstake_cpu_quantity = getStakeQuantity(cpuQuantity);
            data.unstake_net_quantity = getStakeQuantity(netQuantity);
            break;
        default:
            assert(false, 'Invalid delegate action.');
    }
    return await transact(from, privateKey, 'eosio', action, data, options);
};

const delegateBw = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options
) => {
    return await rawDelegateBw(
        from, 'delegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const undelegateBw = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options
) => {
    return await rawDelegateBw(
        from, 'undelegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const requestPayment = async (
    privateKey, transType, chainAccount, mixinAccount, mixinId,
    mixinName, email, currency, amount, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    let key = null;
    switch (transType) {
        case 'reqdeposit':
            key = 'deposit_id';
            memo = memo || defaultDepositMemo;
            break;
        case 'reqwithdraw':
            key = 'withdraw_id';
            memo = memo || defaultWithdrawMemo;
            options.mixinAccountOrIdRequired = true;
            break;
        default:
            assert(false, 'Invalid transaction type.');
    }
    var {
        chainAccount, mixinAccount, mixinId, mixinName,
        email, currency, amount, trace, requestId, memo
    } = verifyPaymentArgs(
        chainAccount, mixinAccount, mixinId, mixinName,
        email, currency, amount, null, memo, options
    );
    const varId = {};
    if (mixinAccount) {
        varId.mixinAccount = mixinAccount;
    }
    if (mixinId) {
        varId.mixinId = mixinId;
    }
    if (mixinName) {
        varId.mixinName = mixinName;
    }
    if (email) {
        varId.email = email;
    }
    return {
        chainAccount, mixinAccount, mixinId, mixinName,
        email, currency, amount, trace, requestId, memo,
        transaction: await transact(
            chainAccount, privateKey, 'prs.tproxy', transType,
            {
                user: chainAccount,
                [key]: requestId,
                mixin_trace_id: trace,
                mixin_account_id: JSON.stringify(varId),
                amount: `${amount} ${chainCurrency}`,
                memo,
            },
            options
        )
    };
};

const cancelPaymentRequest = async (privateKey, account, memo, options) => {
    return await transact(account, privateKey, 'prs.tproxy', 'cancelreq', {
        user: account,
        memo: memo || 'Payment request canceled by user.',
    }, options);
};

const getInfo = async () => {
    return await defaultClient().api.rpc.get_info();
};

const getAccount = async (account) => {
    assertAccountName(account);
    return await defaultClient().api.rpc.get_account(account);
};

const getBalanceByAccountAndCurrency = async (account, currency) => {
    assertAccountName(account);
    let balace = await defaultClient().api.rpc.get_currency_balance(
        'eosio.token', account, currency
    );
    balace = parseBalance(balace);
    assert(balace, 'Error requesting balance.');
    return { [mixinCurrency]: balace[chainCurrency] || 0 };
};

const deposit = async (privateKey, account, email, amount, memo, options) => {
    let result = await requestPayment(
        privateKey, 'reqdeposit', account, null, null,
        null, email, mixinCurrency, amount, memo, options
    );
    assert(result, 'Error requesting deposit.');
    result.paymentUrl = createMixinPaymentUrlToSystemAccount(
        result.amount, result.trace, result.memo, options
    );
    result.paymentTimeout = new Date(new Date(
    ).getTime() + paymentTimeout).toISOString();
    return result;
};

const withdraw = async (
    privateKey, account, mixinAccount, mixinId,
    mixinName, email, amount, memo, options
) => {
    let result = await requestPayment(
        privateKey, 'reqwithdraw', account, mixinAccount, mixinId,
        mixinName, email, mixinCurrency, amount, memo, options
    );
    assert(result, 'Error requesting withdraw.');
    return result;
};

const getBalance = async (privateKey, account) => {
    return await getBalanceByAccountAndCurrency(
        privateKey, account, chainCurrency
    );
};

module.exports = {
    mixinCurrency,
    paymentTimeout,
    transact,
    assertAccountName,
    updateAuth,
    claimRewards,
    deposit,
    withdraw,
    cancelPaymentRequest,
    getInfo,
    getAccount,
    getBalance,
    delegateBw,
    undelegateBw,
};
