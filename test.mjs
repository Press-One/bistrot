'use strict';

import { utilitas, encryption, storage, shell } from 'utilitas';
import fs from 'fs';
import path from 'path';

const { __dirname } = utilitas.__(import.meta.url);
const log = (content) => utilitas.log(content, import.meta.url);
const split = () => { console.log(''); };
const [results, errors] = [{}, []];
const address = '0x2AeF3da35e9A2EC29aE25A04d9C9e92110910A51';
const tx = '0xd60018cb09cd1fcf4647c16ea13dcb7e3bea72c17a8ba1293aaa6e7177ed190c';
const password = encryption.randomString(32);
const keystore = '/tmp/bistrot-test-keystore.json';

let toTest = {};
let successTest = 0;
let failedTest = 0;
let skippedTest = 0;

const tests = {
    Account: { args: { address } },
    Chain: {},
    ChainBlock: { args: { id: 1 } },
    ChainTail: { skip: true },
    ChainTrx: { args: { hash: tx } },
    Cmd: {},
    Config: { args: { debug: true } },
    Help: { hideResult: true },
    KeystoreCreate: { args: { password, dump: keystore, force: true } },
    KeystoreUnlock: { args: { keystore, password } },
    Version: {},
};

const checkKeystore = async () => {
    log('Checking keystore...');
    let ks;
    try {
        const add = address.replace(/^0x/i, '').toUpperCase();
        ks = (await storage.getConfig()).config.keystores[add];
    } catch (e) {
        utilitas.throwError(`Error loading keystore: ${address}.`, 400);
    }
    assert(ks, `Keystore not found: ${address}.`, 400);
    log('OK');
};

const getAllCommands = async () => {
    log('Initializing test case...');
    const resp = [];
    fs.readdirSync(path.join(__dirname, 'bin')).filter((file) => {
        return /\.js$/i.test(file) && file !== 'bistrot.js';
    }).forEach((file) => {
        const cmd = file.replace(/^act|\.js$/ig, '');
        assert(tests[cmd], `Test case not found for command (${cmd}).`, 400);
        resp.push(cmd);
    });
    log('OK');
    return resp;
};

const formatArgs = (config) => {
    const base = { testnet: null, json: null, compact: null };
    if (config.rawResult) { delete base.json; delete base.compact; }
    if (config.prod) { delete base.testnet; }
    const args = Object.assign(base, config.args || {});
    const resp = [];
    for (let i in args) {
        resp.push(args[i] === null ? `--${i}` : `--${i}='${args[i]}'`);
    }
    return resp.join(' ');
};

const success = (message) => {
    log(message); successTest++;
};

const failure = (message) => {
    errors.push(message); log(errors[errors.length - 1]); failedTest++;
};

const test = async (func) => {
    if (tests[func].skip) { skippedTest++; return; };
    let args = {};
    try {
        args = (tests[func].pre ? await tests[func].pre() : null)
            || tests[func].args || {};
    } catch (err) { log(err); }
    try {
        const cmd = tests[func].alias || func;
        const argTxt = formatArgs(tests[func]);
        split();
        log(`CASE ${successTest + failedTest + 1} `
            + `>>> \`$ bistrot ${cmd} ${argTxt}\``);
        results[func] = await (tests[func].overload ?
            tests[func].overload(args)
            : shell.exec(`./bin/bistrot.js ${cmd} ${argTxt}`));
        if (tests[func].hideResult) {
            results[func] = '...';
        } else if (tests[func].rawResult) {
            results[func] = results[func].trim();
        } else if (tests[func].prettyResule) {
            results[func] = JSON.stringify(JSON.parse(results[func]), null, 2);
        } else if (tests[func].compactResult) {
            results[func] = JSON.stringify(results[func]);
        } else {
            results[func] = results[func].trim().slice(0, 100) + '...';
        }
        success(`Success: ${results[func]}`);
    } catch (err) {
        if (tests[func].ignoreResult) { return success('Completed'); }
        failure(err.message);
    }
};

(process.argv || []).map(c => {
    /case[=:]/i.test(c) && c.split(/=|:/)[1].split(/,|;/).map(
        d => { d && (toTest[d.toLowerCase()] = true); }
    );
});
toTest = Object.keys(toTest).length ? toTest : null;
const start = process.hrtime.bigint();
try {
    await checkKeystore();
    await getAllCommands();
} catch (e) { log(e.message); process.exit(1); }
for (let func in tests) {
    const tt = func.toLowerCase();
    if (toTest && !toTest[tt]) { continue; }
    if (toTest && toTest[tt]) {
        tests[func].rawResult = true; delete toTest[tt];
    }
    await test(func);
}
for (let i in toTest) { failure(`Test case not found: \`${i}\`.`); }
const end = process.hrtime.bigint();
const duration = Math.round(parseInt((end - start) / 10000000n)) / 100;
split();
log(`Success: ${successTest}, Failed: ${failedTest}, `
    + `Skipped: ${skippedTest}, Time consuming: ${duration} seconds.`);
split();
if (errors.length) {
    throw Object.assign(new Error(`${failedTest} test failed.`),
        { details: errors });
}
