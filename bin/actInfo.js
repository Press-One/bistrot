'use strict';

const { sushitrain } = require('..');

const func = async (argv) => {
    return await sushitrain.getInfo();
};

module.exports = {
    func,
    name: 'Check PRS-chain Information',
    help: [
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
            config: { columns: { 0: { width: 27 }, 1: { width: 64 } } },
        },
    },
};
