'use strict';

const get = async (address, options) => {
    options = options || {};
    const { filename, config } = await preference.getUserConfig();
    for (let i in config.keystores || {}) {
        if (!address || utilitas.insensitiveCompare(i, address)) {
            if (options.unlock) {
                Object.assign(
                    config.keystores[i].keystore, crypto.recoverPrivateKey(
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

const set = async (address, keystore, password, memo, opts) => {
    opts = opts || {};
    utilitas.assert(address, 'Address is required.', 400);
    utilitas.assert(keystore, 'Keystore is required.', 400);
    utilitas.assert(password, 'Password is required.', 400);
    if (utilitas.isString(keystore)) {
        try { keystore = JSON.parse(keystore); } catch (e) {
            utilitas.throwError('Invalid keystore file.', 400);
        }
    }
    crypto.recoverPrivateKey(password, keystore);
    const { config } = await preference.getUserConfig();
    config.keystores = config.keystores || {};
    config.keystores[address] = Object.assign({
        keystore, memo: utilitas.trim(memo)
    }, opts.savePassword ? { password } : {});
    return await preference.set(
        config, { overwrite: true, allowed: ['keystores'] }
    );
};

const del = async (address) => {
    utilitas.assert(address, 'Address is required.', 400);
    const { config } = await preference.getUserConfig();
    config.keystores = config.keystores || {};
    try { delete config.keystores[address]; } catch (e) { }
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
const crypto = require('./crypto');
