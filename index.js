'use strict';

const yargs = require('yargs');
const fs = require('fs');
global.config = require('./config');

const getVersion = () => {
    let version = null;
    try {
        version = JSON.parse(fs.readFileSync('./package.json')).version;
    } catch (e) { }
    return version;
};

const randerResult = (result) => {
    const map = { mixinAccount: 'mixinId', mixinId: 'mixinNumber' };
    const json = ['transaction'];
    const out = {};
    for (let i in result || {}) {
        if (i !== 'options') {
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
    console.log('PRESS.one ATM' + (version ? ` (v${version})` : '') + ' usage:'
        + '\n\n* Balance:'
        + '\n    --key      PRESS.one private key          [STRING  / REQUIRED]'
        + '\n    --account  PRESS.one account              [STRING  / REQUIRED]'
        + '\n    --debug    Enable or disable debug mode   [BOOLEAN / OPTIONAL]'
        + '\n    --api      Customize RPC API endpoint     [STRING  / OPTIONAL]'
        + '\n\n* Deposit:'
        + "\n    --action   Set as 'deposit'               [STRING  / REQUIRED]"
        + '\n    --key      PRESS.one private key          [STRING  / REQUIRED]'
        + '\n    --account  PRESS.one account              [STRING  / REQUIRED]'
        + '\n    --amount   Number like xx.xxxx            [STRING  / REQUIRED]'
        + '\n    --email    Email for notification         [STRING  / OPTIONAL]'
        + '\n    --memo     Comment to this transaction    [STRING  / OPTIONAL]'
        + '\n    --debug    Enable or disable verbose log  [BOOLEAN / OPTIONAL]'
        + '\n    --api      Customize RPC API endpoint     [STRING  / OPTIONAL]'
        + '\n\n* Withdraw to Mixin user id:'
        + "\n    --action   Set as 'withdraw'              [STRING  / REQUIRED]"
        + '\n    --key      PRESS.one private key          [STRING  / REQUIRED]'
        + '\n    --account  PRESS.one account              [STRING  / REQUIRED]'
        + '\n    --mx-id    Mixin user id                  [STRING  / REQUIRED]'
        + '\n    --amount   Number like xx.xxxx            [STRING  / REQUIRED]'
        + '\n    --email    Email for notification         [STRING  / OPTIONAL]'
        + '\n    --memo     Comment to this transaction    [STRING  / OPTIONAL]'
        + '\n    --debug    Enable or disable verbose log  [BOOLEAN / OPTIONAL]'
        + '\n    --api      Customize RPC API endpoint     [STRING  / OPTIONAL]'
        + '\n\n* Withdraw to Mixin number (with Mixin user name):'
        + "\n    --action   Set as 'withdraw'              [STRING  / REQUIRED]"
        + '\n    --key      PRESS.one private key          [STRING  / REQUIRED]'
        + '\n    --account  PRESS.one account              [STRING  / REQUIRED]'
        + '\n    --mx-num   Mixin user number              [STRING  / REQUIRED]'
        + '\n    --mx-name  Mixin user name                [STRING  / REQUIRED]'
        + '\n    --amount   Number like xx.xxxx            [STRING  / REQUIRED]'
        + '\n    --email    Email for notification         [STRING  / OPTIONAL]'
        + '\n    --memo     Comment to this transaction    [STRING  / OPTIONAL]'
        + '\n    --debug    Enable or disable verbose log  [BOOLEAN / OPTIONAL]'
        + '\n    --api      Customize RPC API endpoint     [STRING  / OPTIONAL]'
        + '\n\n* Demo:'
        + '\n    $ prs-atm --action=balance \\'
        + '\n              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \\'
        + '\n              --account=ABCDE'
        + '\n    $ prs-atm --action=deposit \\'
        + '\n              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \\'
        + '\n              --account=ABCDE \\'
        + '\n              --amount=12.3456 \\'
        + '\n              --email=abc@def.com'
        // + '\n    $ prs-atm --action=withdraw \\'
        // + '\n              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \\'
        // + '\n              --account=ABCDE \\'
        // + '\n              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \\'
        // + '\n              --amount=12.3456 \\'
        // + '\n              --email=abc@def.com'
        + '\n    $ prs-atm --action=withdraw \\'
        + '\n              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \\'
        + '\n              --account=ABCDE \\'
        + '\n              --mx-num=12345 \\'
        + '\n              --mx-name=ABC \\'
        + '\n              --amount=12.3456 \\'
        + '\n              --email=abc@def.com'
    );
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

config.debug = { 'true': true, 'false': false }[
    String(argv.debug || '').toLowerCase()
];
config.chainApi = argv.api || config.chainApi;
const atm = require('./atm');

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
