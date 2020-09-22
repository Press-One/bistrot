'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    return await account.updateActiveKey(
        argv.npubkey, argv.account, argv.pvtkey
    );
};

module.exports = {
    pubkey: true,
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
        '    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |',
        '    └---------------------------------------------------------------┘',
        '    ┌- DANGER ------------------------------------------------------┐',
        '    | ⚠ Incorrect use will result in `loss of permissions`.         |',
        '    | ⚠ `DO NOT` do this unless you know what you are doing.        |',
        '    | ⚠ We are not responsible for any loss of permissions due to   |',
        '    |   the mistake of updating keys.                               |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm activekey \\',
        '              --account=ABCDE \\',
        '              --npubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \\',
        '              --keystore=keystore.json',
    ],
};
