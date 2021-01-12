'use strict';

const { etc } = require('..');

const func = async (argv) => {
    const resp = await etc.buildGenesis();
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/genesis.json`, resp, {
            overwrite: argv.force,
        });
    }
    return JSON.parse(resp);
};

module.exports = {
    func,
    name: 'Generate the `genesis.json` file',
    help: [
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
    ],
    example: {
        args: {
            path: true,
        },
    },
    render: { table: { KeyValue: true } },
};
