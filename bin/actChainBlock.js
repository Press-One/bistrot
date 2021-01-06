'use strict';

const { sushitrain } = require('..');

const maxTrxLength = 288;

const func = async (argv) => {
    let resp = await sushitrain.getBlockByNumOrId(argv.id);
    if (!argv.json) {
        const trx = JSON.stringify(resp.transactions);
        resp.transactions = trx.substr(0, maxTrxLength)
            + (trx.length > maxTrxLength ? '...' : '');
    }
    return resp;
};

module.exports = {
    func,
    name: 'Get block by block id or block number',
    help: [
        '    --id       `block id` or `block number`      [STR|NUM / REQUIRED]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Please use option `--json` to get complete block data.     |",
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            id: true,
            json: null,
        }
    },
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 18 }, 1: { width: 55 } } },
        },
    },
};
