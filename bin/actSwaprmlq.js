'use strict';

const payreq = require('./actSwappay');
const { exchange } = require('..');

const func = async (argv) => {
    return await exchange.rmLiquid(
        argv.pvtkey, argv.account, argv.cura, argv.curb, argv.amount,
        argv['mx-id'], argv['mx-num'], argv.email, argv.memo,
    );
};

module.exports = {
    pubkey: true,
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
        '    | 1. Use `swappool` to get pools that available to rm liquid.   |',
        '    | 2. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 3. One of `mx-num` or `mx-id` must be provided.               |',
        '    | 4. Execute the `auth` command before the first `swaprmlq`.    |',
        '    | 5. Only `1` swap related transaction is allowed at a time.    |',
        '    | 6. Finish, `swapcancel` or timeout a current trx before exec. |',
        '    └---------------------------------------------------------------┘',
        '    ┌- WARNING -----------------------------------------------------┐',
        '    | ⚠ Ensure to double-check `mx-num` or `mx-id` before apply for |',
        '    |   refund. Wrong accounts will cause property loss.            |',
        '    | ⚠ We are not responsible for any loss of property due to the  |',
        '    |   mistake of withdraw accounts.                               |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of remove liquid and refund to Mixin number:',
        '    $ prs-atm swaprmlq \\',
        '              --account=ABCDE \\',
        '              --cura=COB \\',
        '              --curb=CNB \\',
        '              --amount=12.3456 \\',
        '              --mx-num=12345 \\',
        '              --keystore=keystore.json \\',
        '              --email=abc@def.com',
        '',
        '    > Example of remove liquid and refund to Mixin user id:',
        '    $ prs-atm swaprmlq \\',
        '              --account=ABCDE \\',
        '              --cura=COB \\',
        '              --curb=CNB \\',
        '              --amount=12.3456 \\',
        '              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \\',
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
