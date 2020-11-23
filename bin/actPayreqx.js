'use strict';

global.chainConfig.rpcApi = 'http://51.255.133.170:8888';

const { exchange } = require('..');

const func = async (argv) => {
    const resp = await exchange.getPaymentRequest(argv.account);
    if (!argv.json) {
        let paymentUrls = [];
        resp.filter(x => { return x.paymentUrls && x.paymentUrls.length }).map(
            x => { paymentUrls = [...paymentUrls, ...x.paymentUrls]; }
        );
        if (paymentUrls.length) {
            console.log('\nOpen these URLs in your browser:\n\n'
                + `${paymentUrls.join('\n\n')}\n`);
        }
    }
    return resp;
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
            columns: [
                'id',
                'user',
                'type',
                'pool_token',
                'token1',
                'token2',
                'timestamp_received',
                'status',
                'payment_timeout',
            ],
        },
    },
};
