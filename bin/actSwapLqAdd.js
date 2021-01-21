'use strict';

const { exchange, finance } = require('..');

const func = async (argv) => {
    const resp = await exchange.addLiquid(
        argv.pvtkey, argv.account, argv.cura, argv.amount,
        argv.curb, argv.email, argv.memo, { dryrun: argv.dryrun }
    );
    if (!argv.json && resp && resp.payment_request) {
        let paymentUrls = [];
        resp.payment_request.mixin_trace_id
            = resp.payment_request.mixin_trace_id.join('\n');
        resp.payment_request.timestamp_received
            = resp.payment_request.timestamp_received.toISOString();
        resp.payment_request.payment_timeout
            = resp.payment_request.payment_timeout.toISOString();
        Object.values(resp.payment_request.payment_request).map(x => {
            paymentUrls.push(x.payment_url);
        });
        if (paymentUrls.length) {
            console.log('\nOpen these URLs in your browser:\n\n'
                + `${paymentUrls.join('\n\n')}\n`);
        }
    }
    return resp;
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
        '    | 3. You have to complete the payment within `'
        + `${finance.transferTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 4. SCANNING AN EXPIRED QR CODES WILL RESULT IN LOST MONEY.    |',
        '    | 5. Only `1` swap related transaction is allowed at a time.    |',
        '    | 6. Finish, `SwapCancel` or timeout a current trx before exec. |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Pay via QR code ---------------------------------------------┐',
        '    | 1. After successful execution, you will get `2` URLs.         |',
        '    | 2. Open these URLs in your browser.                           |',
        '    | 3. Scan the QR codes with Mixin to complete the payment.      |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Pay via Message ---------------------------------------------┐',
        '    | 1. System will also send the URLs to your bound Mixin-Account.|',
        '    | 2. Simply click on the URLs in Mixin to complete the payment. |',
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
    render: { table: { KeyValue: true } },
};
