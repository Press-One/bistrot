'use strict';

const { account } = require('..');

const func = async (argv) => {
    return await account.create(
        argv.account, argv.pvtkey, argv.name, argv.npubkey
    );
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Create an Account',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --name     New PRESS.one account             [STRING  / REQUIRED]',
        '    --npubkey  Public key of the new account     [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. DO NOT USE THIS FEATURE CURRENTLY.                         | ',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            name: true,
            npubkey: true,
            keystore: true,
        }
    },
    hide: true,
};
