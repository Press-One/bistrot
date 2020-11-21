'use strict';

global.chainConfig.rpcApi = 'http://51.255.133.170:8888';

const { exchange } = require('..');

const func = async (argv) => {
    const x = await exchange.swapToken(
        argv.pvtkey, argv.account, argv.receiver, argv.from, argv.amount,
        argv.to, argv.slippage, argv.email,
        argv['mx-id'], argv['mx-num'], argv.memo
    );
    console.log(x);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Get swap pools',
    help: [
        '    > Example:',
        '    $ prs-atm pool',
    ],
    render: {
        table: {
            columns: [
                'name',
                'creator',
                'status',
                'invariant',
                'token',
                'tokens',
                'rate',
                'created_at',
            ],
            config: {
                columns: {
                    4: { alignment: 'right' },
                    5: { alignment: 'right' },
                },
            },
        },
    },
};
