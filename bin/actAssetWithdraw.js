'use strict';

const { finance, atm } = require('..');

const func = async (argv) => {
    return await atm.withdraw(
        argv.pvtkey, argv.account, argv.email, argv.amount,
        argv.memo, { mixinAccount: argv.mixin }
    );
};

module.exports = {
    hide: true,
    pvtkey: true,
    func,
    name: 'Withdrawal',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [NUMBER  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Bind your Mixin-Account to PRS-Account before withdrawal.  |',
        '    | 2. You can check your bound Mixin-Account with `account` cmd. |',
        '    | 3. Sum greater than ' + finance.maxWithdrawAmount
        + ' in last 24H requires manual review.| ',
        '    | 4. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 5. Finish, `AssetCancel` or timeout a trx before request.     |',
        '    | 6. If any issue, try to run `AccountAuth` command to fix it.  |',
        '    └---------------------------------------------------------------┘',
        '    ┌- WARNING -----------------------------------------------------┐',
        '    | ⚠ Ensure to double-check bound Mixin-Account before withdraw. |',
        '    |   Wrong accounts will cause property loss.                    |',
        '    | ⚠ We are not responsible for any loss of property due to the  |',
        '    |   mistake of withdraw accounts.                               |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            amount: true,
            keystore: true,
            email: true,
        },
    },
};
