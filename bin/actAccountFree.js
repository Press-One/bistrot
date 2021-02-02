'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.openFreeAccount(argv.pubkey, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Open a Free Account',
    help: [
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. After successful execution, you will get a new account.    |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            keystore: true,
        }
    },
};
