'use strict';

const { account } = require('..');

const func = async (argv) => {
    return await account.updateOwnerKey(
        argv.npubkey, argv.account, argv.pvtkey
    );
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Update Owner Key',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --npubkey  New `owner` public key            [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |',
        '    | 2. You need `owner key permission` to execute this command.   |',
        '    | 3. Use `auth` to reauthorize after you update your keys.      |',
        '    └---------------------------------------------------------------┘',
        '    ┌- DANGER ------------------------------------------------------┐',
        '    | ⚠ Incorrect use will result in `loss of permissions`.         |',
        '    | ⚠ `DO NOT` do this unless you know what you are doing.        |',
        '    | ⚠ We are not responsible for any loss of permissions due to   |',
        '    |   the mistake of updating keys.                               |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm ownerkey \\',
        '              --account=ABCDE \\',
        '              --npubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \\',
        '              --keystore=keystore.json',
    ],
};
