'use strict';

const defaultWallet = 'default';
const keyTypeK1 = 'K1';
const keyTypeR1 = 'R1';
const keyTypes = [keyTypeK1, keyTypeR1];

const getRpcUrl = async (path, options) => {
    options = options || {};
    const url = config().speedTest ? await network.pickFastestHost(
        config().keosApi, { debug: config().debug }
    ) : utilitas.getConfigFromStringOrArray(config().keosApi);
    utilitas.assert(url, 'Keosd RPC api root has not been configured', 500);
    return `${url}${path ? `${options.apiRoot || '/v1/wallet/'}${path}` : ''}`;
};

const rpcRequest = async (method, api, body, options) => {
    options = options || {};
    method = utilitas.trim(method, { case: 'UP' });
    const resp = await fetch(await getRpcUrl(api, options), {
        method,
        body: method === 'GET' ? null : JSON.stringify(body || {}),
        headers: { 'Content-Type': 'application/json' }, ...options
    }).then(x => x.json());
    if (!resp || resp.error) {
        const err = resp && resp.error || {};
        let message = err.what || err.name || 'Error querying Keosd RPC api.';
        let extension = {};
        Object.assign(extension, err.code ? { code: err.code } : {}, err.details
            ? { [options.throwDetails ? 'details' : 'internal']: err.details }
            : {});
        utilitas.throwError(message, resp.code || 500, extension);
    }
    return resp;
};

const assertWalletName = (name) => {
    name = utilitas.trim(name || defaultWallet);
    utilitas.assert(name, 'Invalid wallet name.', 400);
    return name;
};

const assertPassword = (password) => {
    utilitas.assert(password, `Password is required.`, 400);
};

const assertPublicKey = (publicKey) => {
    utilitas.assert(publicKey, `Public key is required.`, 400);
};

const getSupportedApis = async () => {
    return (await rpcRequest('GET', 'get_supported_apis', null,
        { apiRoot: '/v1/node/' })).apis;
};

const createWallet = async (walletName) => {
    walletName = assertWalletName(walletName);
    return { password: await rpcRequest('POST', 'create', walletName) };
};

const listWallet = async () => {
    return await rpcRequest('GET', 'list_wallets');
};

const unlock = async (walletName, password, options) => {
    options = options || {};
    walletName = assertWalletName(walletName);
    if (options.skipUnlock) { return { walletName }; }
    assertPassword(password);
    let result = {};
    try {
        result = await rpcRequest('POST', 'unlock', [walletName, password]);
    } catch (err) { utilitas.assert(err.code === 3120007, err.message, 400); }
    return { walletName, result };
};

const lock = async (walletName) => {
    return await rpcRequest('POST', 'lock', assertWalletName(walletName));
};

const lockAll = async () => {
    return await rpcRequest('POST', 'lock_all');
};

const createKey = async (walletName, password, options) => {
    options = options || {};
    var { walletName } = await unlock(walletName, password, options);
    const type = options.keyType || keyTypeK1;
    utilitas.assert(keyTypes.includes(type), `Invalid key type: ${type}.`, 400);
    const resp = await rpcRequest('POST', 'create_key', [walletName, type]);
    return { publicKey: resp };
};

const getPublicKeys = async (walletName, password, options) => {
    await unlock(walletName, password, options);
    return await rpcRequest('GET', 'get_public_keys');
};

const importKey = async (walletName, password, privateKey, options) => {
    var { walletName } = await unlock(walletName, password, options);
    utilitas.assert(privateKey, `Private key is required.`, 400);
    return await rpcRequest('POST', 'import_key', [walletName, privateKey]);
};

const stop = async () => {
    return await rpcRequest('POST', 'stop', null, { apiRoot: '/v1/keosd/' });
};

const openWallet = async (walletName) => {
    return await rpcRequest('POST', 'open', assertWalletName(walletName));
};

const listKeys = async (walletName, password, options) => {
    var { walletName } = await unlock(walletName, password, options);
    return await rpcRequest('POST', 'list_keys', [walletName, password]);
};

const removeKey = async (walletName, password, publicKey, options) => {
    var { walletName } = await unlock(walletName, password, options);
    assertPublicKey(publicKey);
    return await rpcRequest('POST', 'remove_key',
        [walletName, password, publicKey]);
};

const setTimeout = async (second = 60) => {
    return await rpcRequest('POST', 'set_timeout', ~~second || 1);
};

const signDigest = async (walletName, password, data, publicKey, options) => {
    var { walletName } = await unlock(walletName, password, options);
    assertPublicKey(publicKey);

    const { encryption } = require('utilitas');
    data = encryption.sha256(data);
    console.log('PRC hash: ', data);
    return await rpcRequest('POST', 'sign_digest', [data, publicKey]);
};

const signTransaction = async (data, pubKey) => {
    return await rpcRequest('POST', 'sign_transaction', [data, pubKey]);
};

module.exports = {
    createKey,
    createWallet,
    getPublicKeys,
    getRpcUrl,
    getSupportedApis,
    importKey,
    listWallet,
    lock,
    lockAll,
    rpcRequest,
    unlock,
    stop,
    openWallet,
    listKeys,
    removeKey,
    setTimeout,
    signDigest,
    signTransaction,
};

const { utilitas } = require('utilitas');
const config = require('./config');
const fetch = require('node-fetch');
