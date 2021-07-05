'use strict';

const permissions = ['owner', 'active'];

const get = async (account, prmsn, options) => {
    options = options || {};
    const { filename, config } = await preference.getUserConfig();
    for (let i in config.keystores || {}) {
        if ((!account || utilitas.insensitiveCompare(
            config.keystores[i].account, account
        )) && (!prmsn || utilitas.insensitiveCompare(
            config.keystores[i].permission, prmsn
        ))) {
            if (options.unlock) {
                Object.assign(
                    config.keystores[i].keystore, wallet.recoverPrivateKey(
                        config.keystores[i].password || options.password,
                        config.keystores[i].keystore
                    )
                );
            }
        } else { delete config.keystores[i]; }
    }
    const count = Object.keys(config.keystores || {}).length;
    if (options.assert || options.unique) {
        utilitas.assert(count, 'Keystore not found.', 400);
    }
    if (options.unique) {
        utilitas.assert(count === 1, 'Keystore is not unique.', 400);
    }
    return { filename, config };
};

const set = async (acc, permission, keystore, password, memo, opts) => {
    opts = opts || {};
    account.assertName(acc);
    utilitas.assert(keystore, 'Keystore is required.', 400);
    utilitas.assert(password, 'Password is required.', 400);
    utilitas.assert(
        permissions.includes(permission), 'Invalid permission.', 400
    );
    if (utilitas.isString(keystore)) {
        try { keystore = JSON.parse(keystore); } catch (e) {
            utilitas.throwError('Invalid keystore file.', 400);
        }
    }
    wallet.recoverPrivateKey(password, keystore);
    const { config } = await preference.getUserConfig();
    config.keystores = config.keystores || {};
    config.keystores[`${acc}-${permission}`] = Object.assign({
        account: acc, permission, keystore, memo: utilitas.trim(memo)
    }, opts.savePassword ? { password } : {});
    return await preference.set(
        config, { overwrite: true, allowed: ['keystores'] }
    );
};

const del = async (account, permission) => {
    utilitas.assert(account, 'Account is required.', 400);
    utilitas.assert(permission, 'Permission is required.', 400);
    const { config } = await preference.getUserConfig();
    config.keystores = config.keystores || {};
    try { delete config.keystores[`${account}-${permission}`]; } catch (e) { }
    return await preference.set(
        config, { overwrite: true, allowed: ['keystores'] }
    );
};

module.exports = {
    set,
    get,
    del,
};

const { utilitas } = require('utilitas');
const preference = require('./preference');
const account = require('./account');
const wallet = require('./wallet');
