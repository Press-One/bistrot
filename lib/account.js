'use strict';

const bindingPrice = '0.0001';
const defaultCpuQuant = '2.0000';
const defaultNetQuant = '2.0000';
const defaultRamQuant = '4.0000';
const preserveIds = ['pressone', 'press.one', 'admin', 'administrator', 'root'];
const parentPms = { owner: '', active: 'owner', claimer: 'active' };
const pmsNeeded = ['prs.prsc', 'prs.swap', 'prs.tproxy'];

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

const assertNotPreservedName = async ( // async is for the future
    name, error = 'Account name is preserved.', status = 400
) => {
    return utilitas.assert(!preserveIds.includes(
        utilitas.ensureString(name, { case: 'LOW' })
    ), error, status);
};

const assertNewName = async (name) => {
    const account = await getByName(name);
    utilitas.assert(!account, 'Account name already exists.', 400);
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

const getKeys = async (acc, permission) => {
    permission = utilitas.ensureString(permission, { case: 'LOW' });
    const resp = await getByName(acc);
    utilitas.assert(resp, 'User not found.', 404);
    const result = [];
    for (let i of resp && resp.permissions ? resp.permissions : []) {
        for (let j of i.required_auth.keys || []) {
            if (j.key && (!permission || permission === i.perm_name)) {
                j.permission = i.perm_name;
                j.authorization = i.required_auth.accounts;
                result.push(j);
            }
        }
    }
    return permission ? (result.length ? result[0] : null) : result;
};

/*
Limitation: Quality Name Distribution & Namespaces
https://github.com/EOSIO/eos/issues/3189
*/
const create = async (actor, privateKey, newAccount, newPublicKey, options) => {
    options = options || {};
    assertNewName(newAccount);
    utilitas.assert(newPublicKey, 'New public key is required.', 400);
    if (!options.skipPreserve) { await assertNotPreservedName(newAccount); }
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

const updateAuth = async (
    permission, publicKey, accounts, actor, privateKey, options = {}
) => {
    permission = String(permission || '').toLowerCase();
    const pmsCheck = utilitas.isSet(parentPms[permission]);
    utilitas.assert(pmsCheck, 'Invalid permission.', 400);
    utilitas.assert(publicKey, 'Invalid public key.', 400);
    return await sushitrain.transact(
        actor, privateKey, 'eosio', 'updateauth',
        {
            parent: parentPms[permission], account: actor, permission,
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

const deleteAuth = async (permission, actor, privateKey, options = {}) => {
    permission = String(permission || '').toLowerCase();
    const pmsCheck = utilitas.isSet(parentPms[permission]);
    utilitas.assert(pmsCheck, 'Invalid permission.', 400);
    return await sushitrain.transact(
        actor, privateKey, 'eosio', 'deleteauth',
        { account: actor, permission }, options
    );
};

const linkAuth = async (type, requirement, actor, privateKey, options = {}) => {
    utilitas.assert(type, 'Invalid auth type.', 400);
    utilitas.assert(requirement, 'Invalid auth requirement.', 400);
    return await sushitrain.transact(actor, privateKey, 'eosio', 'linkauth', {
        account: actor, code: 'eosio', type, requirement
    }, options);
};

const unlinkAuth = async (type, actor, privateKey, options = {}) => {
    utilitas.assert(type, 'Invalid auth type.', 400);
    return await sushitrain.transact(actor, privateKey, 'eosio', 'unlinkauth', {
        account: actor, code: 'eosio', type
    }, options);
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

const updateKey = async (permission, publicKey, actor, privateKey, options) => {
    options = options || {};
    options.permission = 'owner';
    return await updateAuth(
        permission, publicKey, null, actor, privateKey, options
    );
};

const updateActiveKey = async (publicKey, actor, privateKey, options) => {
    return await updateKey('active', publicKey, actor, privateKey, options);
};

const updateOwnerKey = async (publicKey, actor, privateKey, options) => {
    return await updateKey('owner', publicKey, actor, privateKey, options);
};

const updateClaimerKey = async (publicKey, actor, privateKey, options) => {
    return await updateKey('claimer', publicKey, actor, privateKey, options);
};

const deleteClaimerKey = async (actor, privateKey, options) => {
    return await deleteAuth('claimer', actor, privateKey, options);
};

const linkClaimrewardAuth = async (actor, privateKey, options) => {
    return await linkAuth('claimrewards', 'claimer', actor, privateKey, options);
};

const unlinkClaimrewardAuth = async (actor, privateKey, options) => {
    return await unlinkAuth('claimrewards', actor, privateKey, options);
};

const addClaimerAuth = async (actor, pvtkey, opts) => {
    opts = Object.assign({ ignoreError: /same\ as\ old/ }, opts || {});
    const keys = await generateKeystore();
    const keystore = {
        publickey: keys.publicKeys.active,
        privatekey: keys.privateKeys.active,
    };
    return {
        keyTrx: await updateClaimerKey(keystore.publickey, actor, pvtkey, opts),
        authTrx: await linkClaimrewardAuth(actor, pvtkey, opts), keystore,
    };
};

const delClaimerAuth = async (actor, privateKey, opts = {}) => {
    opts = Object.assign({
        ignoreError: /non\-existent|failed\ to\ retrieve/i
    }, opts || {});
    return {
        authTrx: await unlinkClaimrewardAuth(actor, privateKey, opts) || null,
        keyTrx: await deleteClaimerKey(actor, privateKey, opts) || null,
    };
};

const makePermission = (actor, pms) => {
    return { weight: 1, permission: sushitrain.makeAuthorization(actor, pms) };
};

const ensureAuth = async (acc, publicKey, privateKey, options) => {
    options = options || {};
    if (!publicKey) {
        const key = await getKeys(acc, 'active');
        utilitas.assert(key, 'Error finding public keys to auth.', 500);
        if (!options.force) {
            let authed = true;
            for (let p of pmsNeeded) {
                let found = false;
                for (let a of key.authorization) {
                    if (a.permission.actor === p) { found = true; continue; }
                }
                if (!found) { authed = false; break; }
            }
            if (authed) { return key; }
        }
        publicKey = key.key;
    }
    return await updateAuth('active', publicKey, pmsNeeded.map((x) => {
        return makePermission(x, 'eosio.code');
    }), acc, privateKey, options);
};

module.exports = {
    bindingPrice,
    defaultCpuQuant,
    defaultNetQuant,
    defaultRamQuant,
    addClaimerAuth,
    assertName,
    assertNewName,
    assertNotPreservedName,
    bind,
    buyRam,
    create,
    delClaimerAuth,
    deleteAuth,
    deleteClaimerKey,
    ensureAuth,
    generateKeystore,
    getBalance,
    getByName,
    getKeys,
    getRegisterPrice,
    linkAuth,
    linkClaimrewardAuth,
    unlinkAuth,
    unlinkClaimrewardAuth,
    updateActiveKey,
    updateAuth,
    updateClaimerKey,
    updateOwnerKey,
};

const eosNameVerify = require('eos-name-verify');
const { utilitas } = require('utilitas');
const { Keygen } = require('eosjs-keygen');
const sushitrain = require('./sushitrain');
const finance = require('./finance');
const config = require('./config');
const mixin = require('./mixin');
