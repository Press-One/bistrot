'use strict';

const { finance, producer, colors, math } = require('..');

const func = async (argv) => {
    const resp = await producer.queryByRange(argv.bound, argv.count);
    if (!argv.json) {
        console.log(
            `BOUND: ${resp.more}\n`
            + `TOTAL_PRODUCER_VOTE_WEIGHT: ${resp.total_producer_vote_weight}`,
        );
    }
    const total = math.bignumber(resp.total_producer_vote_weight);
    let priority = 0;
    resp.rows.map(x => {
        x.priority = (argv.bound ? `... ` : '')
            + (++priority > 9 ? priority : `0${priority}`);
        x.total_votes = x.total_votes.replace(/\.\d*$/, '');
        x.scaled_votes = finance.bigFormat(
            math.divide(math.bignumber(x.total_votes), total)
        );
        x.is_active = !!x.is_active;
        if (!argv.json) {
            x.producer_key = x.producer_key.slice(0, 10) + '...';
            if (x.priority <= 21) {
                for (let i in x) {
                    try { x[i] = colors.green(x[i]); } catch (err) { }
                }
            }
        }
    });
    return resp.rows;
};

module.exports = {
    func,
    name: 'Check Producers Information',
    render: {
        table: {
            columns: [
                'priority',
                'owner',
                'total_votes',
                'scaled_votes',
                'producer_key',
                'is_active',
                'unpaid_blocks',
                'last_claim_time',
            ],
            config: {
                singleLine: true,
                columns: {
                    0: { alignment: 'right' },
                    2: { alignment: 'right' },
                    3: { alignment: 'right' },
                    5: { alignment: 'right' },
                    6: { alignment: 'right' },
                },
            },
        },
    },
};
