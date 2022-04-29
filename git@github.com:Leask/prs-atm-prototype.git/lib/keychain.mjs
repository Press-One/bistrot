import { getUserConfig, set as _set } from './preference.mjs';
import { recoverPrivateKey, unifyAddress } from './crypto.mjs';
import { utilitas } from 'utilitas';

const get = async (add, options) => {
    const { filename, config } = await getUserConfig();
    for (let i in config.keystores || {}) {
        if (!add || (unifyAddress(i) === unifyAddress(add))) {
            if (options?.unlock) {
                Object.assign(
                    config.keystores[i].keystore, recoverPrivateKey(
                        config.keystores[i].password || options?.password,
                        config.keystores[i].keystore
                    )
                );
            }
        } else { delete config.keystores[i]; }
    }
    const count = Object.keys(config.keystores || {}).length;
    if (options?.assert || options?.unique) {
        assert(count, 'Keystore not found.', 400);
    }
    if (options?.unique) {
        assert(count === 1, 'Keystore is not unique.', 400);
    }
    return { filename, config };
};

const set = async (address, keystore, password, memo, options) => {
    address = unifyAddress(address);
    assert(address, 'Address is required.', 400);
    assert(keystore, 'Keystore is required.', 400);
    assert(password, 'Password is required.', 400);
    if (String.isString(keystore)) {
        try { keystore = JSON.parse(keystore); } catch (e) {
            utilitas.throwError('Invalid keystore file.', 400);
        }
    }
    recoverPrivateKey(password, keystore);
    const { config } = await getUserConfig();
    config.keystores = config.keystores || {};
    config.keystores[address] = Object.assign({
        keystore, memo: utilitas.trim(memo)
    }, options?.savePassword ? { password } : {});
    return await _set(config, { overwrite: true, allowed: ['keystores'] });
};

const del = async (address) => {
    address = unifyAddress(address);
    assert(address, 'Address is required.', 400);
    const { config } = await getUserConfig();
    config.keystores = config.keystores || {};
    try { delete config.keystores[address]; } catch (e) { }
    return await _set(config, { overwrite: true, allowed: ['keystores'] });
};

export {
    set,
    get,
    del,
};
