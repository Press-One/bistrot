'use strict';

global._prsAtm = Object.assign(require('./package.json'), {
    // testNetRpcApi: 'http://51.255.133.170:8888',
    testNetChainApi: 'https://elm-sushibar.ngrok.io',
    testNetOfficialMixin: '14da6c0c-0cbf-483c-987a-c44477dcad1b',
});

module.exports = Object.assign(require('utilitas'), {
    elliptic: require('elliptic'),
    eos: require('eosjs'),
    eosEcc: require('eosjs-ecc'),
    eosKeygen: require('eosjs-keygen'),
    eosNameVerify: require('eos-name-verify'),
    ethereumUtil: require('ethereumjs-util'),
    keythereum: require('keythereum-pure-js'),
    secp256k1: require('secp256k1'),
}, {
    account: require('./lib/account'),
    atm: require('./lib/atm'),
    config: require('./lib/config'),
    crypto: require('./lib/crypto'),
    etc: require('./lib/etc'),
    finance: require('./lib/finance'),
    keychain: require('./lib/keychain'),
    mixin: require('./lib/mixin'),
    pacman: require('./lib/pacman'),
    producer: require('./lib/producer'),
    prsc: require('./lib/prsc'),
    sushibar: require('./lib/sushibar'),
    sushitrain: require('./lib/sushitrain'),
    system: require('./lib/system'),
    table: require('./lib/table'),
    wallet: require('./lib/wallet'),
});
