'use strict';

const { } = require('../index');

const func = async (argv) => {
    return resp;
};

module.exports = {
    func,
    help: [
        '* Check PRS-chain Information:',
        '',
        "    --action   Set as 'info'                     [STRING  / REQUIRED]",
        '    ┌---------------------------------------------------------------┐',
        '    | 1. You can use `rpcapi` param to check the specific PRS-node. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of checking global PRS-chain Information:',
        '    $ prs-atm --action=info',
        '',
        '    > Example of checking specific PRS-node Information:',
        '    $ prs-atm --action=info \\',
        '              --rpcapi=http://http://127.0.0.1/:8888',
    ],
};
