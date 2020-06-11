'use strict';

const { } = require('../index');

const func = async (argv) => {
    const pResult = await atm.cancelPaymentRequest(
        argv.pvtkey,
        argv.account,
        argv.memo
    );
    return randerResult(pResult, defTblConf);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Cancel a depositing payment request',
    help: [
        "    --action   Set as 'cancel'                   [STRING  / REQUIRED]",
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
        '    $ prs-atm --action=cancel \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
    ],
};
