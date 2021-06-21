'use strict';

module.exports = Object.assign(require('utilitas'), {
    elliptic: require('elliptic'),
    eos: require('eosjs'),
    eosEcc: require('eosjs-ecc'),
    eosKeos: require('eosjs-keos'),
    eosKeygen: require('eosjs-keygen'),
    eosNameVerify: require('eos-name-verify'),
    ethereumUtil: require('ethereumjs-util'),
    keythereum: require('keythereum-pure-js'),
    secp256k1: require('secp256k1'),
}, {
    account: require('./lib/account'),
    config: require('./lib/config'),
    crypto: require('./lib/crypto'),
    finance: require('./lib/finance'),
    mixin: require('./lib/mixin'),
    pacman: require('./lib/pacman'),
    prsc: require('./lib/prsc'),
    sushibar: require('./lib/sushibar'),
    sushitrain: require('./lib/sushitrain'),
    table: require('./lib/table'),
});
