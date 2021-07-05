'use strict';

const { utilitas, preference, keychain, wallet } = require('..');
const readline = require('readline-sync');
const fs = require('fs');
const privatekeyLength = 51;

const ensurePassword = (argv) => {
    while (!argv.password) {
        console.log('Input password for the keystore.');
        argv.password = readline.question('Password: ', argv.readlineConf);
    }
};

const func = async (argv, options = {}) => {
    let [filename, config, resp] = [null, null, []];
    if (argv.delete) {
        const { filename: file, config: cnfg }
            = await keychain.del(argv.account, argv.prmsn);
        filename = file;
        config = cnfg;
    } else if (argv.unlock) {
        argv.savepswd || ensurePassword(argv);
        const { filename: file, config: cnfg } = await keychain.get(
            argv.account, argv.prmsn, { unlock: true, password: argv.password } // unique: true,
        );
        filename = file;
        config = cnfg;
    } else if (argv.new || argv.pubkey || argv.pvtkey) {
        ensurePassword(argv);
        const kObj = await wallet.createKeystore(
            argv.password, argv.pubkey, argv.pvtkey
        );
        const { filename: file, config: cnfg } = await keychain.set(
            argv.account, argv.prmsn, kObj, argv.password, argv.memo,
            { savePassword: argv.savepswd }
        );
        filename = file;
        config = cnfg;
    } else if (argv.keystore) {
        ensurePassword(argv);
        utilitas.assert(
            fs.existsSync(argv.keystore), 'File does not exist.', 400
        );
        let [kFile, kObj] = [fs.readFileSync(argv.keystore, 'utf8'), null];
        try {
            kObj = JSON.parse(kFile);
            argv.pubkey = kObj.publickey;
        } catch (e) { utilitas.throwError('Invalid keystore file.', 400); }
        const { filename: file, config: cnfg } = await keychain.set(
            argv.account, argv.prmsn, kObj, argv.password, argv.memo,
            { savePassword: argv.savepswd }
        );
        filename = file;
        config = cnfg;
    } else {
        const {
            filename: file, config: cnfg
        } = await preference.getUserConfig();
        filename = file;
        config = cnfg;
    }
    if (!argv.json) { console.log('KEYCHAIN_IN_CONFIG_FILE:', filename); }
    for (let key in config.keystores || {}) {
        let privatekey = config.keystores[key].keystore.privatekey
            || utilitas.makeStringByLength('*', privatekeyLength);
        if (!argv.json) {
            privatekey = privatekey.slice(0, 27) + '...';
        }
        resp.push({
            account: config.keystores[key].account,
            permission: config.keystores[key].permission,
            publickey: config.keystores[key].keystore.publickey,
            privatekey,
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
    ],
    example: [
        {
            title: 'saving a new key',
            args: {
                account: true,
                prmsn: 'owner',
                keystore: true,
            },
        },
        {
            title: 'deleting an existing key',
            args: {
                account: true,
                prmsn: 'active',
                delete: null,
            },
        },
    ],
    render: {
        table: {
            columns: [
                'account',
                'permission',
                'publickey',
                'privatekey',
                'memo',
            ],
            config: {
                columns: {
                    0: { width: 12 },
                    1: { width: 10 },
                    2: { width: 53 },
                    3: { width: 30 },
                    4: { width: 10 },
                },
            },
        },
    },
};
