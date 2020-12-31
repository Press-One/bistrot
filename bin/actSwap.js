'use strict';

const payreq = require('./actSwappay');
const { exchange, finance } = require('..');

const func = async (argv) => {
    const resp = await exchange.swapToken(
        argv.pvtkey, argv.account, argv.from, argv.amount, argv.to,
        argv.slippage, argv.email, argv.memo, { dryrun: argv.dryrun }
    );
    // console.log(resp); // @keep this line for debug
    return argv.dryrun ? resp : await payreq.func(argv);
};

module.exports = {
    pubkey: true,
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
        '    | 0. Use `swappool` to get all pools that available to swap.    |',
        '    | 1. Default `slippage` is `5`, which means a 5% slippage.      |',
        '    | 2. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 3. After successful execution, you will get a URL.            |',
        '    | 4. Open this URL in your browser.                             |',
        '    | 5. Scan the QR code with Mixin to complete the payment.       |',
        '    | 6. You have to complete the payment within `'
        + `${finance.transferTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 7. SCANNING AN EXPIRED QR CODE WILL RESULT IN LOST MONEY.     |',
        '    | 8. Only `1` swap transaction is allowed at a time.            |',
        '    | 9. Finish, `swapcancel` or timeout a current trx before swap. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of Estimating a Swap Deal (dryrun):',
        '    $ prs-atm swap \\',
        '              --account=ABCDE \\',
        '              --from=COB \\',
        '              --amount=12.3456 \\',
        '              --to=CNB \\',
        '              --keystore=keystore.json \\',
        '              --email=abc@def.com \\',
        '              --dryrun',
        '',
        '    > Example of Swap:',
        '    $ prs-atm swap \\',
        '              --account=ABCDE \\',
        '              --from=COB \\',
        '              --amount=12.3456 \\',
        '              --to=CNB \\',
        '              --keystore=keystore.json \\',
        '              --email=abc@def.com',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 19 }, 1: { width: 64 } } },
        },
    },
};
