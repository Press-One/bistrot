'use strict';

const { utilitas, config: libConf } = require('..');
const readline = require('readline-sync');
const fs = require('fs');

const func = async (argv, options = {}) => {
    let [filename, config, resp] = [null, null, []];
    if (argv.delete) {
        const { filename: file, config: cnfg }
            = await libConf.deleteKeystore(argv.account, argv.prmsn);
        filename = file;
        config = cnfg;
    } else if (argv.account || argv.prmsn || argv.keystore || argv.memo) {
        utilitas.assert(
            fs.existsSync(argv.keystore), 'File does not exist.', 400
        );
        let [kFile, kObj] = [fs.readFileSync(argv.keystore, 'utf8')];
        try {
            kObj = JSON.parse(kFile);
            (argv.pubkey = kObj.publickey).length;
        } catch (e) { utilitas.throwError('Invalid keystore file.', 400); }
        while (!argv.password) {
            console.log('Input password to decrypt the keystore.');
            argv.password = readline.question('Password: ', argv.readlineConf);
        }
        const { filename: file, config: cnfg } = await libConf.setKeystore(
            argv.account, argv.prmsn, kObj, argv.password, argv.memo
        );
        filename = file;
        config = cnfg;
    } else {
        const { filename: file, config: cnfg } = await libConf.getUserConfig();
        filename = file;
        config = cnfg;
    }
    if (!argv.json) { console.log('CONFIG_FILENAME:', filename); }
    for (let key in config.keystores || {}) {
        resp.push({
            account: config.keystores[key].account,
            permission: config.keystores[key].permission,
            publickey: config.keystores[key].keystore.publickey,
            memo: config.keystores[key].memo,
        });
    }
    return resp;
};

module.exports = {
    func,
    name: 'Manage Keychain',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --prmsn    Permission of the key             [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]',
        '    --password Use to `verify` the keystore      [STRING  / OPTIONAL]',
        '    --memo     Memo for the keystore             [STRING  / OPTIONAL]',
        '    --savepswd Save password (DANGEROUS)         [WITH  OR  WITHOUT ]',
        '    --delete   To `delete` instead of to `save`  [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Leave empty args to view current keychain.                 |',
        '    | 2. Save keys to the keychain for simplified use.              |',
        '    | 3. The password is for keystore verification only.            |',
        '    | 4. This program will `NOT` save your password by default.     |',
        '    | 5. `savepswd` is `EXTREMELY DANGEROUS`, use on your own risk. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of saving a new key:',
        '    $ prs-atm keychain\\',
        '              --account=ABCDE \\',
        '              --prmsn=owner \\',
        '              --keystore=keystore.json',
        '',
        '    > Example of deleting an existing key:',
        '    $ prs-atm keychain\\',
        '              --account=ABCDE \\',
        '              --prmsn=active \\',
        '              --delete',
    ],
    render: {
        table: {
            columns: [
                'account',
                'permission',
                'publickey',
                'memo',
            ],
            config: {
                columns: {
                    0: { width: 12 },
                    1: { width: 10 },
                    2: { width: 53 },
                    3: { width: 10 },
                },
            },
        },
    },
};
