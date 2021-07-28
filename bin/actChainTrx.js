'use strict';

const { quorum } = require('..');

const func = async (argv) => {
    let resp = await quorum.getTransactionByHash(argv.hash);
    return resp && argv.json ? resp.transaction : resp.data;
};

module.exports = {
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
