'use strict';

const { wallet, etc } = require('..');
const readline = require('readline-sync');

const func = async (argv) => {
    let repeat = argv.password;
    while (!argv.password || !repeat || argv.password !== repeat) {
        console.log('Input password to encrypt the keystore.');
        argv.password = readline.question('New password: ', argv.readlineConf);
        repeat = readline.question('Repeat password: ', argv.readlineConf);
        if (argv.password !== repeat) {
            console.log('Passwords do not match.');
        }
    }
    const result = await wallet.createKeystore(
        String(argv.password || ''), argv.pubkey, argv.pvtkey,
    );
    if (argv.dump) {
        await etc.dumpFile(argv.dump, JSON.stringify(result), {
            overwrite: argv.force,
        });
    }
    return result;
};

module.exports = {
    func,
    name: 'Create a new Keystore / Import keys to a new Keystore',
    help: [
        '    --password Use to encrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   Import existing public key        [STRING  / OPTIONAL]',
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
                pubkey: true,
                pvtkey: true,
                dump: true,
            },
        },
    ],
};
