'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    const resp = await account.getBalance(argv.account);
    return resp;
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
