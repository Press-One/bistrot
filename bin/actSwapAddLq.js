'use strict';

const payreq = require('./actSwapPay');
const { exchange, finance } = require('..');

const func = async (argv) => {
    const resp = await exchange.addLiquid(
        argv.pvtkey, argv.account, argv.cura, argv.amount,
        argv.curb, argv.email, argv.memo, { dryrun: argv.dryrun }
    );
    // console.log(resp); // @keep this line for debug
    return argv.dryrun ? resp : await payreq.func(argv);
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Add Liquid to Swap Pools',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --cura     CURRENCY-A to be added            [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx of CURRENCY-A [NUMBER  / REQUIRED]',
        '    --curb     CURRENCY-B to be added            [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    --dryrun   Evaluate a swap without executing [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Use `SwapPool` to get pools that available to add liquid.  |',
        '    | 2. Amount of CURRENCY-B will be calculated automatically.     |',
        '    | 3. After successful execution, you will get `2` URLs.         |',
        '    | 4. Open these URLs in your browser.                           |',
        '    | 5. Scan the QR codes with Mixin to complete the payment.      |',
        '    | 6. You have to complete the payment within `'
        + `${finance.transferTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 7. SCANNING AN EXPIRED QR CODES WILL RESULT IN LOST MONEY.    |',
        '    | 8. Only `1` swap related transaction is allowed at a time.    |',
        '    | 9. Finish, `SwapCancel` or timeout a current trx before exec. |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'Estimating a Liquid Adding Plan (dryrun)',
            args: {
                account: true,
                cura: 'COB',
                amount: true,
                curb: 'CNB',
                keystore: true,
                email: true,
                dryrun: null,
            },
        },
        {
            title: 'Adding Liquid',
            args: {
                account: true,
                cura: 'COB',
                amount: true,
                curb: 'CNB',
                keystore: true,
                email: true,
            },
        }
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 19 }, 1: { width: 64 } } },
        },
    },
};
