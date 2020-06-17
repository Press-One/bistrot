'use strict';

const { statement } = require('../index');

const func = async (argv) => {
    return await statement.query(
        argv.account, argv.time, argv.type, argv.count,
    );
};

module.exports = {
    func,
    name: 'Check Statement',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --time     Timestamp for paging              [STRING  / OPTIONAL]',
        "    --type     Can be 'INCOME', 'EXPENSE', 'ALL' [STRING  / OPTIONAL]",
        '    --count    Page size                         [NUMBER  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `type` is 'ALL'.                                   |",
        "    | 2. Default `count` is 100.                                    |",
        "    | 3. Set `time` as `timestamp` of last item to get next page.   |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm statement --account=ABCDE',
    ],
    render: {
        table: {
            columns: [
                'timestamp',
                'block_num',
                'counter',
                'type',
                'description',
                'from',
                'to',
                'amount',
                'currency',
            ],
            config: {
                singleLine: true,
                columns: {
                    1: { alignment: 'right' },
                    7: { alignment: 'right' },
                },
            },
        },
    },
};
