'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    return await account.createAccount(
        argv.account, argv.pvtkey, argv.naccount, argv.npubkey
    );
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Create an Account',
    help: [
        "    --action   Set as 'createaccount'            [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --naccount New PRESS.one account             [STRING  / REQUIRED]',
        '    --npubkey  Public key of the new account     [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 0. DO NOT USE THIS FEATURE CURRENTLY.                         | ',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=createaccount \\',
        '              --account=ABCDE \\',
        '              --naccount=FIJKL \\',
        '              --npubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \\',
        '              --keystore=keystore.json',
    ],
    hide: true,
};
