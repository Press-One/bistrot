'use strict';

const readline = require('readline-sync');
const { } = require('../index');

const func = async (argv, options = {}) => {
    assert(fs.existsSync(argv.keystore), 'File does not exist.');
    let [kFile, kObj] = [fs.readFileSync(argv.keystore, 'utf8')];
    try {
        kObj = JSON.parse(kFile);
        (argv.pubkey = kObj.publickey).length;
    } catch (e) {
        assert(false, 'Invalid keystore file.');
    }
    if (options.pubkeyOnly) { return; }
    while (!argv.password) {
        console.log('Input password to decrypt the keystore.');
        argv.password = readline.question('Password: ', readlineConfig);
    }
    const resp = wallet.recoverPrivateKey(argv.password, kObj);
    return resp;
};

module.exports = {
    func,
    name: 'Unlock a Keystore',
    help: [
        "    --action   Set as 'unlock'                   [STRING  / REQUIRED]",
        '    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | This command will decrypt your keystore and display the       |',
        "    | public key and private key. It's for advanced users only.     |",
        "    | You don't have to do this unless you know what you are doing. |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=unlock \\',
        '              --keystore=keystore.json',
    ],
};
