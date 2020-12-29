#!/usr/bin/env node

'use strict';

const { utilitas, config, keychain, system } = require('..');
const table = require('table').table;
const argv = require('yargs').help(false).argv;
const fs = require('fs');

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
    'transactions_trx_transaction_actions_data_data_topic',
    'previous',
    'block',
    'transactions_trx_transaction_actions_data__dp_wd_req__id',
    'transactions_trx_transaction_actions_data__sync_auth__result',
];

const json = ['transaction'];

const toBoolean = (input) => {
    const str = String(input || '').toLowerCase();
    return utilitas.isUndefined(input) ? undefined
        : (['true', 'yes', '1', ''].includes(str));
};

const toArray = (input) => {
    const arr = String(input || '').split(/[,;\ ]/);
    const result = [];
    arr.map(x => { if ((x = x.trim())) { result.push(x); } });
    return result;
};

const unlockKeystore = async (options = {}) => {
    if (argv.keystore) {
        const result = await require('./actUnlock').func(argv, options);
        argv.pubkey = result.publickey;
        argv.pvtkey = result.privatekey;
        return;
    }
    try {
        const { config } = await keychain.get(argv.account, argv.prmsn, {
            unique: true, unlock: true, password: argv.password
        });
        const keystore = Object.values(config && config.keystores || {})[0];
        if (keystore) {
            argv.email = argv.email || config.email;
            argv.account = argv.account || keystore.account;
            argv.pubkey = keystore.keystore.publickey;
            argv.pvtkey = keystore.keystore.privatekey;
        }
    } catch (err) { }
};

const randerResult = (result, options = { table: { KeyValue: true } }) => {
    if (utilitas.isUndefined(result)) { return; }
    const deep = Array.isArray(result);
    options = utilitas.isFunction(options) ? options(argv) : options;
    let out = [];
    result = deep ? result : [result];
    for (let i in result) {
        out[i] = {};
        for (let j in result[i]) {
            // if (!global.chainConfig.debug && verbose.includes(i)) {
            if (!options.renderAll && verbose.includes(j)) {
                continue;
            } else if (json.includes(j)) {
                result[i][j] = JSON.stringify(result[i][j]);
            }
            out[i][map[j] ? map[j] : j] = result[i][j];
        }
    }
    out = deep ? out : out[0];
    if (!argv.json && options.table) {
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
        console.log(argv.json ? utilitas.prettyJson(out) : out);
    };
    return out;
};

['add', 'remove'].map(i => {
    argv[i] = toArray(argv[i]);
});
[
    'trxonly', 'help', 'detail', 'force', 'json',
    'spdtest', 'debug', 'secret', 'delete', 'savepswd', 'dryrun',
].map(i => { argv[i] = toBoolean(argv[i]); });
let command = String(argv._.shift() || 'help');
if (argv.help) { argv.command = command; command = 'help'; }
const errNotFound = `Command not found: \`${command}\`.`;
const actFile = `${__dirname}/act${(command[0] || '').toUpperCase(
)}${command.slice(1).toLowerCase()}`;
argv.readlineConf = { hideEchoBack: true, mask: '' };

(async () => {
    global.chainConfig = await config({
        debug: argv.debug,
        secret: argv.secret,
        rpcApi: argv.rpcapi,
        chainApi: argv.chainapi,
        speedTest: argv.spdtest,
    });
    try {
        const chVer = await system.checkVersion();
        if (chVer && !argv.json) {
            console.log(`\nNotice: New version ${chVer.newVersion.version} of `
                + `${chVer.name} is available.`
                + ` Please update it as soon as possible.\n`);
        }
        utilitas.assert(fs.existsSync(`${actFile}.js`), errNotFound);
        const act = require(actFile);
        utilitas.assert(act && act.func, errNotFound);
        if (act.pubkey && act.pvtkey) {
            await unlockKeystore(argv);
        } else if (act.pubkey) {
            await unlockKeystore(argv, { pubkeyOnly: true });
        }
        const result = await act.func(argv);
        randerResult(result, act.render);
    } catch (err) {
        console.error(global.chainConfig.debug ? err.stack : err.toString());
    }
})();
