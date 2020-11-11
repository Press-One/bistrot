'use strict';

const { utilitas, storage, account } = require('sushitrain');
const wallet = require('./wallet');

const getUserConfig = storage.getConfig;
const promisions = ['owner', 'active'];
const allowed = ['debug', 'secret', 'speedTest'];

const defaultConfig = {

    debug: false,

    secret: false,

    speedTest: false,

    ipfsApi: 'http://127.0.0.1:5001',

    chainApi: [
        'https://prs-bp1.press.one',
        'https://prs-bp2.press.one',
        'https://prs-bp3.press.one',
    ],

};

const get = async (args) => {
    const { config } = await getUserConfig();
    const result = utilitas.mergeAtoB(utilitas.mergeAtoB(
        args || global.chainConfig || {}, config), defaultConfig);
    return result;
};

const set = async (input, options) => {
    options = options || {};
    const data = {};
    for (let i in input || {}) {
        utilitas.assert((options.allowed || allowed).includes(i),
            `'${i}' is not allowed to configure.`, 400);
        data[i] = input[i];
    }
    return storage.setConfig(data, options);
};

const setKeystore = async (acc, promision, keystore, password, note, opts) => {
    opts = opts || {};
    account.assertName(acc);
    utilitas.assert(keystore, 'Keystore is required.', 400);
    utilitas.assert(password, 'Password is required.', 400);
    utilitas.assert(promisions.includes(promision), 'Invalid promision.', 400);
    if (utilitas.isString(keystore)) {
        try { keystore = JSON.parse(keystore); } catch (e) {
            utilitas.throwError('Invalid keystore file.', 400);
        }
    }
    wallet.recoverPrivateKey(password, keystore);
    const { config } = await getUserConfig();
    config.keystores = config.keystores || {};
    config.keystores[`${acc}-${promision}`] = Object.assign({
        promision, keystore, comment: utilitas.trim(note)
    }, opts.savePassword ? { password } : {});
    return await set(config, { overwrite: true, allowed: ['keystores'] });
};

Object.assign(get, { allowed, getUserConfig, set, setKeystore });

module.exports = get;
