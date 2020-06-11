'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    return await account.getBalance(argv.account);
};

module.exports = {
    func,
    name: 'Check Balance',
    help: [
        "    --action   Set as 'balance'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm --action=balance \\',
        '              --account=ABCDE',
    ],
};
