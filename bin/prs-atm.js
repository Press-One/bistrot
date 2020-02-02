#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const fs = require('fs');

const getVersion = () => {
    let version = null;
    try {
        version = JSON.parse(fs.readFileSync('./package.json')).version;
    } catch (e) { }
    return version;
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
        '* Balance:',
        "    --action   Set as 'balance'                  [STRING  / REQUIRED]",
        '    --key      PRESS.one private key             [STRING  / REQUIRED]',
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '* Deposit:',
        "    --action   Set as 'deposit'                  [STRING  / REQUIRED]",
        '    --key      PRESS.one private key             [STRING  / REQUIRED]',
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [STRING  / REQUIRED]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. After successful execution, you will get a URL.            |',
        '    | 2. Open this URL in your browser.                             |',
        '    | 3. Scan the QR code with Mixin to complete the payment.       |',
        '    | 4. You have to complete the payment within `'
        + `${atm.paymentTimeout}\` minutes.      |`,
        '    └---------------------------------------------------------------┘',
        '',
        '* Withdraw to Mixin number (with Mixin user name):',
        "    --action   Set as 'withdraw'                 [STRING  / REQUIRED]",
        '    --key      PRESS.one private key             [STRING  / REQUIRED]',
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --mx-num   Mixin user number                 [STRING  / REQUIRED]',
        '    --mx-name  Mixin user name                   [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [STRING  / REQUIRED]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '',
        '* Withdraw to Mixin user id:',
        "    --action   Set as 'withdraw'                 [STRING  / REQUIRED]",
        '    --key      PRESS.one private key             [STRING  / REQUIRED]',
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --mx-id    Mixin user id (UUID)              [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [STRING  / REQUIRED]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '',
        '* Advanced:',
        '    --debug    Enable or disable debug mode      [BOOLEAN / OPTIONAL]',
        '    --api      Customize RPC API endpoint        [STRING  / OPTIONAL]',
        '',
        '* Demo:',
        '    $ # Balance',
        '    $ prs-atm --action=balance \\',
        '              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \\',
        '              --account=ABCDE',
        '    $ # Deposit',
        '    $ prs-atm --action=deposit \\',
        '              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --email=abc@def.com',
        '    $ # Withdraw to Mixin number(with Mixin user name)',
        '    $ prs-atm --action=withdraw \\',
        '              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \\',
        '              --account=ABCDE \\',
        '              --mx-num=12345 \\',
        '              --mx-name=ABC \\',
        '              --amount=12.3456 \\',
        '              --email=abc@def.com',
        '    $ # Withdraw to Mixin user id',
        '    $ prs-atm --action=withdraw \\',
        '              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \\',
        '              --account=ABCDE \\',
        '              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \\',
        '              --amount=12.3456 \\',
        '              --email=abc@def.com',
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
const atm = require('../main');

(async () => {
    try {
        switch (String(argv.action || '').toLowerCase()) {
            case 'balance':
                const bResult = await atm.getBalance(
                    argv.key,
                    argv.account
                );
                return randerResult(bResult);
            case 'deposit':
                const dResult = await atm.deposit(
                    argv.key,
                    argv.account,
                    argv.email,
                    argv.amount,
                    argv.memo
                )
                return randerResult(dResult);
            case 'withdraw':
                const wResult = await atm.withdraw(
                    argv.key,
                    argv.account,
                    argv['mx-id'],
                    argv['mx-num'],
                    argv['mx-name'],
                    argv.email,
                    argv.amount,
                    argv.memo
                );
                return randerResult(wResult);
            case 'help':
            default:
                return help();
        }
    } catch (err) {
        console.log(err.toString());
    }
})();
