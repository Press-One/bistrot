'use strict';

const { utilitas, encryption, storage, shell } = require('sushitrain');
const path = require('path');
const fs = require('fs');
const log = (content) => { return utilitas.modLog(content, __filename); };
const split = () => { console.log(''); };
const [results, errors] = [{}, []];
const account = 'testuser1';
const pubkey = 'EOS8XgbSbQsr1wuX5UFDbZTTV76yQWz2BEXV5whTUnHM2w8du2F6S';
const address = 'e5ad638ed1a4ec75c77488f6b3d4011fdc7782dc';
const prvK = '6c241da9a33408fb72464860e246ce40a1b05c0bbed8018f554aeeb4cb969d4d';
const mixin = '36029b33-838f-4dbe-ae9b-f0e86226d53d';
const txId = 'EBA5538D00A0958957F4FDE0B8149FF563A129C53A0FD6FDB16559C498523933';
const cura = 'cob';
const curb = 'cnb';
const password = encryption.randomString(32);
const keystore = '/tmp/prsatm-test-keystore.json';
const ignoreResult = true;
const args = { account };

let toTest = {};
let successTest = 0;
let failedTest = 0;
let skippedTest = 0;

const tests = {
    Account: { args: { name: account } },
    AccountAuth: { args },
    AccountBind: { args },
    AccountEvolve: { args: { account, address, prevkey: prvK, } },
    AccountOpen: { args: { account: 'testuser555', pubkey } },
    AssetBalance: { args },
    AssetCancelPreparation: { alias: 'AssetCancel', args, ignoreResult },
    AssetDeposit: { args: { account, amount: 0.001 } },
    AssetCancel: { args },
    AssetWithdraw: { args: { account, amount: 0.001, mixin } },
    AssetRefund: { skip: true },
    Bp: {},
    BpBallot: {},
    BpUnregPreparation: { alias: 'BpUnreg', args },
    BpReg: { args },
    BpVote: { args: { account, add: account } },
    Reward: { skip: true },
    RewardAuth: { args },
    RewardUnauth: { args },
    BpUnreg: { args },
    Chain: {},
    ChainBlock: { args: { id: 1 } },
    ChainNode: {},
    ChainTail: { skip: true },
    ChainTrx: { args: { id: txId }, prod: true },
    Cmd: {},
    Config: { args: { debug: true } },
    DefiChart: { skip: true },
    GenConfig: { args },
    GenGenesis: {},
    GenRunsrv: {},
    Help: { hideResult: true },
    Keychain: {},
    Keys: { args },
    KeystoreCreate: { args: { password, dump: keystore, force: true } },
    KeystoreUnlock: { args: { keystore, password } },
    KeyUpdtActive: { skip: true },
    KeyUpdtOwner: { skip: true },
    ResDelegate: { args: { account, net: 1 } },
    ResBuyRam: { args: { account, ram: 1 } },
    ResUndelegate: { args: { account, net: 1 }, skip: true },
    SpdTest: { compactResult: true },
    Statement: { args: { account: 'test.bp2' }, prod: true },
    SwapCancelPreparation: { alias: 'SwapCancel', args, ignoreResult },
    Swap: { args: { account, from: cura, amount: 1, to: curb } },
    SwapCancel: { args },
    SwapLqAdd: { args: { account, cura, amount: 1, curb } },
    SwapPay: { args },
    SwapCancelLqAdd: { alias: 'SwapCancel', args },
    SwapLqRm: { args: { account, cura, curb, amount: 0.0001, mixin } },
    SwapPool: {},
    SwapStmt: { args: { account: 'test.bp2' }, prod: true },
    Version: {},
};

const checkKeystore = async () => {
    log('Checking keystore...');
    let ks;
    try {
        ks = (await storage.getConfig()).config.keystores[`${account}-owner`];
    } catch (e) {
        utilitas.throwError(
            `Error loading keystore for test user (${account}): ${e.message}.`,
            400
        );
    }
    utilitas.assert(ks, `Keystore not found for test user (${account}).`, 400);
    log('OK');
};

const getAllCommands = async () => {
    log('Initializing test case...');
    const resp = [];
    fs.readdirSync(path.join(__dirname, 'bin')).filter((file) => {
        return /\.js$/i.test(file) && file !== 'prs-atm.js';
    }).forEach((file) => {
        const cmd = file.replace(/^act|\.js$/ig, '');
        utilitas.assert(
            tests[cmd], `Test case not found for command (${cmd}).`, 400
        );
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
            + `>>> \`$ prs-atm ${cmd} ${argTxt}\``);
        results[func] = await (tests[func].overload ?
            tests[func].overload(args)
            : shell.exec(`./bin/prs-atm.js ${cmd} ${argTxt}`));
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

(async () => {
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
})()
