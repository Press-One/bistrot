'use strict';

global.chainConfig.rpcApi = 'http://51.255.133.170:8888';

const { swap } = require('..');

const renderSymbol = (symbol) => {
    while (symbol.length < 4) { symbol += ' '; }
    return symbol;
};

const renderToken = (item) => {
    return `${item.volume} ${renderSymbol(item.symbol)}`;
};

const renderRate = (p) => {
    const [a, b] = [p.tokens[0].symbol, p.tokens[1].symbol];
    return [
        `1 ${renderSymbol(a)} = ${p[`${a}-${b}`]} ${renderSymbol(b)}`,
        `1 ${renderSymbol(b)} = ${p[`${b}-${a}`]} ${renderSymbol(a)}`
    ];
};

const func = async (argv) => {
    const resp = await swap.getPool();
    if (!argv.json) {
        resp.map(x => {
            for (let i in x) {
                if (/^pool_/i.test(i)) {
                    x[i.replace(/^pool_(.*)$/i, '$1')] = x[i];
                    delete x[i];
                }
            }
            x.created_at = new Date(x.created_at).toISOString();
            x.rate = renderRate(x).join('\n');
            x.token = renderToken(x.token);
            x.tokens = [
                renderToken(x.tokens[0]),
                renderToken(x.tokens[1])
            ].join('\n');
        });
    }
    return resp;
};

module.exports = {
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
