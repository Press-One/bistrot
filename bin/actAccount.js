'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    return await account.getByName(argv.account);
};

module.exports = {
    func,
    name: 'Check an Account',
    help: [
        "    --action   Set as 'account'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm --action=account \\',
        '              --account=ABCDE',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 24 }, 1: { width: 49 } } },
        },
    },
};
