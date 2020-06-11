'use strict';

const { } = require('../index');

const func = async (argv) => {
    const gResult = await etc.buildGenesis();
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/genesis.json`, gResult, {
            overwrite: global.chainConfig.overwrite,
        });
    }
    return randerResult(JSON.parse(gResult), {
        table: {
            KeyValue: true,
            config: {
                columns: { 0: { width: 21 }, 1: { width: 64 } }
            }
        }
    });
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
};
