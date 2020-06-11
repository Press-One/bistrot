'use strict';

const { } = require('../index');

const func = async (argv) => {
    return resp;
};

module.exports = {
    func,
    help: [
        '* Generate the `runservice.sh` file:',
        '',
        "    --action   Set as 'runsrv'                   [STRING  / REQUIRED]",
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm --action=runsrv \\',
        '              --path=.',
    ],
};
