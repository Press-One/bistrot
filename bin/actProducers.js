'use strict';

const { finance, producer } = require('sushitrain');
const mathjs = require('mathjs');

const func = async (argv) => {
    const resp = await producer.getAll();
    if (!argv.json) {
        console.log(
            'TOTAL_PRODUCER_VOTE_WEIGHT:', resp.total_producer_vote_weight
        );
    }
    const total = mathjs.bignumber(resp.total_producer_vote_weight);
    resp.rows.map(x => {
        x.total_votes = x.total_votes.replace(/\.\d*$/, '');
        x.scaled_votes = finance.bigFormat(
            mathjs.divide(mathjs.bignumber(x.total_votes), total)
        );
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
                    1: { alignment: 'right' },
                    2: { alignment: 'right' },
                    3: { alignment: 'right' },
                    4: { alignment: 'right' },
                    5: { alignment: 'right' },
                    6: { alignment: 'right' },
                    7: { alignment: 'right' },
                },
            },
        },
    },
};
