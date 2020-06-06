'use strict';

const eosNameVerify = require('eos-name-verify');
const { utilitas } = require('utilitas');
const { Keygen } = require('eosjs-keygen');
const sushitrain = require('./sushitrain');
const finance = require('./finance');

const defaultRamQuant = '4.0000';
const defaultNetQuant = '2.0000';
const defaultCpuQuant = '2.0000';

const generateKeystore = async () => {
    return await Keygen.generateMasterKeys();
};

const getAccountByName = async (name) => {
    utilitas.assert(name, 'Name is required.', 400);
    let result = null;
    try {
        result = await sushitrain.getClient().api.rpc.get_account(name);
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
const createAccount = async (
    actor, privateKey, newAccount, newPublicKey, options = {}
) => {
    utilitas.assert(
        eosNameVerify(newAccount), 'Invalid new account name.', 400
    );
    utilitas.assert(newPublicKey, 'New public key is required.', 400);
    const [currency, configuration] = [finance.chainCurrency, {
        threshold: 1,
        keys: [{ key: newPublicKey, weight: 1 }],
        accounts: [],
        waits: [],
    }];
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
                quant: `${defaultRamQuant} ${currency}`,
            },
            {
                from: actor,
                receiver: newAccount,
                stake_net_quantity: `${defaultNetQuant} ${currency}`,
                stake_cpu_quantity: `${defaultCpuQuant} ${currency}`,
                transfer: true,
            },
        ], options
    );
};

module.exports = {
    defaultCpuQuant,
    defaultNetQuant,
    defaultRamQuant,
    createAccount,
    generateKeystore,
    getAccountByName,
};
