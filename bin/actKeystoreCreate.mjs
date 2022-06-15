import { crypto, etc } from '../index.mjs';

const action = async (argv) => {
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
        '    --password Use to encrypt the keystore       [STRING  / REQUIRED]',
        '    --pvtkey   Import existing private key       [STRING  / OPTIONAL]',
        '    --dump     Save keystore to a JSON file      [STRING  / OPTIONAL]',
    ],
    example: [
        {
            title: 'creating a new keystore',
            args: {
                password: 'nopassword',
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
