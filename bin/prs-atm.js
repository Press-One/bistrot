#!/usr/bin/env node

'use strict';

const readline = require('readline-sync');
const assert = require('assert');
const yargs = require('yargs');
const fs = require('fs');

const rCnf = { hideEchoBack: true, mask: '' };

const getVersion = () => {
    let version = null;
    try {
        version = JSON.parse(fs.readFileSync('./package.json')).version;
    } catch (e) { }
    return version;
};

const unlockKeystore = () => {
    assert(fs.existsSync(argv.keystore), 'File does not exist.');
    let [kFile, kObj] = [fs.readFileSync(argv.keystore, 'utf8')];
    try {
        kObj = JSON.parse(kFile);
    } catch (e) {
        assert(false, 'Invalid keystore file.');
    }
    while (!argv.password) {
        console.log('Input password to decrypt the keystore.');
        argv.password = readline.question('Password: ', rCnf);
    }
    const result = wallet.recoverPrivateKey(argv.password, kObj);
    argv.pvtkey = result.privatekey;
    return result;
};

const randerResult = (result) => {
    const map = { mixinAccount: 'mixinId', mixinId: 'mixinNumber' };
    const verbose = ['transaction', 'options'];
    const json = ['transaction'];
    const out = {};
    for (let i in result || {}) {
        // if (!global.prsAtmConfig.debug && verbose.includes(i)) {
        if (verbose.includes(i)) {
            continue;
        } else {
            const oi = map[i] ? map[i] : i;
            if (json.includes(i)) {
                result[i] = JSON.stringify(result[i]);
            }
            out[oi] = result[i];
        }
    }
    console.log(out);
};

const help = () => {
    let version = getVersion();
    console.log([
        `PRESS.one ATM ${version ? `(v${version})` : ''} usage:`,
        '',
        '',
        '* Keystore:',
        '',
        "    --action   Set as 'keystore'                 [STRING  / REQUIRED]",
        '    --password Use to encrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   Import existing public key        [STRING  / OPTIONAL]',
        '    --pvtkey   Import existing private key       [STRING  / OPTIONAL]',
        '    --dump     Save keystore to a JSON file      [STRING  / OPTIONAL]',
        '',
        '    > Example of creating a new keystore:',
        '    $ prs-atm --action=keystore \\',
        '              --dump=keystore.json',
        '',
        '    > Example of creating a keystore with existing keys:',
        '    $ prs-atm --action=keystore \\',
        '              --pubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \\',
        '              --pvtkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \\',
        '              --dump=keystore.json',
        '',
        '',
        '* Unlock:',
        '',
        "    --action   Set as 'unlock'                   [STRING  / REQUIRED]",
        '    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm --action=unlock \\',
        '              --keystore=keystore.json',
        '    ┌---------------------------------------------------------------┐',
        '    | This command will decrypt your keystore and display the       |',
        "    | public key and private key. It's for advanced users only.     |",
        "    | You don't have to do this unless you know what you are doing. |",
        '    └---------------------------------------------------------------┘',
        '',
        '',
        '* Balance:',
        '',
        "    --action   Set as 'balance'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=balance \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
        '',
        '',
        '* Deposit:',
        '',
        "    --action   Set as 'deposit'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 2. After successful execution, you will get a URL.            |',
        '    | 3. Open this URL in your browser.                             |',
        '    | 4. Scan the QR code with Mixin to complete the payment.       |',
        '    | 5. You have to complete the payment within `'
        + `${atm.paymentTimeout}\` minutes.      |`,
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=deposit \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --keystore=keystore.json \\',
        '              --email=abc@def.com',
        '',
        '',
        '* Withdraw:',
        '',
        "    --action   Set as 'withdraw'                 [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --mx-id    Mixin user id (UUID)              [STRING  / OPTIONAL]',
        '    --mx-num   Mixin user number                 [STRING  / OPTIONAL]',
        '    --mx-name  Mixin user name                   [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 2. `mx-num with mx-name` or `mx-id` must be provided.         |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of Withdrawing to Mixin number (with Mixin user name):',
        '    $ prs-atm --action=withdraw \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --keystore=keystore.json \\',
        '              --mx-num=12345 \\',
        '              --mx-name=ABC \\',
        '              --email=abc@def.com',
        '',
        '    > Example of Withdrawing to Mixin user id:',
        '    $ prs-atm --action=withdraw \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --keystore=keystore.json \\',
        '              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \\',
        '              --email=abc@def.com',
        '',
        '',
        '* Advanced:',
        '',
        '    --debug    Enable or disable debug mode      [BOOLEAN / OPTIONAL]',
        '    --api      Customize RPC API endpoint        [STRING  / OPTIONAL]',
        '',
        '',
        '* Security:',
        '',
        '    Using passwords or private keys on the command line interface can',
        "    be insecure. In most cases you don't need to provide passwords or",
        '    private keys in parameters. The program will request sensitive ',
        '    information in a secure way.',
        '',
    ].join('\n'));
};

const argv = yargs.default({
    'action': 'help',
    'key': null,
    'account': null,
    'mx-id': null,
    'mx-num': null,
    'mx-name': null,
    'amount': null,
    'email': null,
    'memo': null,
    'debug': null,
    'api': null,
}).help(false).argv;

global.prsAtmConfig = {
    chainApi: argv.api || undefined,
    debug: { 'true': true, 'false': false }[
        String(argv.debug || '').toLowerCase()
    ],
};
const { atm, wallet } = require('../main');

(async () => {
    try {
        switch ((argv.action = String(argv.action || '').toLowerCase())) {
            case 'keystore':
                let repeat = argv.password;
                while (!argv.password || !repeat || argv.password !== repeat) {
                    console.log('Input password to encrypt the keystore.');
                    argv.password = readline.question('New password: ', rCnf);
                    repeat = readline.question('Repeat password: ', rCnf);
                    if (argv.password !== repeat) {
                        console.log('Passwords do not match.');
                    }
                }
                const cResult = await wallet.createKeystore(
                    String(argv.password || ''),
                    argv.pubkey,
                    argv.pvtkey,
                );
                if (argv.dump) {
                    assert(!fs.existsSync(argv.dump), 'File already exists.');
                    fs.writeFileSync(argv.dump, JSON.stringify(cResult));
                }
                return randerResult(cResult);
            case 'unlock':
                const rResult = unlockKeystore();
                return randerResult(rResult);
            case 'balance':
                argv.keystore && unlockKeystore();
                const bResult = await atm.getBalance(
                    argv.pvtkey,
                    argv.account
                );
                return randerResult(bResult);
            case 'deposit':
                argv.keystore && unlockKeystore();
                const dResult = await atm.deposit(
                    argv.pvtkey,
                    argv.account,
                    argv.email,
                    argv.amount,
                    argv.memo
                )
                return randerResult(dResult);
            case 'withdraw':
                argv.keystore && unlockKeystore();
                const wResult = await atm.withdraw(
                    argv.pvtkey,
                    argv.account,
                    argv['mx-id'],
                    argv['mx-num'],
                    argv['mx-name'],
                    argv.email,
                    argv.amount,
                    argv.memo
                );
                return randerResult(wResult);
            default:
                assert(
                    !argv.action || argv.action === 'help', 'Unknown action.'
                );
                return help();
        }
    } catch (err) {
        console.log(err.toString());
    }
})();
