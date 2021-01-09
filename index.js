'use strict';

module.exports = Object.assign(require('sushitrain'), {
    atm: require('./lib/atm'),
    ballot: require('./lib/ballot'),
    chain: require('./lib/chain'),
    config: require('./lib/config'),
    etc: require('./lib/etc'),
    exchange: require('./lib/exchange'),
    keychain: require('./lib/keychain'),
    statement: require('./lib/statement'),
    system: require('./lib/system'),
    wallet: require('./lib/wallet'),
});
