'use strict';

const { } = require('../index');

const func = async (argv) => {
    return resp;
};

module.exports = {
    func,
    help: [
        '* Check Voting Information:',
        '',
        "    --action   Set as 'ballot'                   [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / OPTIONAL]',
        '',
        '    > Example of checking global voting information:',
        '    $ prs-atm --action=ballot',
        '',
        "    > Example of checking account's voting information:",
        '    $ prs-atm --action=ballot \\',
        '              --account=ABCDE',
    ],
};
