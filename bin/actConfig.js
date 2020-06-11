'use strict';

const { } = require('../index');

const func = async (argv) => {
    const content = await etc.buildConfig(
        argv.account,
        argv.agent,
        argv.pubkey,
        argv.pvtkey,
    );
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/config.ini`, content, {
            overwrite: global.chainConfig.overwrite,
        });
    }
    const hResult = {};
    content.split(/\r|\n/).map(x => {
        const [key, value] = [
            x.replace(/([^=]*)=(.*)/, '$1').trim(),
            x.replace(/([^=]*)=(.*)/, '$2').trim(
            ).replace(/^[\ \'\"]*|[\ \'\"]*$/g, '').trim()
        ];
        if ((key || value)
            && key.toLocaleLowerCase() !== 'signature-provider') {
            hResult[key] = value;
        }
    });
    return randerResult(hResult, {
        table: {
            KeyValue: true,
            config: {
                columns: { 0: { width: 23 }, 1: { width: 50 } }
            }
        }
    });
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Generate the `config.ini` file',
    help: [
        "    --action   Set as 'config'                  [STRING  / REQUIRED]",
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
        '    $ prs-atm --action=config \\',
        '              --account=ABCDE \\',
        '              --path=. \\',
        '              --keystore=keystore.json',
    ],
};
