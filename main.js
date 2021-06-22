'use strict';

global._prsAtm = Object.assign(require('./package.json'), {
    testNetRpcApi: 'http://51.255.133.170:8888',
    testNetChainApi: 'https://elm-sushibar.ngrok.io',
    testNetOfficialMixin: '14da6c0c-0cbf-483c-987a-c44477dcad1b',
});

module.exports = Object.assign(require('sushitrain'), {
    atm: require('./lib/atm'),
    config: require('./lib/config'),
    etc: require('./lib/etc'),
    keychain: require('./lib/keychain'),
    system: require('./lib/system'),
    wallet: require('./lib/wallet'),
});
