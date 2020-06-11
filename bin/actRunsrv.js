'use strict';

const { } = require('../index');

const func = async (argv) => {
    const jResult = await etc.buildRunservice();
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/runservice.sh`, jResult, {
            overwrite: global.chainConfig.overwrite,
            executable: true,
        });
    }
    return console.log(`\n${jResult}`);
};

module.exports = {
    func,
    name: 'Generate the `runservice.sh` file',
    help: [
        "    --action   Set as 'runsrv'                   [STRING  / REQUIRED]",
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm --action=runsrv \\',
        '              --path=.',
    ],
};
