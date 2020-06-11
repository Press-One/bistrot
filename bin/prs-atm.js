#!/usr/bin/env node

'use strict';

const { utilitas } = require('utilitas');
const readline = require('readline-sync');
const table = require('table').table;
const yargs = require('yargs');
const fs = require('fs');

const getVersion = () => {
    let version = null;
    try {
        version = JSON.parse(fs.readFileSync('./package.json')).version;
    } catch (e) { }
    return version;
};

const toBoolean = (str) => {
    return { 'true': true, 'false': false }[String(str || '').toLowerCase()];
};

const argv = yargs.default({ action: 'help' }).help(false).argv;

global.chainConfig = {
    rpcApi: argv.rpcapi || undefined,
    chainApi: argv.chainapi || undefined,
    overwrite: toBoolean(argv.force),
    json: toBoolean(argv.json),
    debug: toBoolean(argv.debug),
};

argv.action = String(argv.action || '');
const actFile = `./act${(argv.action[0] || '').toUpperCase(
)}${argv.action.slice(1).toLowerCase()}`;

try {
    utilitas.assert(fs.existsSync(`${actFile}.js`), 'Unknown action.');
    const mod = require(actFile);
} catch (err) {
    if (global.chainConfig.debug) {
        throw err;
    }
    return console.error('Error:', err.message);
}

console.log(actFile);

return;





const assert = require('assert');

const rCnf = { hideEchoBack: true, mask: '' };

const defTblConf = { table: { KeyValue: true } };





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
            // if (!global.chainConfig.debug && verbose.includes(i)) {
            if (verbose.includes(j)) {
                continue;
            } else if (json.includes(j)) {
                result[i][j] = JSON.stringify(result[i][j]);
            }
            out[i][map[j] ? map[j] : j] = result[i][j];
        }
    }
    out = deep ? out : out[0];
    if (!global.chainConfig.json && options.table) {
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
        console.log(global.chainConfig.json ? utilitas.prettyJson(out) : out);
    };
    return out;
};

const help = () => {
    let version = getVersion();
    console.log([
        `PRESS.one ATM ${version ? `(v${version})` : ''} usage:`,
        '',

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





const { account, database, finance, mixin, pacman, producer, prsc, sushitrain, tablexxxxx, atm, ballot, etc, helper, mission, statement, wallet } = require('../index');

(async () => {
    try {
        switch ((argv.action = String(argv.action || '').toLowerCase())) {
            case 'keystore':
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
                if (!global.chainConfig.json
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
                if (global.chainConfig.json) {
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
                if (!global.chainConfig.json
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
                        overwrite: global.chainConfig.overwrite,
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
                        overwrite: global.chainConfig.overwrite,
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
                        overwrite: global.chainConfig.overwrite,
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
