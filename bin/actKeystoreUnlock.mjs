import { utilitas, crypto } from '../index.mjs';
import fs from 'fs';
import readline from 'readline-sync';

const action = async (argv, options = {}) => {
    utilitas.assert(fs.existsSync(argv.keystore), 'File does not exist.', 400);
    let [kFile, kObj] = [fs.readFileSync(argv.keystore, 'utf8')];
    try {
        kObj = JSON.parse(kFile);
        argv.address = kObj.address;
    } catch (e) {
        utilitas.throwError('Invalid keystore file.', 400);
    }
    if (options.addressOnly) { return; }
    while (!argv.password) {
        console.log('Input password to decrypt the keystore.');
        argv.password = readline.question('Password: ', argv.readlineConf);
    }
    return crypto.recoverPrivateKey(argv.password, kObj);
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Unlock a Keystore',
    help: [
        '    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | This command will decrypt your keystore and display the       |',
        "    | address and private key. It's for advanced users only.        |",
        "    | You don't have to do this unless you know what you are doing. |",
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            keystore: true,
        }
    },
};
