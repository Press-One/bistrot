'use strict';

const { } = require('../index');

const func = async (argv) => {
    return resp;
};

module.exports = {
    func,
    help: [
        '* Generate the `genesis.json` file:',
        '',
        "    --action   Set as 'genesis'                  [STRING  / REQUIRED]",
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm --action=genesis \\',
        '              --path=.',
    ],
};
