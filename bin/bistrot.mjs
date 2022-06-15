#!/usr/bin/env node

import { config, crypto, system, utilitas } from '../index.mjs';
import { hideBin } from 'yargs/helpers';
import { readdirSync } from 'fs';
import { table } from 'table';
import yargs from 'yargs';

const argv = yargs(hideBin(process.argv))
    .option('address', { string: true })
    .option('id', { string: true })
    .option('hash', { string: true })
    .help(false).argv;

const { __dirname } = utilitas.__(import.meta.url);
const map = {};
const verbose = [];
const json = [];

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
    const result = await (await import('./actKeystoreUnlock')).func(argv, options);
    argv.address = result.address;
    argv.pvtkey = result.privateKey;
    return result;
};

const randerResult = (result, options) => {
    if (utilitas.isUndefined(result)) { return; }
    const deep = Array.isArray(result);
    options = Function.isFunction(options) ? options(argv) : options;
    options = options || { table: { KeyValue: true } };
    let out = [];
    result = deep ? result : [result];
    for (let i in result) {
        out[i] = {};
        for (let j in result[i]) {
            if (j === 'transaction' && result[i][j]) {
                out[i].transaction_id = result[i][j].transaction_id;
            }
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
            data.push(options.table.columns);
            out.map(x => {
                const row = [];
                for (let i of options.table.columns) {
                    row.push(x[i]);
                }
                data.push(row);
            });
        } else if (!deep && options.table.KeyValue) {
            for (let i in out) {
                data.push([i, ['number', 'string', 'boolean'].includes(
                    typeof out[i]) ? out[i] : JSON.stringify(out[i])]
                );
            }
            options.table.config = Object.assign({
                columns: { 0: { width: 30 }, 1: { width: 80 } }
            }, options.table.config || {});
        }
        out = data && data.length ? table(
            JSON.parse(utilitas.purgeEmoji(JSON.stringify(data), '[EMOJI]')),
            options.table.config
        ) : '';
    }
    if (!options.returnOnly) {
        console.log(argv.json ? (
            argv.compact ? JSON.stringify(out) : utilitas.prettyJson(out)
        ) : out);
    };
    return out;
};

['add', 'remove'].map(i => { argv[i] = toArray(argv[i]); });
[
    'compact', 'daemon', 'debug', 'delete', 'detail', 'dryrun', 'force', 'help',
    'json', 'reverse', 'savepswd', 'secret', 'spdtest', 'testnet', 'trxonly',
].map(i => { argv[i] = toBoolean(argv[i]); });
let command = String(argv._.shift() || 'help');
if (argv.help) { argv.command = command; command = 'help'; }
const errNotFound = `Command not found: \`${command}\`.`;
command = command.toLowerCase();
argv.readlineConf = { hideEchoBack: true, mask: '' };

system.testNet(argv);
globalThis.chainConfig = await config({
    debug: argv.debug,
    secret: argv.secret,
    rpcApi: argv.rpcapi,
    chainApi: argv.chainapi,
    speedTest: argv.spdtest,
});

try {
    const cmds = {};
    readdirSync(__dirname).filter((file) => {
        return /\.mjs$/i.test(file) && file !== 'bistrot.mjs';
    }).forEach(file => {
        cmds[file.toLowerCase().replace(/^act|\.mjs$/ig, '')]
            = utilitas.__(import.meta.url, file);
    });
    assert(cmds[command], errNotFound);
    const act = await import(cmds[command]);
    assert(act && act.func, errNotFound);
    if (act.pvtkey || act.address) {
        await unlockKeystore(argv, { addressOnly: !act.pvtkey });
    }
    if (act.address && !argv.address && argv.pvtkey) {
        argv.address = crypto.privateKeyToAddress(argv.pvtkey);
    }
    const result = await act.func(argv);
    randerResult(result, act.render);
} catch (err) {
    console.error(globalThis.chainConfig.debug ? err.stack : err.toString());
}
