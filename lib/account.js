'use strict';

const defaultRamQuant = '4.0000';
const defaultNetQuant = '2.0000';
const defaultCpuQuant = '2.0000';

const generateKeystore = async () => {
    return await Keygen.generateMasterKeys();
};

const getRegisterPrice = () => {
    return finance.bignumberSum(
        defaultRamQuant, defaultNetQuant, defaultCpuQuant
    );
};

const assertName = (name, error = 'Invalid account name.', status = 400) => {
    return utilitas.assert(eosNameVerify(name), error, status);
};

const assertNewName = async (name) => {
    const account = await getByName(name);
    utilitas.assert(!account, 'Account name already exists.', 400);
};

const getByName = async (name) => {
    assertName(name);
    let result = null;
    try {
        result = await (await sushitrain.getClient()).api.rpc.get_account(name);
    } catch (err) {
        utilitas.assert(err.message.includes(
            'unknown key'
        ), 'Error querying EOS account.', 500);
    }
    return result;
};

/*
Limitation: Quality Name Distribution & Namespaces
https://github.com/EOSIO/eos/issues/3189
*/
const create = async (
    actor, privateKey, newAccount, newPublicKey, options = {}
) => {
    assertName(newAccount, 'Invalid new account name.');
    utilitas.assert(newPublicKey, 'New public key is required.', 400);
    const configuration = {
        threshold: 1,
        keys: [{ key: newPublicKey, weight: 1 }],
        accounts: [],
        waits: [],
    };
    return await sushitrain.transact(
        actor, privateKey,
        ['eosio', 'eosio', 'eosio'], ['newaccount', 'buyram', 'delegatebw'],
        [
            {
                creator: actor,
                name: newAccount,
                owner: configuration,
                active: configuration,
            },
            {
                payer: actor,
                receiver: newAccount,
                quant: finance.formatAmount(defaultRamQuant),
            },
            {
                from: actor,
                receiver: newAccount,
                stake_net_quantity: finance.formatAmount(defaultNetQuant),
                stake_cpu_quantity: finance.formatAmount(defaultCpuQuant),
                transfer: true,
            },
        ], options
    );
};

const buyRam = async (actor, receiver, quant, privateKey, options = {}) => {
    receiver ? assertName(receiver, 'Invalid receiver name.')
        : (receiver = actor);
    return await sushitrain.transact(actor, privateKey, 'eosio', 'buyram', {
        payer: actor, receiver: receiver, quant: finance.formatAmount(quant),
    }, options);
};

const getBalance = async (account, currency = finance.chainCurrency) => {
    assertName(account);
    currency = finance.mapCurrency(
        currency, mixin.defaultCurrency, finance.chainCurrency
    );
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

const updateAuth = async (
    permission, publicKey, accounts, actor, privateKey, options = {}
) => {
    const avlPms = ['active', 'owner'];
    permission = String(permission || '').toLowerCase();
    utilitas.assert(avlPms.includes(permission), 'Invalid permission.', 400);
    utilitas.assert(publicKey, 'Invalid public key.', 400);
    return await sushitrain.transact(
        actor, privateKey, 'eosio', 'updateauth',
        {
            parent: 'owner', account: actor, permission,
            auth: {
                threshold: 1,
                waits: [],
                keys: [{ key: publicKey, weight: 1 }],
                accounts: accounts || [],
            },
        },
        options
    );
};

const updateKey = async (permission, publicKey, actor, privateKey, options) => {
    return await updateAuth(
        permission, publicKey, null, actor, privateKey, options
    );
};

const updateActiveKey = async (publicKey, actor, privateKey, options) => {
    options = options || {};
    options.permission = 'owner';
    return await updateKey('active', publicKey, actor, privateKey, options);
};

const updateOwnerKey = async (publicKey, actor, privateKey, options) => {
    options = options || {};
    options.permission = 'owner';
    return await updateKey('owner', publicKey, actor, privateKey, options);
};

module.exports = {
    defaultCpuQuant,
    defaultNetQuant,
    defaultRamQuant,
    assertName,
    assertNewName,
    buyRam,
    create,
    generateKeystore,
    getBalance,
    getByName,
    getRegisterPrice,
    updateActiveKey,
    updateAuth,
    updateOwnerKey,
};

const eosNameVerify = require('eos-name-verify');
const { utilitas } = require('utilitas');
const { Keygen } = require('eosjs-keygen');
const sushitrain = require('./sushitrain');
const finance = require('./finance');
const mixin = require('./mixin');
