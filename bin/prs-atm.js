#!/usr/bin/env node

'use strict';

const readline = require('readline-sync');
const assert = require('assert');
const table = require('table').table;
const yargs = require('yargs');
const fs = require('fs');

const rCnf = { hideEchoBack: true, mask: '' };

const defTblConf = { table: { KeyValue: true } };

const getVersion = () => {
    let version = null;
    try {
        version = JSON.parse(fs.readFileSync('./package.json')).version;
    } catch (e) { }
    return version;
};

const getBoolean = (str) => {
    return { 'true': true, 'false': false }[String(str || '').toLowerCase()];
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
    argv.pubkey = result.publickey;
    argv.pvtkey = result.privatekey;
    return result;
};

const randerResult = (result, options) => {
    options = options || {};
    const map = {
        mixinAccount: 'mixinId',
        mixinId: 'mixinNumber',
        transactions_trx_id: 'transaction_id',
        transactions_trx_transaction_actions_account: 'counter',
        transactions_trx_transaction_actions_data_type: 'description',
        transactions_trx_transaction_actions_data__from_user: 'from',
        transactions_trx_transaction_actions_data__to_user: 'to',
        transactions_trx_transaction_actions_data__amount_quantity__amt: 'amount',
        transactions_trx_transaction_actions_data__amount_quantity__cur: 'currency',
        transactions_trx_transaction_actions_data_mixin_trace_id: 'mixin_trace_id',
    };
    const verbose = [
        'transaction',
        'options',
        'transactions_trx_transaction_actions_name',
        'transactions_trx_transaction_actions_data_id',
        'transactions_trx_transaction_actions_data_user_address',
        'transactions_trx_transaction_actions_data_oracleservice',
        'transactions_trx_transaction_actions_data_meta',
        'transactions_trx_transaction_actions_data_data',
        'previous',
        'block',
        'transactions_trx_transaction_actions_data__dp_wd_req__id',
        'transactions_trx_transaction_actions_data__sync_auth__result',
    ];
    const json = ['transaction'];
    const deep = utility.isArray(result);
    let out = [];
    result = deep ? result : [result];
    for (let i in result) {
        out[i] = {};
        for (let j in result[i]) {
            // if (!global.prsAtmConfig.debug && verbose.includes(i)) {
            if (verbose.includes(j)) {
                continue;
            } else if (json.includes(j)) {
                result[i][j] = JSON.stringify(result[i][j]);
            }
            out[i][map[j] ? map[j] : j] = result[i][j];
        }
    }
    out = deep ? out : out[0];
    if (!global.prsAtmConfig.json && options.table) {
        const data = [];
        if (deep && options.table.columns) {
            data.push(options.table.columns.map(x => {
                return x.toUpperCase();
            }));
            out.map(x => {
                const row = [];
                for (let i of options.table.columns) {
                    row.push(x[i]);
                }
                data.push(row);
            });
        } else if (!deep && options.table.KeyValue) {
            for (let i in out) {
                data.push([i.toUpperCase(), [
                    'number', 'string', 'boolean'
                ].includes(typeof out[i]) ? out[i] : JSON.stringify(out[i])]);
            }
            options.table.config = Object.assign({
                columns: { 0: { width: 20 }, 1: { width: 53 } }
            }, options.table.config || {});
        }
        out = table(data, options.table.config);
    }
    if (!options.returnOnly) {
        console.log(global.prsAtmConfig.json ? atm.json(out) : out);
    };
    return out;
};

const help = () => {
    let version = getVersion();
    console.log([
        `PRESS.one ATM ${version ? `(v${version})` : ''} usage:`,
        '',
        '',
        '* Create a new Keystore / Import keys to a new Keystore:',
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
        '* Unlock a Keystore:',
        '',
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
        '',
        '',
        '* Update Authorization:',
        '',
        "    --action   Set as 'auth'                     [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |',
        '    | 2. You have to execute this cmd to activate your new account. |',
        '    | 3. This command only needs to be executed one time.           |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=auth \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
        '',
        '',
        '* Claim Rewards:',
        '',
        "    --action   Set as 'reward'                   [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 2. You can only claim your reward once a day.                 |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=reward \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
        '',
        '',
        '* Check Balance:',
        '',
        "    --action   Set as 'balance'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm --action=balance \\',
        '              --account=ABCDE',
        '',
        '',
        '* Check Account:',
        '',
        "    --action   Set as 'account'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm --action=account \\',
        '              --account=ABCDE',
        '',
        '',
        '* Check PRS Chain Information:',
        '',
        "    --action   Set as 'info'                     [STRING  / REQUIRED]",
        '',
        '    > Example:',
        '    $ prs-atm --action=info',
        '',
        '',
        '* Check Statement:',
        '',
        "    --action   Set as 'statement'                [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --time     Timestamp for paging              [STRING  / OPTIONAL]',
        "    --type     Can be 'INCOME', 'EXPENSE', 'ALL' [STRING  / OPTIONAL]",
        '    --count    Page size                         [NUMBER  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `type` is 'ALL'.                                   |",
        "    | 2. Default `count` is 100.                                    |",
        "    | 3. Set `time` as `timestamp` of last item to get next page.   |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=statement \\',
        '              --account=ABCDE',
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
        '* Withdrawal:',
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
        '    | 3. Execute the `auth` command before the first withdrawal.    |',
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
        '    --json     Printing the result as JSON       [BOOLEAN / OPTIONAL]',
        '    --debug    Enable or disable debug mode      [BOOLEAN / OPTIONAL]',
        '    --rpcapi   Customize RPC-API endpoint        [STRING  / OPTIONAL]',
        '    --chainapi Customize Chain-API endpoint      [STRING  / OPTIONAL]',
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
    'time': null,
    'type': null,
    'count': null,
    'json': null,
    'debug': null,
    'rpcapi': null,
    'chainapi': null,
}).help(false).argv;

global.prsAtmConfig = {
    rpcApi: argv.rpcapi || undefined,
    chainApi: argv.chainApi || undefined,
    json: getBoolean(argv.json),
    debug: getBoolean(argv.debug),
};
const { atm, wallet, ballot, utility, statement } = require('../main');

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
                return randerResult(cResult, defTblConf);
            case 'unlock':
                const rResult = unlockKeystore();
                return randerResult(rResult, defTblConf);
            case 'auth':
                argv.keystore && unlockKeystore();
                const uResult = await atm.updateAuth(
                    argv.account,
                    argv.pubkey,
                    argv.pvtkey,
                );
                return randerResult(uResult, defTblConf);
            case 'reward':
                argv.keystore && unlockKeystore();
                const lResult = await atm.claimRewards(
                    argv.account,
                    argv.pvtkey,
                );
                return randerResult(lResult, defTblConf);
            case 'balance':
                const bResult = await atm.getBalance(argv.account);
                return randerResult(bResult, defTblConf);
            case 'account':
                const oResult = await atm.getAccount(argv.account);
                return randerResult(oResult, defTblConf);
            case 'info':
                const iResult = await atm.getInfo();
                return randerResult(iResult, defTblConf);
            case 'statement':
                const sResult = await statement.query(
                    argv.account,
                    argv.time,
                    argv.type,
                    argv.count,
                );
                return randerResult(sResult, {
                    table: {
                        columns: [
                            'timestamp',
                            'block_num',
                            'counter',
                            'type',
                            'description',
                            'from',
                            'to',
                            'amount',
                            'currency',
                        ],
                        config: {
                            singleLine: true,
                            columns: {
                                0: { alignment: 'right' },
                                1: { alignment: 'right' },
                                2: { alignment: 'right' },
                                3: { alignment: 'right' },
                                4: { alignment: 'right' },
                                5: { alignment: 'right' },
                                6: { alignment: 'right' },
                                7: { alignment: 'right' },
                                8: { alignment: 'right' },
                            }
                        }
                    }
                });
            case 'deposit':
                argv.keystore && unlockKeystore();
                const dResult = await atm.deposit(
                    argv.pvtkey,
                    argv.account,
                    argv.email,
                    argv.amount,
                    argv.memo
                );
                if (!global.prsAtmConfig.json && dResult && dResult.paymentUrl) {
                    console.log(`\nOpen this URL in your browser:`
                        + `\n\n${dResult.paymentUrl}\n`);
                }
                return randerResult(dResult, defTblConf);
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
                return randerResult(wResult, defTblConf);
            case 'ballot':
                let aResult = null;
                if (argv.account) {
                    const resp = await ballot.queryByOwner(argv.account);
                    aResult = resp ? [resp] : [];
                } else {
                    aResult = await ballot.queryAll();
                }
                for (let item of aResult) {
                    item.producers = item.producers.join('\n');
                }
                return randerResult(aResult, {
                    table: {
                        columns: [
                            'owner',
                            'proxy',
                            'producers',
                            'staked',
                            'last_vote_weight',
                            'proxied_vote_weight',
                            'is_proxy',
                        ],
                        config: {
                            singleLine: true,
                            columns: {
                                0: { alignment: 'right' },
                                1: { alignment: 'right' },
                                2: { alignment: 'right' },
                                3: { alignment: 'right' },
                                4: { alignment: 'right' },
                                5: { alignment: 'right' },
                                6: { alignment: 'right' },
                            }
                        }
                    }
                });
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
