'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.authOfficialReward(argv.account, argv.pvtkey);
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Auth PRESS.one official node to claim rewards daily automatically',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO     |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
