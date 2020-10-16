'use strict';

const { statement } = require('../');
const { utilitas } = require('sushitrain');
const colors = require('colors/safe');

const func = async (argv) => {
    const resp = await statement.query(
        argv.account, argv.time, argv.type, argv.count, argv.detail
    );
    if (!argv.json) {
        resp.map(x => {
            const pre = { INCOME: '+', EXPENSE: '-' }[x.type] || '*';
            x.type = `${pre} ${x.type}`;
            if (x.status !== 'SUCCESS') {
                for (let i in x) {
                    if (utilitas.isString(x[i])) { x[i] = colors.red(x[i]); }
                }
            }
        });
    }
    return resp;
};

const render = (argv) => {
    const options = {
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
    };
    if (argv.detail) {
        options.table.columns.push('status', 'detail');
    }
    return options;
};

module.exports = {
    func,
    name: 'Check Statement',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --time     Timestamp for paging              [STRING  / OPTIONAL]',
        "    --type     Transaction Type (default 'ALL')  [STRING  / OPTIONAL]",
        '    --count    Page size                         [NUMBER  / OPTIONAL]',
        '    --detail   Including failed transactions     [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. All available transaction `type`s:                         | ",
        '    |    ' + statement.transactionTypes.join(', ') + '. | ',
        "    | 2. Default `count` is `100`.                                  |",
        "    | 3. Default `detail` is `false`.                               |",
        "    | 4. Set `time` as `timestamp` of last item to get next page.   |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm statement --account=ABCDE',
    ],
    render,
};
