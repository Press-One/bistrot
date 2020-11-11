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
    func,
    name: 'Check Voting Information',
    help: [
        '    --account  PRESS.one account                 [STRING  / OPTIONAL]',
        '',
        '    > Example of checking global voting information:',
        '    $ prs-atm ballot',
        '',
        "    > Example of checking account's voting information:",
        '    $ prs-atm ballot --account=ABCDE',
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
