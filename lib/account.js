'use strict';

const bindingPrice = '0.0001';

const generateKeystore = async () => {
    return await Keygen.generateMasterKeys();
};

const assertName = (name, error = 'Invalid account name.', status = 400) => {
    return utilitas.assert(eosNameVerify(name), error, status);
};

const getByName = async (name) => {
    assertName(name);
    const client = await sushitrain.getClient();
    let result = null;
    try { result = await client.api.rpc.get_account(name); } catch (err) {
        utilitas.assert(err.message.includes(
            'unknown key'
        ), 'Error querying EOS account.', 500);
    }
    return result;
};

const getBalance = async (account, currency) => {
    assertName(account);
    currency = currency ? finance.mapCurrency(
        currency, mixin.defaultCurrency, finance.chainCurrency
    ) : undefined;
    let balance = await (await sushitrain.getClient(
    )).api.rpc.get_currency_balance(
        'eosio.token', account, currency
    );
    balance = finance.parseBalance(balance);
    utilitas.assert(balance, 'Error requesting balance.', 500);
    const result = {};
    for (let i in balance) {
        result[finance.mapCurrency(
            i, finance.chainCurrency, mixin.defaultCurrency
        )] = balance[i];
    }
    result[mixin.defaultCurrency] = result[mixin.defaultCurrency] || 0;
    return result;
};

const bind = async (
    user, payment_provider, payment_account, meta, memo, options = {}
) => {
    utilitas.assert(payment_provider, 'Invalid identity provider.', 400);
    utilitas.assert(payment_account, 'Invalid identity id.', 400);
    meta = Object.assign({ request: { type: payment_provider } }, meta || {});
    meta.request.type = utilitas.ensureString(
        meta.request.type, { case: 'UP' }
    );
    const ctName = 'prs.account';
    return await sushitrain.preparedTransact(ctName, ctName, 'bind', {
        user, payment_provider, payment_account,
        meta: JSON.stringify(meta), memo: utilitas.ensureString(memo),
    }, options);
};

module.exports = {
    bindingPrice,
    assertName,
    bind,
    generateKeystore,
    getBalance,
    getByName,
};

const eosNameVerify = require('eos-name-verify');
const { utilitas } = require('utilitas');
const { Keygen } = require('eosjs-keygen');
const sushitrain = require('./sushitrain');
const finance = require('./finance');
const mixin = require('./mixin');
