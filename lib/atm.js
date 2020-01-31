'use strict';

const { TextEncoder, TextDecoder } = require('util');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const assert = require('assert');
const mathjs = require('mathjs');
const uuidV1 = require('uuid/v1');
const fetch = require('node-fetch');
const config = require('./config');

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const rpc = new JsonRpc(config.chainApi, { fetch });
const defaultTransMemo = 'Transfer via PRESS.one';
const defaultDepositMemo = 'Deposit on PRESS.one';
const defaultWithdrawMemo = 'Withdraw from PRESS.one';
const transactConfig = { blocksBehind: 10, expireSeconds: 60 };
const chainCurrency = 'SRP';
const mixinCurrency = config.debug ? 'CNB' : 'PRS';
const prsMixinAccountId = '14da6c0c-0cbf-483c-987a-c44477dcad1b';

const currencies = {
    CNB: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
    PRS: '3edb734c-6d6f-32ff-ab03-4eb43640c758',
    EOS: '6cfe566e-4aad-470b-8c9a-2fd35b49c68d',
};

const verifyAccountName = (name) => {
    return typeof name === 'string'
        && /(^[a-z1-5\.]{1,11}[a-z1-5]$)|(^[a-z1-5\.]{12}[a-j1-5]$)/.test(name);
};

const verifyUuid = (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        uuid
    );
};

const verifyMxinId = (mixinId) => {
    return /^[0-9]{1,}$/.test(mixinId);
};

const verifyEmail = (email) => {
    return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(
        email
    );
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

const assemblyUrl = (url, componens) => {
    let args = [];
    for (let i in componens) {
        args.push(`${i}=${encodeURIComponent(componens[i])}`);
    }
    return `${url}?${args.join('&')}`;
};

const parseBalance = (balance) => {
    const result = {};
    for (let item of balance) {
        result[item.replace(/(^[\d\.]*) ([a-z]*$)/i, '$2')]
            = item.replace(/(^[\d\.]*) ([a-z]*$)/i, '$1');
    }
    return result;
};

const buildClient = (privateKey) => {
    assert(privateKey, 'Invalid private key.');
    const signatureProvider = new JsSignatureProvider([privateKey]);
    assert(signatureProvider, 'Error configurating signature provider.');
    const api = new Api({
        rpc, signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
    });
    assert(api, 'Error configurating api client.');
    return { signatureProvider, api };
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
    assert(
        !options.chainAccountRequired || verifyAccountName(chainAccount),
        'Invalid account'
    );
    assert(
        !options.mixinAccountRequired || verifyUuid(mixinAccount),
        'Invalid Mixin account');
    assert(
        !options.mixinAccountOrIdRequired
        || (verifyUuid(mixinAccount) || (verifyMxinId(mixinId) && mixinName)),
        'Invalid Mixin account');
    assert(!email || verifyEmail(email), 'Invalid email');
    assert(currencyId, 'Invalid currency');
    assert(amount, 'Invalid amount');
    assert(verifyUuid(trace), 'Invalid trace');
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
    return assemblyUrl('https://mixin.one/pay', {
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
    assert(actor, 'Actor name is required.');
    assert(account, 'Action name is required.');
    assert(name, 'Action name is required.');
    assert(data, 'Action data is required.');
    const client = buildClient(privateKey);
    let result = null;
    try {
        const action = makeActions(account, name, data, actor);
        // console.log(JSON.stringify(client, null, 2));
        // console.log(JSON.stringify(action, null, 2));
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
                console.log('Client: \n', JSON.stringify(client));
                console.log('\nActor: ', `${actor} ( ${privateKey} )`);
                console.log('\nAction: ', `${account} -> ${name}`);
                console.log('\nPayload: \n', data);
                if (err instanceof RpcError) {
                    console.log(
                        '\nRPC Error: \n', JSON.stringify(err.json, null, 2)
                    );
                }
                fullLengthLog();
            }
            assert(false, strErr);
        }
    }
    assert(result, 'Error pushing PRS transaction.');
    return result;
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
            assert(false, 'Invalid transaction type');
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
            }
        ), options
    };
};

const getBalanceByAccountAndCurrency = async (privateKey, account, currency) => {
    const client = buildClient(privateKey);
    verifyAccountName(account, 'Invalid account');
    let balace = await client.api.rpc.get_currency_balance(
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
    deposit,
    withdraw,
    getBalance,
};
