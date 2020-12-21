'use strict';

const payreq = require('./actSwappay');
const { exchange, finance } = require('..');

const func = async (argv) => {
    const resp = await exchange.addLiquid(
        argv.pvtkey, argv.account, argv.cura, argv.curb,
        argv.amounta, argv.email, argv.memo, { dryrun: argv.dryrun }
    );
    // console.log(resp); // @keep this line for debug
    return argv.dryrun ? resp : await payreq.func(argv);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Add Liquid to Swap Pools',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --cura     CURRENCY-A to be added            [STRING  / REQUIRED]',
        '    --curb     CURRENCY-B to be added            [STRING  / REQUIRED]',
        '    --amounta  Number like xx.xxxx of CURRENCY-A [NUMBER  / REQUIRED]',
        '    --dryrun   Evaluate a swap without executing [WITH  OR  WITHOUT ]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 0. Use `swappool` to get pools that available to add liquid.  |',
        '    | 1. Amount of CURRENCY-B will be calculated automatically.     |',
        '    | 2. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 3. After successful execution, you will get `2` URLs.         |',
        '    | 4. Open these URLs in your browser.                           |',
        '    | 5. Scan the QR codes with Mixin to complete the payment.      |',
        '    | 6. You have to complete the payment within `'
        + `${finance.transferTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 7. SCANNING AN EXPIRED QR CODES WILL RESULT IN LOST MONEY.    |',
        '    | 8. Only `1` swap related transaction is allowed at a time.    |',
        '    | 9. Finish, `swapcancel` or timeout a current trx before exec. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm swapaddlq \\',
        '              --account=ABCDE \\',
        '              --cura=COB \\',
        '              --amounta=12.3456 \\',
        '              --curb=CNB \\',
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
