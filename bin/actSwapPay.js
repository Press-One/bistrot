'use strict';

const { exchange, system } = require('..');

const hiddenField = ['oracle_info', 'oracle_trx_id', 'oracle_timestamp'];

const func = async (argv) => {
    const resp = await exchange.getPaymentRequest(argv.account);
    if (!argv.json && resp) {
        let paymentUrls = [];
        resp.mixin_trace_id = resp.mixin_trace_id.join('\n');
        resp.timestamp_received = resp.timestamp_received.toISOString();
        resp.payment_timeout = resp.payment_timeout.toISOString();
        for (let key of hiddenField) { delete resp[key]; }
        Object.values(resp.payment_request).map(x => {
            paymentUrls.push(system.magicPayment(x.payment_url));
        });
        if (paymentUrls.length) {
            console.log('\nOpen these URLs in your browser:\n\n'
                + `${paymentUrls.join('\n\n')}\n`);
        }
    }
    return resp;
};

module.exports = {
    func,
    name: 'Get swapping payment request',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
    ],
    example: {
        args: {
            account: true,
        },
    },
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 19 }, 1: { width: 64 } } },
        },
    },
};
