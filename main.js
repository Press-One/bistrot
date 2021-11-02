'use strict';

let runningInBrowser = false;
try { runningInBrowser = !!window; } catch (e) { }
if (runningInBrowser) { global = window; }

global._bistrot = Object.assign(require('./package.json'), {
    // testNetRpcApi: 'http://51.255.133.170:8888',
    // testNetChainApi: 'https://elm-sushibar.ngrok.io',
    testNetOfficialMixin: '14da6c0c-0cbf-483c-987a-c44477dcad1b',
    runningInBrowser,
});

const modExp = Object.assign(require('utilitas'), {
    // need to updated @LeaskH
    elliptic: require('elliptic'),
    ethereumUtil: require('ethereumjs-util'),
    keythereum: require('keythereum-pure-js'),
    secp256k1: require('secp256k1'),
}, {
    account: require('./lib/account'),
    config: require('./lib/config'),
    crypto: require('./lib/crypto'),
    erc20: require('./lib/erc20'),
    etc: require('./lib/etc'),
    finance: require('./lib/finance'),
    keychain: require('./lib/keychain'),
    mixin: require('./lib/mixin'),
    pacman: require('./lib/pacman'),
    preference: require('./lib/preference'),
    quorum: require('./lib/quorum'),
    rumsc: require('./lib/rumsc'),
    sushibar: require('./lib/sushibar'),
    system: require('./lib/system'),
    wasm_exec: require('./lib/wasm_exec'),
});

if (runningInBrowser) {
    global.bistrot = modExp;
    console.log('[BISTROT](https://github.com/Press-One/bistrot) is ready! 🍻');
} else { module.exports = modExp; }
