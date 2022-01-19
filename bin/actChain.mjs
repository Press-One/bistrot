'use strict';

const { quorum } = require('..');

const func = async (argv) => {
    return await quorum.getInfo();
};

module.exports = {
    func,
    name: 'Check QUORUM-chain Information',
    help: [
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Use the `rpcapi` param to check the specific QUORUM-node.  |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'checking global QUORUM-chain Information',
        },
        {
            title: 'checking specific QUORUM-node Information',
            args: {
                rpcapi: true,
            },
        },
    ],
    render: { table: { KeyValue: true } },
};
