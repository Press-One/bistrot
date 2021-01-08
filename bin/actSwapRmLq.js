'use strict';

const { exchange } = require('..');

const func = async (argv) => {
    return await exchange.rmLiquid(
        argv.pvtkey, argv.account, argv.cura, argv.curb,
        argv.amount, argv.email, argv.memo, { mixinAccount: argv.mixin }
    );
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Remove Liquid to Swap Pools',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --cura     CURRENCY-A to be removed          [STRING  / REQUIRED]',
        '    --curb     CURRENCY-B to be removed          [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx of POOL-TOKEN [NUMBER  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Use `SwapPool` to get pools that available to rm liquid.   |',
        '    | 2. Bind your Mixin-Account to PRS-Account before rm liquid.   |',
        '    | 3. You can check your bound Mixin-Account with `account` cmd. |',
        '    | 4. Only `1` swap related transaction is allowed at a time.    |',
        '    | 5. Finish, `SwapCancel` or timeout a current trx before exec. |',
        '    | 6. If any issue, try to run `AccountAuth` command to fix it.  |',
        '    └---------------------------------------------------------------┘',
        '    ┌- WARNING -----------------------------------------------------┐',
        '    | ⚠ Ensure to double-check bound Mixin-Account before apply for |',
        '    |   refund. Wrong accounts will cause property loss.            |',
        '    | ⚠ We are not responsible for any loss of property due to the  |',
        '    |   mistake of withdraw accounts.                               |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            cura: 'COB',
            curb: 'CNB',
            amount: true,
            keystore: true,
            email: true,
        },
    },
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 19 }, 1: { width: 64 } } },
        },
    },
};
