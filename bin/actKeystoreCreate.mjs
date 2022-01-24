import { crypto, etc } from '../index.mjs';
import readline from 'readline-sync';

const action = async (argv) => {
    let repeat = argv.password;
    while (!argv.password || !repeat || argv.password !== repeat) {
        console.log('Input password to encrypt the keystore.');
        argv.password = readline.question('New password: ', argv.readlineConf);
        repeat = readline.question('Repeat password: ', argv.readlineConf);
        if (argv.password !== repeat) {
            console.log('Passwords do not match.');
        }
    }
    const result = await crypto.createKeystore(
        String(argv.password || ''), argv.pvtkey,
    );
    if (argv.dump) {
        await etc.dumpFile(argv.dump, JSON.stringify(result), {
            overwrite: argv.force,
        });
    }
    return result;
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Create a new Keystore (can also import keys)',
    help: [
        '    --password Use to encrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   Import existing private key       [STRING  / OPTIONAL]',
        '    --dump     Save keystore to a JSON file      [STRING  / OPTIONAL]',
    ],
    example: [
        {
            title: 'creating a new keystore',
            args: {
                dump: true,
            },
        },
        {
            title: 'creating a keystore with existing keys',
            args: {
                pvtkey: true,
                dump: true,
            },
        },
    ],
};
