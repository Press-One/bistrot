'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.cancelPaymentRequest(argv.pvtkey, argv.account, argv.memo);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Cancel a depositing payment request',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 2. Cancel a current trx by this cmd before issuing a new one. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm cancel --account=ABCDE --keystore=keystore.json',
    ],
};
