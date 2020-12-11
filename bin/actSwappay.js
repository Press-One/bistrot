'use strict';

// debug {
const debug = true;
// }

const { exchange } = require('..');

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
            // debug with CNB {
            if (debug) {
                const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
                const replace = {
                    recipient: '14da6c0c-0cbf-483c-987a-c44477dcad1b',
                    // asset: require('..').mixin.assetIds.CNB.id,
                };
                for (let i in replace) {
                    x.payment_url = x.payment_url.replace(new RegExp(
                        `(^.*${i}=)${uuid}(&.*$)`
                    ), `$1${replace[i]}$2`);
                }
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
    return resp;
};

module.exports = {
    func,
    name: 'Get swapping payment request',
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
