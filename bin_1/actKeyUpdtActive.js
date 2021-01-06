'use strict';

const { account } = require('..');

const func = async (argv) => {
    return await account.updateActiveKey(
        argv.npubkey, argv.account, argv.pvtkey
    );
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Update Active Key',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --npubkey  New `active` public key           [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. You need `owner key permission` to execute this command.   |',
        '    | 2. Use `AccountAuth` to reauthorize after you update keys.    |',
        '    └---------------------------------------------------------------┘',
        '    ┌- DANGER ------------------------------------------------------┐',
        '    | ⚠ Incorrect use will result in `loss of permissions`.         |',
        '    | ⚠ `DO NOT` do this unless you know what you are doing.        |',
        '    | ⚠ We are not responsible for any loss of permissions due to   |',
        '    |   the mistake of updating keys.                               |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            npubkey: true,
            keystore: true,
        }
    },
};
