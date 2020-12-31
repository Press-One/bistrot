'use strict';

const { finance, producer, colors, math } = require('..');

const func = async (argv) => {
    const resp = await producer.getAll();
    if (!argv.json) {
        console.log(
            'TOTAL_PRODUCER_VOTE_WEIGHT:', resp.total_producer_vote_weight
        );
    }
    const total = math.bignumber(resp.total_producer_vote_weight);
    let priority = 0;
    resp.rows.map(x => {
        x.priority = ++priority;
        x.total_votes = x.total_votes.replace(/\.\d*$/, '');
        x.scaled_votes = finance.bigFormat(
            math.divide(math.bignumber(x.total_votes), total)
        );
        if (!argv.json && x.priority <= 21) {
            for (let i in x) {
                try { x[i] = colors.green(x[i]); } catch (err) { }
            }
        }
    });
    return resp.rows;
};

module.exports = {
    func,
    name: 'Check Producers Information',
    help: [
        '    > Example:',
        '    $ prs-atm producers',
    ],
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
