'use strict';

const { exchange } = require('..');

const func = async (argv) => {
    const rsp = await exchange.cancelSwap(argv.pvtkey, argv.account, argv.memo);
    if (!argv.json && rsp) {
        rsp.mixin_trace_id = rsp.mixin_trace_id.join('\n');
        rsp.timestamp_received = rsp.timestamp_received.toISOString();
        rsp.payment_timeout = rsp.payment_timeout.toISOString();

    }
    return rsp
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Cancel a swapping payment request',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Only `1` swap transaction is allowed at a time.            |',
        '    | 2. Cancel a current trx by this cmd before issuing a new one. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm swapcancel',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json \\',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 19 }, 1: { width: 64 } } },
        },
    },
};
