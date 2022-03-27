import { utilitas, preference, keychain, crypto } from '../index.mjs';
import fs from 'fs';
import readline from 'readline-sync';

const privatekeyLength = 64;

const ensurePassword = (argv) => {
    while (!argv.password) {
        console.log('Input password for the keystore.');
        argv.password = readline.question('Password: ', argv.readlineConf);
    }
};

const action = async (argv, options = {}) => {
    let [filename, config, resp] = [null, null, []];
    if (argv.delete) {
        const {
            filename: file, config: cnfg
        } = await keychain.del(argv.address);
        filename = file;
        config = cnfg;
    } else if (argv.unlock) {
        argv.savepswd || ensurePassword(argv);
        const { filename: file, config: cnfg } = await keychain.get(
            argv.address,
            { unlock: true, password: argv.password, unique: true }
        );
        filename = file;
        config = cnfg;
    } else if (argv.new || argv.pvtkey) {
        ensurePassword(argv);
        const kObj = await crypto.createKeystore(argv.password, argv.pvtkey);
        const { filename: file, config: cnfg } = await keychain.set(
            kObj.address, kObj, argv.password, argv.memo,
            { savePassword: argv.savepswd }
        );
        filename = file;
        config = cnfg;
    } else if (argv.keystore) {
        ensurePassword(argv);
        assert(fs.existsSync(argv.keystore), 'File does not exist.', 400);
        let [kFile, kObj] = [fs.readFileSync(argv.keystore, 'utf8'), null];
        try {
            kObj = JSON.parse(kFile);
        } catch (e) { utilitas.throwError('Invalid keystore file.', 400); }
        const { filename: file, config: cnfg } = await keychain.set(
            kObj.address, kObj, argv.password, argv.memo,
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
    for (let address in config.keystores || {}) {
        let privateKey = config.keystores[address].keystore.privateKey
            || utilitas.makeStringByLength('*', privatekeyLength);
        if (!argv.json) {
            privateKey = privateKey.slice(0, 27) + '...';
        }
        resp.push({
            address, privateKey,
            memo: config.keystores[address].memo,
        });
    }
    return resp;
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Manage Keychain',
    help: [
        '    --address  Quorum address                    [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --pvtkey   Private key of Quorum account     [STRING  / OPTIONAL]',
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
                keystore: true,
            },
        },
        {
            title: 'deleting an existing key',
            args: {
                address: true,
                delete: null,
            },
        },
    ],
    render: {
        table: {
            columns: [
                'address',
                'privateKey',
                'memo',
            ],
            config: {
                columns: {
                    2: { width: 53 },
                    3: { width: 30 },
                    4: { width: 10 },
                },
            },
        },
    },
};
