'use strict';

const { node } = require('..');

const func = async (argv) => {
    const nodes = await node.queryAll();
    if (!argv.json) { nodes.map(x => { x.country = x.geo.country || null; }); }
    return nodes;
};

module.exports = {
    func,
    name: 'Get chain nodes',
    help: [
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Please use option `--json` to get structured data.         |",
        '    └---------------------------------------------------------------┘',
    ],
    render: {
        table: {
            columns: [
                'id',
                'name',
                'ip',
                'p2p_port',
                'shp_port',
                'rpc_port',
                'type',
                'status',
                'country',
                'updated_at',
            ],
            config: { singleLine: true },
        },
    },
};
