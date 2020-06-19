'use strict';

const { sushitrain } = require('sushitrain');

const func = async (argv) => {
    let resp = await sushitrain.getBlockByNumOrId(argv.id);
    if (!argv.json) {
        resp.transactions = JSON.stringify(resp.transactions).substr(0, 288)
            + '...';
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
        '',
        '    > Example:',
        '    $ prs-atm block --id=26621512 --json',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 18 }, 1: { width: 55 } } },
        },
    },
};
