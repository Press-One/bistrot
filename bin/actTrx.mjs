import { quorum } from '../index.mjs';

const action = async (argv) => await quorum.getTransactionByHash(argv.hash, argv);

export const { func, name, help, example, render } = {
    func: action,
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
