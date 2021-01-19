'use strict';

const { swap, utilitas } = require('..');

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
        `1 ${renderSymbol(a)} = ${p.rates[`${a}-${b}`]} ${renderSymbol(b)}`,
        `1 ${renderSymbol(b)} = ${p.rates[`${b}-${a}`]} ${renderSymbol(a)}`
    ];
};

const func = async (argv) => {
    const resp = await swap.getAllPools();
    if (!argv.json) {
        resp.map(x => {
            for (let i in x) {
                if (/^pool_/i.test(i)) {
                    x[i.replace(/^pool_(.*)$/i, '$1')] = x[i];
                    delete x[i];
                }
            }
            x.invariant = utilitas.toExponential(x.invariant, 4);
            x.created_at = new Date(x.created_at).toISOString();
            x.rates = renderRate(x).join('\n');
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
    name: 'Get all pools that available to swap',
    render: {
        table: {
            columns: [
                'name',
                'creator',
                'status',
                'invariant',
                'token',
                'tokens',
                'rates',
                // 'created_at',
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
