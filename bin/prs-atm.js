#!/usr/bin/env node

'use strict';

const readline = require('readline-sync');
const utilitas = require('utilitas');
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

const getArray = (str) => {
    const arr = String(str || '').split(/[,;\ ]/);
    const result = [];
    arr.map(x => {
        if ((x = x.trim())) {
            result.push(x);
        }
    });
    return result;
};

const unlockKeystore = (options) => {
    options = options || {};
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
    const deep = utilitas.isArray(result);
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
        out = data && data.length ? table(data, options.table.config) : '';
    }
    if (!options.returnOnly) {
        console.log(global.prsAtmConfig.json ? utilitas.prettyJson(out) : out);
    };
    return out;
};

const help = () => {
    let version = getVersion();
    console.log([
        `PRESS.one ATM ${version ? `(v${version})` : ''} usage:`,
        '',
        '=====================================================================',
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
        '=====================================================================',
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
        '=====================================================================',
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
        '=====================================================================',
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
        '=====================================================================',
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
        '=====================================================================',
        '',
        '* Check an Account:',
        '',
        "    --action   Set as 'account'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm --action=account \\',
        '              --account=ABCDE',
        '',
        '=====================================================================',
        '',
        '* Open an Account:',
        '',
        "    --action   Set as 'openaccount'              [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pubkey` must be provided.       |',
        '    | 2. After successful execution, you will get a URL.            |',
        '    | 3. Open this URL in your browser.                             |',
        '    | 4. Scan the QR code with Mixin to complete the payment.       |',
        '    | 5. You will receive further notifications via Mixin.          |',
        '    | 6. It will cost 4 PRS (2 for RAM, 1 for NET, 1 for CPU).      |',
        '    | 7. Registration fee is NON-REFUNDABLE, EVEN IF IT FAILS.      |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Standard Account Naming Conventions -------------------------┐',
        '    | ■ Can only contain the characters                             |',
        '    |   `.abcdefghijklmnopqrstuvwxyz12345`.                         |',
        '    |   `a-z` (lowercase), `1-5` and `.` (period)                   |',
        '    | ■ Must start with a letter                                    |',
        '    | ■ Must be 12 characters                                       |',
        '    | ? https://eosio-cpp.readme.io/v1.1.0/docs/naming-conventions  |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=openaccount \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
        '',
        // '=====================================================================',
        // '',
        // '* Create an Account:',
        // '',
        // "    --action   Set as 'createaccount'            [STRING  / REQUIRED]",
        // '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        // '    --naccount New PRESS.one account             [STRING  / REQUIRED]',
        // '    --npubkey  Public key of the new account     [STRING  / REQUIRED]',
        // '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        // '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        // '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        // '    ┌---------------------------------------------------------------┐',
        // '    | 0. DO NOT USE THIS FEATURE CURRENTLY.                         | ',
        // '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        // '    └---------------------------------------------------------------┘',
        // '',
        // '    > Example:',
        // '    $ prs-atm --action=createaccount \\',
        // '              --account=ABCDE \\',
        // '              --naccount=FIJKL \\',
        // '              --npubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \\',
        // '              --keystore=keystore.json',
        // '',
        '=====================================================================',
        '',
        '* Register as a Producer:',
        '',
        "    --action   Set as 'regproducer'              [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --url      URL where info about producer     [STRING  / OPTIONAL]',
        '    --location Relative location for scheduling  [INTEGER / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pubkey` must be provided.       |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=regproducer \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
        '',
        '=====================================================================',
        '',
        '* Check PRS-chain Information:',
        '',
        "    --action   Set as 'info'                     [STRING  / REQUIRED]",
        '    ┌---------------------------------------------------------------┐',
        '    | 1. You can use `rpcapi` param to check the specific PRS-node. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of checking global PRS-chain Information:',
        '    $ prs-atm --action=info',
        '',
        '    > Example of checking specific PRS-node Information:',
        '    $ prs-atm --action=info \\',
        '              --rpcapi=http://http://127.0.0.1/:8888',
        '',
        '=====================================================================',
        '',
        '* Check Producers Information:',
        '',
        "    --action   Set as 'producers'                [STRING  / REQUIRED]",
        '',
        '    > Example:',
        '    $ prs-atm --action=producers',
        '',
        '=====================================================================',
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
        '=====================================================================',
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
        + `${atm.paymentTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 6. SCANNING AN EXPIRED QR CODE WILL RESULT IN LOST MONEY.     |',
        '    | 7. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 8. Finish, `cancel` or timeout a current trx before request.  |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=deposit \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --keystore=keystore.json \\',
        '              --email=abc@def.com',
        '',
        '=====================================================================',
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
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 2. One of `mx-num` or `mx-id` must be provided.               |',
        '    | 3. Execute the `auth` command before the first withdrawal.    |',
        '    | 4. You can only withdraw to the original MX payment accounts. |',
        '    | 5. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 6. Finish, `cancel` or timeout a current trx before request.  |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of Withdrawing to Mixin number (with Mixin user name):',
        '    $ prs-atm --action=withdraw \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --keystore=keystore.json \\',
        '              --mx-num=12345 \\',
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
        '=====================================================================',
        '',
        '* Cancel a depositing payment request:',
        '',
        "    --action   Set as 'cancel'                   [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 2. Cancel a current trx by this cmd before issuing a new one. |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=cancel \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
        '',
        '=====================================================================',
        '',
        '* Check Voting Information:',
        '',
        "    --action   Set as 'ballot'                   [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / OPTIONAL]',
        '',
        '    > Example of checking global voting information:',
        '    $ prs-atm --action=ballot',
        '',
        "    > Example of checking account's voting information:",
        '    $ prs-atm --action=ballot \\',
        '              --account=ABCDE',
        '',
        '=====================================================================',
        '',
        '* Vote or Revoke Voting for Producers:',
        '',
        "    --action   Set as 'vote'                     [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / OPTIONAL]',
        '    --add      Add BP to list of voted producers [STRING  / OPTIONAL]',
        '    --remove   Del BP to list of voted producers [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. One of `add` or `remove` must be provided.                 |',
        "    | 2. `add` and `remove` can be a list split by ',' or ';'.      |",
        "    | 3. Use `ballot` cmd to check info brfore and after voting.    |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=vote \\',
        '              --account=ABCDE \\',
        '              --add=bp1,bp2 \\',
        '              --remove=bp3,bp4 \\',
        '              --keystore=keystore.json',
        '',
        '=====================================================================',
        '',
        '* Delegate/Undelegate CPU and/or Network Bandwidth:',
        '',
        "    --action   Set as 'deposit' or 'undelegate'  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        "    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]",
        '    --cpu      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --net      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `receiver` is current `account` (pvtkey holder).   |",
        '    | 2. One of `cpu` or `net` must be provided.                    |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of delegating CPU and NET:',
        '    $ prs-atm --action=delegate \\',
        '              --account=ABCDE \\',
        '              --receiver=FIJKL \\',
        '              --cpu=12.3456 \\',
        '              --net=12.3456 \\',
        '              --keystore=keystore.json',
        '',
        '    > Example of undelegating CPU and NET:',
        '    $ prs-atm --action=undelegate \\',
        '              --account=ABCDE \\',
        '              --receiver=FIJKL \\',
        '              --cpu=12.3456 \\',
        '              --net=12.3456 \\',
        '              --keystore=keystore.json',
        '',
        '=====================================================================',
        '',
        '* Generate the `genesis.json` file:',
        '',
        "    --action   Set as 'genesis'                  [STRING  / REQUIRED]",
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm --action=genesis \\',
        '              --path=.',
        '',
        '=====================================================================',
        '',
        '* Generate the `config.ini` file:',
        '',
        "    --action   Set as 'config'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --agent    Agent name for your PRS-node      [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Default `agent` is current `account` (pvtkey holder).      |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=config \\',
        '              --account=ABCDE \\',
        '              --path=. \\',
        '              --keystore=keystore.json',
        '',
        '=====================================================================',
        '',
        '* Generate the `runservice.sh` file:',
        '',
        "    --action   Set as 'runsrv'                   [STRING  / REQUIRED]",
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '',
        '    > Example:',
        '    $ prs-atm --action=runsrv \\',
        '              --path=.',
        '',
        '=====================================================================',
        '',
        '* Advanced:',
        '',
        '    --json     Printing the result as JSON       [BOOLEAN / OPTIONAL]',
        '    --force    Force overwrite existing file     [BOOLEAN / OPTIONAL]',
        '    --debug    Enable or disable debug mode      [BOOLEAN / OPTIONAL]',
        '    --rpcapi   Customize RPC-API endpoint        [STRING  / OPTIONAL]',
        '    --chainapi Customize Chain-API endpoint      [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Using param `force` will increase the risk of losing data. |',
        '    └---------------------------------------------------------------┘',
        '',
        '=====================================================================',
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
    action: 'help',
    key: null,
    account: null,
    'mx-id': null,
    'mx-num': null,
    amount: null,
    email: null,
    memo: null,
    time: null,
    type: null,
    count: null,
    add: null,
    remove: null,
    receiver: null,
    naccount: null,
    npubkey: null,
    cpu: null,
    net: null,
    url: null,
    location: null,
    json: null,
    path: null,
    force: null,
    debug: null,
    rpcapi: null,
    chainapi: null,
}).help(false).argv;

global.prsAtmConfig = {
    rpcApi: argv.rpcapi || undefined,
    chainApi: argv.chainapi || undefined,
    overwrite: getBoolean(argv.force),
    json: getBoolean(argv.json),
    debug: getBoolean(argv.debug),
};

const { atm, wallet, ballot, account, statement, etc } = require('../main');

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
                    await etc.dumpFile(argv.dump, JSON.stringify(cResult), {
                        overwrite: global.prsAtmConfig.overwrite,
                    });
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
                return randerResult(oResult, {
                    table: {
                        KeyValue: true,
                        config: {
                            columns: { 0: { width: 24 }, 1: { width: 49 } }
                        }
                    }
                });
            case 'openaccount':
                argv.keystore && unlockKeystore({ pubkeyOnly: true });
                const mResult = await account.openAccount(
                    argv.account,
                    argv.pubkey
                );
                if (!global.prsAtmConfig.json
                    && mResult && mResult.paymentUrl) {
                    console.log(`\nOpen this URL in your browser:`
                        + `\n\n${mResult.paymentUrl}\n`);
                }
                return randerResult(mResult, defTblConf);
            case 'createaccount':
                argv.keystore && unlockKeystore();
                const kResult = await account.createAccount(
                    argv.account, argv.pvtkey, argv.naccount, argv.npubkey
                );
                return randerResult(kResult, defTblConf);
            case 'regproducer':
                argv.keystore && unlockKeystore();
                const qResult = await account.regProducer(
                    argv.account,
                    argv.url,
                    argv.location,
                    argv.pubkey,
                    argv.pvtkey,
                );
                return randerResult(qResult, defTblConf);
            case 'info':
                const iResult = await atm.getInfo();
                return randerResult(iResult, {
                    table: {
                        KeyValue: true,
                        config: {
                            columns: { 0: { width: 27 }, 1: { width: 64 } }
                        }
                    }
                });
            case 'producers':
                const fResult = await atm.getProducers();
                if (global.prsAtmConfig.json) {
                    return console.log(utilitas.prettyJson(fResult));
                }
                fResult.rows.map(x => {
                    x.total_votes = x.total_votes.replace(/\.0*$/, '');
                });
                randerResult({
                    total_producer_vote_weight:
                        fResult.total_producer_vote_weight
                }, {
                    table: {
                        KeyValue: true,
                        config: {
                            columns: { 0: { width: 26 }, 1: { width: 47 } }
                        }
                    }
                });
                return randerResult(fResult.rows, {
                    table: {
                        columns: [
                            'owner',
                            'total_votes',
                            'producer_key',
                            'is_active',
                            'unpaid_blocks',
                            'last_claim_time',
                            'location',
                        ],
                        config: {
                            singleLine: true,
                            columns: {
                                0: { alignment: 'right' },
                                1: { alignment: 'right' },
                                2: { alignment: 'right' },
                                3: { alignment: 'right' },
                                5: { alignment: 'right' },
                                6: { alignment: 'right' },
                                7: { alignment: 'right' },
                            }
                        }
                    }
                });
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
                if (!global.prsAtmConfig.json
                    && dResult && dResult.paymentUrl) {
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
                    argv.email,
                    argv.amount,
                    argv.memo
                );
                return randerResult(wResult, defTblConf);
            case 'cancel':
                argv.keystore && unlockKeystore();
                const pResult = await atm.cancelPaymentRequest(
                    argv.pvtkey,
                    argv.account,
                    argv.memo
                );
                return randerResult(pResult, defTblConf);
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
            case 'vote':
                argv.keystore && unlockKeystore();
                const vResult = await ballot.vote(
                    argv.account,
                    getArray(argv.add),
                    getArray(argv.remove),
                    argv.pvtkey
                );
                return randerResult(vResult, defTblConf);
            case 'delegate':
                argv.keystore && unlockKeystore();
                const eResult = await atm.delegateBw(
                    argv.account,
                    argv.receiver,
                    argv.cpu,
                    argv.net,
                    argv.pvtkey
                );
                return randerResult(eResult, defTblConf);
            case 'undelegate':
                argv.keystore && unlockKeystore();
                const nResult = await atm.undelegateBw(
                    argv.account,
                    argv.receiver,
                    argv.cpu,
                    argv.net,
                    argv.pvtkey
                );
                return randerResult(nResult, defTblConf);
            case 'genesis':
                const gResult = await etc.buildGenesis();
                if (argv.path) {
                    await etc.dumpFile(`${argv.path}/genesis.json`, gResult, {
                        overwrite: global.prsAtmConfig.overwrite,
                    });
                }
                return randerResult(JSON.parse(gResult), {
                    table: {
                        KeyValue: true,
                        config: {
                            columns: { 0: { width: 21 }, 1: { width: 64 } }
                        }
                    }
                });
            case 'config':
                argv.keystore && unlockKeystore();
                const content = await etc.buildConfig(
                    argv.account,
                    argv.agent,
                    argv.pubkey,
                    argv.pvtkey,
                );
                if (argv.path) {
                    await etc.dumpFile(`${argv.path}/config.ini`, content, {
                        overwrite: global.prsAtmConfig.overwrite,
                    });
                }
                const hResult = {};
                content.split(/\r|\n/).map(x => {
                    const [key, value] = [
                        x.replace(/([^=]*)=(.*)/, '$1').trim(),
                        x.replace(/([^=]*)=(.*)/, '$2').trim(
                        ).replace(/^[\ \'\"]*|[\ \'\"]*$/g, '').trim()
                    ];
                    if ((key || value)
                        && key.toLocaleLowerCase() !== 'signature-provider') {
                        hResult[key] = value;
                    }
                });
                return randerResult(hResult, {
                    table: {
                        KeyValue: true,
                        config: {
                            columns: { 0: { width: 23 }, 1: { width: 50 } }
                        }
                    }
                });
            case 'runsrv':
                const jResult = await etc.buildRunservice();
                if (argv.path) {
                    await etc.dumpFile(`${argv.path}/runservice.sh`, jResult, {
                        overwrite: global.prsAtmConfig.overwrite,
                        executable: true,
                    });
                }
                return console.log(`\n${jResult}`);
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
