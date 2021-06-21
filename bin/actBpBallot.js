'use strict';

const { ballot } = require('..');

const func = async (argv) => {
    let result = null;
    if (argv.account) {
        const resp = await ballot.queryByOwner(argv.account);
        result = resp ? [resp] : [];
    } else {
        result = await ballot.getAll();
    }
    for (let item of result) {
        item.producers = item.producers.join('\n');
    }
    return result;
};

module.exports = {
    hide: true,
    func,
    name: 'Check Voting Information',
    help: [
        '    --account  PRESS.one account                 [STRING  / OPTIONAL]',
    ],
    example: [
        {
            title: 'checking global voting information',
        },
        {
            title: "checking account's voting information",
            args: {
                account: true,
            },
        },
    ],
    render: {
        table: {
            columns: [
                'owner',
                'proxy',
                'producers',
                'staked',
                'last_vote_weight',
                'proxied_vote_weight',
                'is_proxy',
            ],
            config: {
                singleLine: true,
                columns: {
                    1: { alignment: 'right' },
                    3: { alignment: 'right' },
                    4: { alignment: 'right' },
                    5: { alignment: 'right' },
                    6: { alignment: 'right' },
                },
            },
        },
    },
};
