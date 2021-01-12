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
    ],
    example: [
        {
            title: 'checking global PRS-chain Information',
        },
        {
            title: 'checking specific PRS-node Information',
            args: {
                rpcapi: true,
            },
        },
    ],
    render: { table: { KeyValue: true } },
};
