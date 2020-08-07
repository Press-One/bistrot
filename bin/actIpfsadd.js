'use strict';

const yonJigenPoketto = require('../lib/yonJigenPoketto');

const func = async (argv) => {
    return await yonJigenPoketto.addReq(argv.file, argv.account, argv.pubkey, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'IPFS daemon beta!',
    help: ['account', 'pubkey', 'pvtkey'],
};
