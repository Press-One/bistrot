import { quorum } from '../index.mjs';

const func = async (argv) => {
    return await quorum.getTransactionByHash(argv.hash);
};

export const { func, name, help, example, render } = {
    func,
    name: 'Get transaction by hash',
    help: [
        '    --hash     Transaction hash                  [STRING  / REQUIRED]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Use option `--json` to get complete transaction data.      |",
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            hash: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            json: null,
        },
    },
    render: { table: { KeyValue: true } },
};
