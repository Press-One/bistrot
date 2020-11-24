'use strict';

// debug {
const debug = true;
if (debug) { global.chainConfig.rpcApi = 'http://51.255.133.170:8888'; }
// }

const { utilitas, exchange } = require('..');

const hiddenField = [
    'mixin_account_id', 'oracle_info', 'oracle_trx_id', 'oracle_timestamp'
];

const func = async (argv) => {
    const rs = await exchange.getPaymentRequest(argv.account, { single: true });
    if (!argv.json && rs) {
        let paymentUrls = [];
        rs.mixin_trace_id = utilitas.uniqueArray(rs.mixin_trace_id).join('\n');
        rs.timestamp_received = rs.timestamp_received.toISOString();
        rs.payment_timeout = rs.payment_timeout.toISOString();
        for (let key of hiddenField) { delete rs[key]; }
        Object.values(rs.payment_request).map(x => {
            // debug with CNB {
            if (debug) {
                x.payment_url = x.payment_url.replace(
                    /(^.*asset=)[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(&.*$)/,
                    `$1${require('..').mixin.assetIds.CNB.id}$2`
                );
            }
            // }
            paymentUrls.push(x.payment_url);
        });
        if (paymentUrls.length) {
            // debug {
            if (debug) { console.log('>>> DEBUG MODE! <<<'); }
            // }
            console.log('\nOpen these URLs in your browser:\n\n'
                + `${paymentUrls.join('\n\n')}\n`);
        }
    }
    return rs;
};

module.exports = {
    func,
    name: 'Get swap payment request',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm payreq --account=ABCDE',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 19 }, 1: { width: 64 } } },
        },
    },
};
