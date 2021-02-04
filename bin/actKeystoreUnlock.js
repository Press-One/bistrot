'use strict';

const { utilitas, wallet } = require('..');
const readline = require('readline-sync');
const fs = require('fs');

const func = async (argv, options = {}) => {
    utilitas.assert(fs.existsSync(argv.keystore), 'File does not exist.', 400);
    let [kFile, ko] = [fs.readFileSync(argv.keystore, 'utf8')];
    try {
        ko = JSON.parse(kFile);
        argv.pubkey = ko.publickey;
    } catch (e) {
        utilitas.throwError('Invalid keystore file.', 400);
    }
    if (options.pubkeyOnly) { return; }
    while (!argv.password) {
        console.log('Input password to decrypt the keystore.');
        argv.password = readline.question('Password: ', argv.readlineConf);
    }
    return wallet.recoverPrivateKey(argv.password, ko, { legacy: argv.legacy });
};

module.exports = {
    func,
    name: 'Unlock a Keystore',
    help: [
        '    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --legacy   For legacy PRESS.one keystores    [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. You can use `legacy` to decrypt legacy PRESS.one keystores.|',
        '    └---------------------------------------------------------------┘',
        '    ┌---------------------------------------------------------------┐',
        '    | This command will decrypt your keystore and display the       |',
        "    | public key and private key. It's for advanced users only.     |",
        "    | You don't have to do this unless you know what you are doing. |",
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            keystore: true,
        }
    },
};
