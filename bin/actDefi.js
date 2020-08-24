'use strict';

const defi = require('../lib/defi.js');

const func = async (argv) => {
    await defi.watch(argv.account, argv.pubkey, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'DeFi daemon beta!',
    help: ['account', 'pubkey', 'pvtkey'],
};
