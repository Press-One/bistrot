'use strict';

const { producer } = require('sushitrain');

const func = async (argv) => {
    const resp = await producer.getAll();
    if (!global.chainConfig.json) {
        console.log(
            'TOTAL_PRODUCER_VOTE_WEIGHT:', resp.total_producer_vote_weight
        );
    }
    resp.rows.map(x => {
        x.total_votes = x.total_votes.replace(/\.0*$/, '');
    });
    return resp.rows;
};

module.exports = {
    func,
    name: 'Check Producers Information',
    help: [
        "    --action   Set as 'producers'                [STRING  / REQUIRED]",
        '',
        '    > Example:',
        '    $ prs-atm --action=producers',
    ],
    render: {
        table: {
            columns: [
                'owner',
                'total_votes',
                'producer_key',
                'is_active',
                'unpaid_blocks',
                'last_claim_time',
                'location',
            ],
            config: {
                singleLine: true,
                columns: {
                    0: { alignment: 'right' },
                    1: { alignment: 'right' },
                    2: { alignment: 'right' },
                    3: { alignment: 'right' },
                    5: { alignment: 'right' },
                    6: { alignment: 'right' },
                    7: { alignment: 'right' },
                },
            },
        },
    },
};
