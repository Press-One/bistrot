'use strict';

const { etc } = require('..');

const func = async (argv) => {
    const filename = 'runservice.sh';
    const resp = await etc.buildRunservice();
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/${filename}`, resp, {
            overwrite: argv.force, executable: true,
        });
    }
    return { [filename]: resp };
};

module.exports = {
    func,
    name: 'Generate the `runservice.sh` file',
    help: [
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm runsrv --path=.',
    ],
};
