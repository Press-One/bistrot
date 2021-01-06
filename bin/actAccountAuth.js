'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.updateAuth(argv.account, /* argv.pubkey */null, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Update Authorization',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   Active public key (NOT owner key) [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Remember to authorize your ACTIVE KEY ONLY, NOT OWNER KEY. |',
        '    | 2. You have to execute this cmd to activate your new account. |',
        '    | 3. Normally, this command only needs to be executed 1 time.   |',
        '    | 4. Reauthorize after you update your active or owner keys.    |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
