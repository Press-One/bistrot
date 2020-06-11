'use strict';

const { } = require('../index');

const func = async (argv) => {
    return resp;
};

module.exports = {
    func,
    help: [
        '* Check Statement:',
        '',
        "    --action   Set as 'statement'                [STRING  / REQUIRED]",
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
        '    $ prs-atm --action=statement \\',
        '              --account=ABCDE',
    ],
};
