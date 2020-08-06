'use strict';

const mission = require('../lib/yjpMission');

const func = async (argv) => {
    await mission.up(argv.account, argv.pubkey, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'IPFS daemon beta!',
    help: ['account', 'pubkey', 'pvtkey'],
};
