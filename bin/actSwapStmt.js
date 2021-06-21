'use strict';

const { exchange } = require('..');

const func = async (argv) => {
    let rs = await exchange.queryStatement(argv.account, argv.time, argv.count);
    if (!argv.json) {
        rs.map(x => {
            for (let i of ['from', 'to']) {
                if (Array.isArray(x[i])) { x[i] = x[i].join(', '); }
            }
        });
    }
    return rs;
};

module.exports = {
    hide: true,
    func,
    name: 'Check Swap Statement',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --time     Timestamp for paging              [STRING  / OPTIONAL]',
        '    --count    Page size                         [NUMBER  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Default `count` is `100`.                                  |',
        '    | 2. Set `time` as `timestamp` of last item to get next page.   |',
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
                'type',
                'from',
                'to',
                'fee',
            ],
            config: {
                singleLine: true,
                columns: {
                    1: { alignment: 'right' },
                    2: { alignment: 'right' },
                    3: { alignment: 'right' },
                    4: { alignment: 'right' },
                    5: { alignment: 'right' },
                },
            },
        },
    },
};
