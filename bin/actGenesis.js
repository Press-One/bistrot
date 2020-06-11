'use strict';

const { etc } = require('../index');

const func = async (argv) => {
    const resp = await etc.buildGenesis();
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/genesis.json`, resp, {
            overwrite: global.chainConfig.overwrite,
        });
    }
    return JSON.parse(resp);
};

module.exports = {
    func,
    name: 'Generate the `genesis.json` file',
    help: [
        "    --action   Set as 'genesis'                  [STRING  / REQUIRED]",
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm --action=genesis \\',
        '              --path=.',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 21 }, 1: { width: 64 } } },
        },
    },
};
