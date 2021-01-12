'use strict';

const { etc, utilitas } = require('..');

const func = async (argv) => {
    const content = await etc.buildConfig(
        argv.account, argv.agent, argv.pubkey, argv.pvtkey,
    );
    if (argv.path) {
        await etc.dumpFile(`${argv.path}/config.ini`, content, {
            overwrite: argv.force,
        });
    }
    const resp = {};
    content.split(/\r|\n/).map(x => {
        const [key, value] = [
            x.replace(/([^=]*)=(.*)/, '$1').trim(),
            x.replace(/([^=]*)=(.*)/, '$2').trim(
            ).replace(/^[\ \'\"]*|[\ \'\"]*$/g, '').trim()
        ];
        if ((key || value)
            && key.toLocaleLowerCase() !== 'signature-provider') {
            if (utilitas.isSet(resp[key])) {
                if (!Array.isArray(resp[key])) { resp[key] = [resp[key]]; }
                resp[key].push(value);
            } else { resp[key] = value; }
        }
    });
    for (let i in resp) {
        if (Array.isArray(resp[i])) { resp[i] = resp[i].join('\n'); }
    }
    return resp;
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
    ],
    example: {
        args: {
            account: true,
            path: true,
            keystore: true,
        },
    },
    render: { table: { KeyValue: true } },
};
