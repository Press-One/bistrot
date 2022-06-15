import { crypto, utilitas } from '../index.mjs';
import { existsSync, readFileSync } from 'fs';

const action = async (argv, options = {}) => {
    assert(existsSync(argv.keystore), 'File does not exist.', 400);
    let [kFile, kObj] = [readFileSync(argv.keystore, 'utf8')];
    try { kObj = JSON.parse(kFile); argv.address = kObj.address; }
    catch (e) { utilitas.throwError('Invalid keystore file.', 400); }
    if (options.addressOnly) { return; }
    assert(argv.password, 'Invalid password.', 400);
    return crypto.recoverPrivateKey(argv.password, kObj);
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Unlock a Keystore',
    help: [
        '    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]',
        '    --password Use to decrypt the keystore       [STRING  / REQUIRED]',
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
