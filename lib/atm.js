'use strict';

const getAccount = async (acc) => {
    const [accResp, accBound] = await Promise.all([
        account.getByName(acc),
        queryBoundByAccount(acc),
    ]);
    utilitas.assert(accResp, `Account Not Found (${acc}).`, 404);
    (accBound || []).map(b => {
        const { payment_provider, payment_account } = utilitas.extract(
            b, 'transactions_trx_transaction_actions_data_data'
        ) || {};
        if (!payment_provider || !payment_account) { return; }
        const lp = utilitas.ensureString(payment_provider, { case: 'LOW' });
        Object.assign(accResp, {
            [`bound_${lp}_account`]: payment_account,
            [`bound_${lp}_profile`]: utilitas.extract(b, `bound_${lp}_profile`),
        });
    });
    return accResp;
};

const bindMixinIdentity = async (acc, privateKey, options = {}) => {
    await account.getByName(acc);
    const [trace, amount] = [uuid.v1(), account.bindingPrice];
    const memo = {
        a: 'b', c: acc, s: crypto.signData({ trace }, privateKey).signature,
    };
    const paymentUrl = await system.magicPayment(
        mixin.createPaymentUrlToOfficialAccount(amount, trace, memo, options),
        { cnb: true }
    );
    return { trace, memo, paymentUrl, amount: mixin.formatAmount(amount) };
};

const requestPayment = async (
    privateKey, transType, chainAccount, mixinAccount,
    email, currency, amount, memo, options = {}
) => {
    options.chainAccountRequired = true;
    let key = null;
    switch (transType) {
        case 'reqdeposit':
            key = 'deposit_id';
            memo = memo || 'Deposit on PRESS.one';
            break;
        case 'reqwithdraw':
            key = 'withdraw_id';
            memo = memo || 'Withdraw from PRESS.one';
            options.mixinAccountRequired = true;
            break;
        default:
            utilitas.throwError('Invalid transaction type.');
    }
    var {
        chainAccount, mixinAccount, email, currency, amount, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, mixinAccount, null, email,
        currency, amount, null, memo, options
    );
    const varId = {};
    if (mixinAccount) { varId.mixinAccount = mixinAccount; }
    if (email) { varId.email = email; }
    const transaction = await sushitrain.transact(
        chainAccount, privateKey, 'prs.tproxy', transType,
        {
            user: chainAccount,
            [key]: requestId,
            mixin_trace_id: '',
            mixin_account_id: JSON.stringify(varId),
            amount: finance.formatAmount(amount),
            memo,
        },
        options
    );
    const trace = mixin.getTraceByTransactionId(transaction.transaction_id);
    return {
        chainAccount, mixinAccount, email, currency,
        amount, trace, requestId, memo, transaction
    };
};

const cancelPaymentRequest = async (privateKey, user, memo, options = {}) => {
    return await sushitrain.transact(
        user, privateKey, 'prs.tproxy', 'cancelreq',
        {
            user, memo: memo || 'Payment request canceled by user.',
        }, options
    );
};

const packDeposit = async (result, options) => {
    result.paymentUrl = await system.magicPayment(
        mixin.createPaymentUrlToOfficialAccount(
            result.amount, result.trace, result.memo, options
        ), { cnb: true, screening: true }
    );
    result.paymentTimeout = new Date(new Date(
    ).getTime() + finance.transferTimeout).toISOString();
    return result;
};

const deposit = async (
    privateKey, account, email, amount, memo, options = {}
) => {
    const result = await requestPayment(
        privateKey, 'reqdeposit', account, null, email,
        mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting deposit.', 500);
    return await packDeposit(result, options);
};

const withdraw = async (privateKey, acc, email, amount, memo, options) => {
    options = options || {};
    const mixinAccount = options.mixinAccount || utilitas.extract(
        await queryMixinBoundByAccount(acc, { assert: true }),
        'bound_account'
    );
    const result = await requestPayment(
        privateKey, 'reqwithdraw', acc, mixinAccount,
        email, mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting withdraw.', 500);
    return result;
};

const queryBoundByAccount = async (acc, options) => {
    options = options || {};
    account.assertName(acc, 'Invalid account.');
    const args = {};
    if (options.provider) { args.provider = options.provider; }
    return await sushibar.requestApi('GET', `chain/bounds/${acc}`, args);
};

const queryMixinBoundByAccount = async (acc, options) => {
    options = Object.assign(options || {}, { provider: 'MIXIN' });
    const transaction = await queryBoundByAccount(acc, options);
    const bound_account = utilitas.extract(
        transaction, 'transactions_trx_transaction_actions_data_data',
        'payment_account'
    );
    const bound_profile = utilitas.extract(transaction, 'bound_mixin_profile');
    utilitas.assert(
        !options.assert || bound_account,
        `Bound Mixin-Account Not Found for Account (${acc}).`
    );
    return { transaction, bound_account, bound_profile };
};

const accountEvolution = async (prevKey, account, publicKey, privateKey) => {
    prsc.assertString(account, 'Invalid evolved user account.');
    prsc.assertString(publicKey, 'Invalid evolved public key.');
    const userAddress = crypto.privateKeyToAddress(prevKey);
    const data = {
        account, userAddress, publicKey, provider: 'PRSLEGACY',
        time: Date.now(), action: 'BINDIDENTITY',
    };
    const postData = {
        data, evolvedSignature: crypto.signData(data, privateKey),
        legacySignature: crypto.signData(data, prevKey),
    };
    return await sushibar.requestApi('POST', `chain/bounds`, null, postData);
};

const transfer = async (payee, amount, acc, privateKey, memo, options = {}) => {
    amount = finance.parseAndFormat(amount);
    utilitas.assert(amount, 'Invalid amount.', 400);
    account.assertName(payee, 'Invalid payee.');
    return await sushitrain.transact(
        acc, privateKey, 'eosio.token', 'transfer',
        {
            from: acc,
            to: payee,
            quantity: finance.formatAmount(amount),
            memo: utilitas.ensureString(memo) || 'Transfer on PRESS.one',
        }, options
    );
};

module.exports = {
    accountEvolution,
    bindMixinIdentity,
    cancelPaymentRequest,
    deposit,
    getAccount,
    queryBoundByAccount,
    queryMixinBoundByAccount,
    transfer,
    withdraw,
};

const { uuid, utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
const sushibar = require('./sushibar');
const account = require('./account');
const finance = require('./finance');
const system = require('./system');
const crypto = require('./crypto');
const mixin = require('./mixin');
const prsc = require('./rumsc');
