'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.refund(argv.account, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Transfer the PRS in the refund to the balance',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 2. Applicable when REFUND_AVAILABLE shows in balance output.  |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm refund --account=ABCDE --keystore=keystore.json',
    ],
};
