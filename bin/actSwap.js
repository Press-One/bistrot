'use strict';

const { exchange, finance } = require('..');

const func = async (argv) => {
    const resp = await exchange.swapToken(
        argv.pvtkey, argv.account, argv.from, argv.amount, argv.to,
        argv.slippage, argv.email, argv.memo, { dryrun: argv.dryrun }
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
    name: 'Swap tokens',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --from     From token symbol                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx of FROM-TOKEN [NUMBER  / REQUIRED]',
        '    --to       To token symbol                   [STRING  / REQUIRED]',
        '    --slippage Percentage of slippage            [NUMBER  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    --dryrun   Evaluate a swap without executing [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Use `SwapPool` to get all pools that available to swap.    |',
        '    | 2. Default `slippage` is `5`, which means a 5% slippage.      |',
        '    | 3. You have to complete the payment within `'
        + `${finance.transferTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 4. SCANNING AN EXPIRED QR CODE WILL RESULT IN LOST MONEY.     |',
        '    | 5. Only `1` swap transaction is allowed at a time.            |',
        '    | 6. Finish, `SwapCancel` or timeout a current trx before swap. |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Pay via QR code ---------------------------------------------┐',
        '    | 1. After successful execution, you will get a URL.            |',
        '    | 2. Open this URL in your browser.                             |',
        '    | 3. Scan the QR code with Mixin to complete the payment.       |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Pay via Message ---------------------------------------------┐',
        '    | 1. System will also send the URL to your bound Mixin-Account. |',
        '    | 2. Simply click on the URL in Mixin to complete the payment.  |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'Estimating a Swap Deal (dryrun)',
            args: {
                account: true,
                from: 'COB',
                amount: true,
                to: 'CNB',
                keystore: true,
                email: true,
                dryrun: null,
            },
        },
        {
            title: 'Swap',
            args: {
                account: true,
                from: 'COB',
                amount: true,
                to: 'CNB',
                keystore: true,
                email: true,
            },
        }
    ],
    render: { table: { KeyValue: true } },
};
