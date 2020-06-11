'use strict';

const { sushitrain } = require('sushitrain');

const func = async (argv) => {
    const resp = await sushitrain.getInfo();
    return resp;
};

module.exports = {
    func,
    name: 'Check PRS-chain Information',
    help: [
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
    render: {
        table: {
            KeyValue: true,
            config: {
                columns: { 0: { width: 27 }, 1: { width: 64 } }
            }
        }
    },
};
