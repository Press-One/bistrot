'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    const resp = await account.getByName(argv.account);
    return resp;
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
            config: {
                columns: { 0: { width: 24 }, 1: { width: 49 } }
            }
        }
    },
};
