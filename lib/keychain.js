'use strict';

const { utilitas, account } = require('sushitrain');
const config = require('./config');
const wallet = require('./wallet');

const permissions = ['owner', 'active'];

const get = async (account, prmsn, options) => {
    options = options || {};
    const { filename, config: conf } = await config.getUserConfig();
    let keystores = {};
    for (let i in conf.keystores || {}) {
        if ((!account || utilitas.insensitiveCompare(
            conf.keystores[i].account, account
        )) && (!prmsn || utilitas.insensitiveCompare(
            conf.keystores[i].permission, prmsn
        ))) {
            if (options.unlock) {
                Object.assign(
                    conf.keystores[i].keystore, wallet.recoverPrivateKey(
                        conf.keystores[i].password || options.password,
                        conf.keystores[i].keystore
                    )
                );
            }
        } else { delete conf.keystores[i]; }
    }
    const count = Object.keys(conf.keystores).length;
    if (options.assert || options.unique) {
        utilitas.assert(count, 'Keystore not found.', 400);
    }
    if (options.unique) {
        utilitas.assert(count === 1, 'Keystore is not unique.', 400);
    }
    return { filename, config: conf };
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
    const { config: conf } = await config.getUserConfig();
    conf.keystores = conf.keystores || {};
    conf.keystores[`${acc}-${permission}`] = Object.assign({
        account: acc, permission, keystore, memo: utilitas.trim(memo)
    }, opts.savePassword ? { password } : {});
    return await config.set(conf, { overwrite: true, allowed: ['keystores'] });
};

const del = async (account, permission) => {
    utilitas.assert(account, 'Account is required.', 400);
    utilitas.assert(permission, 'Permission is required.', 400);
    const { config: conf } = await config.getUserConfig();
    conf.keystores = conf.keystores || {};
    try { delete conf.keystores[`${account}-${permission}`]; } catch (e) { }
    return await config.set(conf, { overwrite: true, allowed: ['keystores'] });
};

module.exports = {
    set,
    get,
    del,
};
