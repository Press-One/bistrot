'use strict';

const { etc } = require('../index');

const func = async (argv) => {
    const content = await etc.buildConfig(
        argv.account, argv.agent, argv.pubkey, argv.pvtkey,
    );
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/config.ini`, content, {
            overwrite: argv.force,
        });
    }
    const result = {};
    content.split(/\r|\n/).map(x => {
        const [key, value] = [
            x.replace(/([^=]*)=(.*)/, '$1').trim(),
            x.replace(/([^=]*)=(.*)/, '$2').trim(
            ).replace(/^[\ \'\"]*|[\ \'\"]*$/g, '').trim()
        ];
        if ((key || value)
            && key.toLocaleLowerCase() !== 'signature-provider') {
            result[key] = value;
        }
    });
    return result;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Generate the `config.ini` file',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --agent    Agent name for your PRS-node      [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Default `agent` is current `account` (pvtkey holder).      |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm config --account=ABCD --path=. --keystore=keystore.json',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 23 }, 1: { width: 50 } } },
        },
    },
};
