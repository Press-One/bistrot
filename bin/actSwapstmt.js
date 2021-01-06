'use strict';

const { exchange } = require('..');

const func = async (argv) => {
    return await exchange.queryStatement(argv.account, argv.time, argv.count);
};

module.exports = {
    func,
    name: 'Check Swap Statement',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --time     Timestamp for paging              [STRING  / OPTIONAL]',
        '    --count    Page size                         [NUMBER  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `count` is `100`.                                  |",
        "    | 2. Set `time` as `timestamp` of last item to get next page.   |",
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
        }
    },
    render: {
        table: {
            columns: [
                'timestamp',
                'block_num',
                'counter',
                'type',
                'from_user',
                'to_user',
                'from',
                'to',
                'fee',
            ],
            config: {
                singleLine: true,
                columns: {
                    6: { alignment: 'right' },
                    7: { alignment: 'right' },
                    8: { alignment: 'right' },
                },
            },
        },
    },
};
