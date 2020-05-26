'use strict';

const utility = require('./utility');
const uuidV1 = require('uuid/v1');
const mathjs = require('mathjs');
const assert = require('assert');
const atm = require('./atm');

const defaultRamQuant = '2.0000';
const defaultNetQuant = '1.0000';
const defaultCpuQuant = '1.0000';

/*
Limitation: Quality Name Distribution & Namespaces
https://github.com/EOSIO/eos/issues/3189
*/
const createAccount = async (
    creatorAccount, creatorPrivateKey, newAccount, newPublicKey, options
) => {
    assert(creatorAccount, 'Creator account is required.');
    assert(creatorPrivateKey, 'Creator private key is required.');
    assert(newAccount, 'New account is required.');
    assert(newPublicKey, 'New public key is required.');
    return await atm.transact(
        creatorAccount, creatorPrivateKey,
        ['eosio', 'eosio', 'eosio'], ['newaccount', 'buyram', 'delegatebw'],
        [
            {
                creator: creatorAccount,
                name: newAccount,
                owner: {
                    threshold: 1,
                    keys: [{ key: newPublicKey, weight: 1 }],
                    accounts: [],
                    waits: [],
                },
                active: {
                    threshold: 1,
                    keys: [{ key: newPublicKey, weight: 1 }],
                    accounts: [],
                    waits: [],
                }
            },
            {
                payer: creatorAccount,
                receiver: newAccount,
                quant: `${defaultRamQuant} ${atm.chainCurrency}`,
            },
            {
                from: creatorAccount,
                receiver: newAccount,
                stake_net_quantity: `${defaultNetQuant} ${atm.chainCurrency}`,
                stake_cpu_quantity: `${defaultCpuQuant} ${atm.chainCurrency}`,
                transfer: true,
            },
        ],
        options
    );
};

const openAccount = async (account, publicKey, options) => {
    atm.assertAccountName(account);
    assert(publicKey, 'Public key is required.');
    let [accCheck, trace, memo, amount] = [
        null, uuidV1(), { action: 'newaccount', account, publicKey },
        atm.bigFormat(mathjs.add(
            mathjs.bignumber(defaultRamQuant),
            mathjs.bignumber(defaultNetQuant),
            mathjs.bignumber(defaultCpuQuant),
        ))
    ];
    const encMemo = JSON.stringify(memo);
    assert(encMemo.length <= 140, 'Memo too long.');
    try { await atm.getAccount(account); } catch (err) { accCheck = err; }
    assert(/unknown\ key/i.test(
        accCheck
    ), 'Unable to verify account name or account name already exists.');
    return {
        trace, memo,
        ramQuant: `${defaultRamQuant} ${atm.mixinCurrency}`,
        netQuant: `${defaultNetQuant} ${atm.mixinCurrency}`,
        cpuQuant: `${defaultCpuQuant} ${atm.mixinCurrency}`,
        amount: `${amount} ${atm.mixinCurrency}`,
        paymentUrl: atm.createMixinPaymentUrlToSystemAccount(
            amount, trace, encMemo, options
        )
    };
};

const regProducer = async (
    producer, url, location, producer_key, privateKey, options
) => {
    assert(producer, 'Producer is required.');
    assert(producer_key, 'Public key is required.');
    assert(privateKey, 'Private key is required.');
    assert(url ? utility.verifyUrl(url) : !(url = ''), 'Invalid producer url.');
    return await atm.transact(
        producer, privateKey, 'eosio', 'regproducer',
        { producer, producer_key, url, location: ~~location }, options
    );
};

module.exports = {
    createAccount,
    openAccount,
    regProducer,
};
