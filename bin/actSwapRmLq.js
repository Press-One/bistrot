'use strict';

const { atm, exchange } = require('..');

const func = async (argv) => {
    try {
        const resp = await atm.updateAuth(argv.account, null, argv.pvtkey);
        // console.log(resp); // keep this line for debug
    } catch (e) { }
    return await exchange.rmLiquid(
        argv.pvtkey, argv.account, argv.cura, argv.curb, argv.amount,
        argv['mx-id'], argv['mx-num'], argv.email, argv.memo,
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
        '    --mx-id    Mixin user id (UUID)              [STRING  / OPTIONAL]',
        '    --mx-num   Mixin user number                 [NUMBER  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Use `SwapPool` to get pools that available to rm liquid.   |',
        '    | 2. One of `mx-num` or `mx-id` must be provided.               |',
        '    | 3. Only `1` swap related transaction is allowed at a time.    |',
        '    | 4. Finish, `SwapCancel` or timeout a current trx before exec. |',
        '    | 5. If any issue, try to run `AccountAuth` command to fix it.  |',
        '    └---------------------------------------------------------------┘',
        '    ┌- WARNING -----------------------------------------------------┐',
        '    | ⚠ Ensure to double-check `mx-num` or `mx-id` before apply for |',
        '    |   refund. Wrong accounts will cause property loss.            |',
        '    | ⚠ We are not responsible for any loss of property due to the  |',
        '    |   mistake of withdraw accounts.                               |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'remove liquid and refund to Mixin number',
            args: {
                account: true,
                cura: 'COB',
                curb: 'CNB',
                amount: true,
                'mx-num': true,
                keystore: true,
                email: true,
            },
        },
        {
            title: 'remove liquid and refund to Mixin user id',
            args: {
                account: true,
                cura: 'COB',
                curb: 'CNB',
                amount: true,
                'mx-id': true,
                keystore: true,
                email: true,
            },
        },
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 19 }, 1: { width: 64 } } },
        },
    },
};
