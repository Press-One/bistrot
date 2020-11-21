'use strict';

global.chainConfig.rpcApi = 'http://51.255.133.170:8888';

const { utilitas, swap, exchange } = require('..');

const func = async (argv) => {
    argv.from = utilitas.ensureString(argv.from, { case: 'UP' });
    argv.to = utilitas.ensureString(argv.to, { case: 'UP' });
    const [deal, pool] = [[argv.from, argv.to], await swap.getPool()];
    utilitas.assert(argv.from, 'From-currency is required.', 400);
    utilitas.assert(argv.to, 'From-currency is required.', 400);
    utilitas.assert(pool && pool.length, 'No swap-pool is available.', 500);
    let catchPool;
    for (let x of pool) {
        if (utilitas.arrayEqual(deal, x.tokens.map(y => { return y.symbol }))) {
            catchPool = x;
            break;
        }
    };
    utilitas.assert(
        catchPool,
        `No pool is available to swap between ${argv.from} and ${argv.to}.`, 400
    );
    console.log(catchPool);
    const x = await exchange.swapToken(
        argv.pvtkey, argv.account, argv.receiver,
        argv['mx-id'], argv['mx-num'], argv.email, argv.from, argv.amount,
        argv.to, argv.slippage, argv.memo);
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
