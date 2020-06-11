'use strict';

const { } = require('../index');

const func = async (argv) => {
    const resp = await atm.updateAuth(
        argv.account,
        argv.pubkey,
        argv.pvtkey,
    );
    return resp;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Update Authorization',
    help: [
        "    --action   Set as 'auth'                     [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |',
        '    | 2. You have to execute this cmd to activate your new account. |',
        '    | 3. This command only needs to be executed one time.           |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=auth \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
    ],
};
