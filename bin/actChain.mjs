import { quorum } from '../index.mjs';

const action = (argv) => quorum.getInfo(argv);

export const { func, name, help, example, render } = {
    func: action,
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
