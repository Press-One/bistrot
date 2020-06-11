#!/usr/bin/env node

'use strict';

const { utilitas } = require('utilitas');
const table = require('table').table;
const yargs = require('yargs');
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
    'previous',
    'block',
    'transactions_trx_transaction_actions_data__dp_wd_req__id',
    'transactions_trx_transaction_actions_data__sync_auth__result',
];

const json = ['transaction'];

const toBoolean = (str) => {
    return { 'true': true, 'false': false }[String(str || '').toLowerCase()];
};

const toArray = (str) => {
    const arr = String(str || '').split(/[,;\ ]/);
    const result = [];
    arr.map(x => { if ((x = x.trim())) { result.push(x); } });
    return result;
};

const unlockKeystore = async (options = {}) => {
    if (argv.keystore) {
        const result = await require('./actUnlock').func(argv, options);
        argv.pubkey = result.publickey;
        argv.pvtkey = result.privatekey;
    }
};

const randerResult = (result, options = { table: { KeyValue: true } }) => {
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

const argv = yargs.default({ action: 'help' }).help(false).argv;

global.chainConfig = {
    rpcApi: argv.rpcapi || undefined,
    chainApi: argv.chainapi || undefined,
    overwrite: toBoolean(argv.force),
    json: toBoolean(argv.json),
    debug: toBoolean(argv.debug),
    readlineConfig: { hideEchoBack: true, mask: '' },
};

for (let i in argv) {
    if (['add', 'remove'].includes(i)) {
        argv[i] = toArray(argv[i]);
    }
};

const actFile = `${__dirname}/act${(argv.action[0] || '').toUpperCase(
)}${argv.action.slice(1).toLowerCase()}`;

(async () => {
    try {
        utilitas.assert(fs.existsSync(`${actFile}.js`), 'Unknown action.');
        const act = require(actFile);
        utilitas.assert(act && act.func, 'Invalid action.');
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
