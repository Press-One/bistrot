'use strict';

const { TextEncoder, TextDecoder } = require('util');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const assert = require('assert');
const mathjs = require('mathjs');
const uuidV1 = require('uuid/v1');
const config = require('./config');
const fetch = require('node-fetch');
const rpc = new JsonRpc(config.chainApi, { fetch });

const defaultTransMemo = 'Transfer via PRESS.one';

const defaultDepositMemo = 'Deposit on PRESS.one';

const defaultWithdrawMemo = 'Withdraw from PRESS.one';

const chainRpcApi = `${config.chainApi}/v1/`;

const permission = 'active';

const clients = {};

const transactConfig = { blocksBehind: 10, expireSeconds: 60 };

const chainCurrency = 'SRP';

const mixinCurrency = config.debug ? 'CNB' : 'PRS';

const mixinClientId = '14da6c0c-0cbf-483c-987a-c44477dcad1b';

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

const verifyPaymentArgs = (
    chainAccount, mixinAccount, currency, amount, trace, memo, options
) => {
    options = options || {};
    let currencyId = currencies[currency];
    mixinAccount = mixinAccount || '';
    amount = parseAndFormat(amount);
    trace = trace || uuidV1();
    assert(!options.chainAccountRequired
        || verifyAccountName(chainAccount), 'Invalid account');
    assert(!options.mixinAccountRequired
        || verifyUuid(mixinAccount), 'Invalid Mixin account');
    assert(currencyId, 'Invalid currency');
    assert(amount, 'Invalid amount');
    assert(verifyUuid(trace), 'Invalid trace');
    return {
        chainAccount, mixinAccount, currency, currencyId, amount, trace,
        requestId: getTimestampFromUuid(trace),
        memo: memo || defaultTransMemo,
    };
};

const buildClient = (name, keystore) => {
    assert(
        name && keystore && keystore.privateKeys && keystore.privateKeys.active,
        'Invalid keystore.'
    );
    const signatureProvider = new JsSignatureProvider([
        keystore.privateKeys.active
    ]);
    const api = new Api({
        rpc,
        signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
    });
    return { name, keystore, signatureProvider, api };
};

const getClient = (name, keystore) => {
    return clients[name] || buildClient(name, keystore);
};

const getPreConfiguredClient = (name) => {
    return getClient(name, config.accounts[name]);
};

const getBpClient = () => {
    return getPreConfiguredClient(config.bpAccount);
};

const makeAuthorizations = (actor, permission) => {
    return [{ actor, permission }];
};

const makeActions = (account, actor, name, data) => {
    return {
        actions: [{
            account, name, data,
            authorization: makeAuthorizations(actor, permission),
        }]
    };
};

const transact = async (client, account, name, data, options) => {
    options = options || {};
    assert(client, 'Api client is required.');
    assert(name, 'Action name is required.');
    assert(data, 'Action data is required.');
    let result = null;
    try {
        const action = makeActions(account, client.name, name, data);
        // console.log(JSON.stringify(client, null, 2));
        // console.log(JSON.stringify(action, null, 2));
        result = await client.api.transact(action, transactConfig);
    } catch (err) {
        if (options.ignoreError && options.ignoreError.test(err)) {
            result = {};
            // console.log(err);
        } else {
            console.log(`PRS API Error: ${err}`);
            console.log(client, account, name, data);
            if (err instanceof RpcError) {
                console.log(JSON.stringify(err.json, null, 2));
            }
            assert(false, `PRS api error: ${String(err)}`);
        }
    }
    assert(result, 'Error pushing PRS transaction.');
    return result;
};

const bpTransact = async (account, name, data, options) => {
    const client = getBpClient();
    return await transact(client, account, name, data, options);
};

const requestPayment = async (
    transType, chainAccount, mixinAccount, currency, amount, memo, options
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
            options.mixinAccountRequired = true;
            break;
        default:
            assert(false, 'Invalid transaction type');
    }
    var {
        chainAccount, mixinAccount, currency, amount, trace, requestId, memo
    } = verifyPaymentArgs(
        chainAccount, mixinAccount, currency, amount, null, memo, options
    );
    // @todo ///////////////////////////////////////////////////////////////////
    // if (config.debug) {
    //     currency = 'EOS';
    // }
    ////////////////////////////////////////////////////////////////////////////
    return {
        chainAccount, mixinAccount, currency, amount, trace, requestId, memo,
        transaction: await bpTransact('prs.tproxy', transType, {
            user: chainAccount,
            [key]: requestId,
            mixin_trace_id: trace,
            mixin_account_id: mixinAccount,
            amount: `${amount} ${currency}`,
            memo,
        })
    };
};

const requestDeposit = async (account, amount, memo, options) => {
    return await requestPayment(
        'reqdeposit', account, null, mixinCurrency, amount, memo, options
    );
};

const requestWithdraw = async (account, mixinId, amount, memo, options) => {
    return await requestPayment(
        'reqwithdraw', account, mixinId, mixinCurrency, amount, memo, options
    );
};

const createMixinPaymentUrl = (
    mixinAccount, currency, amount, trace, memo, options
) => {
    options = options || {};
    options.mixinAccountRequired = true;
    var { mixinAccount, currencyId, amount, trace, memo } = verifyPaymentArgs(
        null, mixinAccount, currency, amount, trace, memo, options
    );
    return 'https://mixin.one/pay'
        + '?recipient=' + encodeURIComponent(mixinAccount)
        + '&asset=' + encodeURIComponent(currencyId)
        + '&amount=' + encodeURIComponent(amount)
        + '&trace=' + encodeURIComponent(trace)
        + '&memo=' + encodeURIComponent(memo);
};

const createMixinPaymentUrlToSystemAccount = (amount, trace, memo, options) => {
    return createMixinPaymentUrl(
        mixinClientId, mixinCurrency, amount, trace, memo, options
    );
};

const deposit = async (account, amount, memo, options) => {
    let result = await requestDeposit(account, amount, memo, options);
    assert(result, 'Error requesting deposit.');
    result.paymentUrl = createMixinPaymentUrlToSystemAccount(
        result.amount, result.trace, result.memo, options
    );
    return result;
};

const withdraw = async (account, mixinId, amount, memo, options) => {
    let result = await requestWithdraw(account, mixinId, amount, memo, options);
    assert(result, 'Error requesting withdraw.');
    return result;
};

(async () => {

    try {
        console.log(await deposit('test.bp2', 1));
        // console.log(await withdraw('36029b33-838f-4dbe-ae9b-f0e86226d53d', 1));
    } catch (err) {
        console.log(err);
    }

})();
