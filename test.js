'use strict';

const { utilitas, storage, shell } = require('sushitrain');
const path = require('path');
const fs = require('fs');
const log = (content) => { return utilitas.modLog(content, __filename); };
const split = () => { console.log(''); };
const [testUser, results, errors] = ['testuser1', {}, []];

let successTest = 0;
let failedTest = 0;
let skippedTest = 0;

const tests = {
    'Account': { args: { name: testUser } },
    'AccountAuth': {},
    'AccountBind': {},
    'AccountEvolve': {},
    'AccountOpen': {},
    'AssetBalance': {},
    'AssetCancel': {},
    'AssetDeposit': {},
    'AssetRefund': {},
    'AssetWithdraw': {},
    'Bp': {},
    'BpBallot': {},
    'BpReg': {},
    'BpReward': {},
    'BpUnreg': {},
    'BpVote': {},
    'Chain': {},
    'ChainBlock': {},
    'ChainNode': {},
    'ChainTail': {},
    'ChainTrx': {},
    'Cmd': {},
    'Config': {},
    'DefiChart': {},
    'GenConfig': {},
    'GenGenesis': {},
    'GenRunsrv': {},
    'Help': {},
    'Keychain': {},
    'Keys': {},
    'KeystoreCreate': {},
    'KeystoreUnlock': {},
    'KeyUpdtActive': {},
    'KeyUpdtOwner': {},
    'ResDelegate': {},
    'ResRamBuy': {},
    'ResUndelegate': {},
    'SpdTest': {},
    'Statement': {},
    'Swap': {},
    'SwapAddLq': {},
    'SwapCancel': {},
    'SwapPay': {},
    'SwapPool': {},
    'SwapRmLq': {},
    'SwapStmt': {},
    'Version': {},
};

const checkKeystore = async () => {
    log('Environment Checking: Keystore...');
    let ks;
    try {
        ks = (await storage.getConfig()).config.keystores[`${testUser}-owner`];
    } catch (e) {
        utilitas.throwError(
            `Error loading keystore for test user (${testUser}): ${e.message}.`,
            400
        );
    }
    utilitas.assert(ks, `Keystore not found for test user (${testUser}).`, 400);
    log('OK');
};

const getAllCommands = async () => {
    const resp = [];
    fs.readdirSync(path.join(__dirname, 'bin')).filter((file) => {
        return /\.js$/i.test(file) && file !== 'prs-atm.js';
    }).forEach((file) => {
        resp.push(file.replace(/^act|\.js$/ig, ''));
    });
    return resp;
};

const formatArgs = (args) => {
    args = Object.assign({
        testnet: null, json: null, compact: null,
    }, args || {});
    const resp = [];
    for (let i in args) {
        resp.push(args[i] === null ? `--${i}` : `--${i}='${args[i]}'`);
    }
    return resp.join(' ');
};

const test = async (func) => {
    const testConfig = tests[func] || {};
    if (testConfig.skip) { skippedTest++; return; };
    let args = {};
    try {
        args = (testConfig.pre ? await testConfig.pre() : null)
            || testConfig.args || {};
    } catch (err) { log(err); }
    try {
        const argTxt = formatArgs(args);
        split();
        log(`>>> CASE ${successTest + failedTest + 1} `
            + `>>> \`$ prs-atm ${func} ${argTxt}\``);
        results[func] = await (testConfig.overload ?
            testConfig.overload(args)
            : shell.exec(`./bin/prs-atm.js ${func} ${argTxt}`));
        results[func] = results[func]
        // log(`Success: ${JSON.stringify(results[func], null, 2)}`);
        log(`Success: ${JSON.stringify(results[func])}`);
        successTest++;
    } catch (err) {
        errors.push(`Failed: ${err.message}`);
        log(errors[errors.length - 1]);
        failedTest++;
    }
};

(async () => {
    const start = process.hrtime();
    try {
        await checkKeystore();
    } catch (e) { log(e.message); process.exit(1); }
    for (let func of await getAllCommands()) { await test(func); }
    const duration = Math.round(process.hrtime(start)[1] / 1000000 / 10) / 100;
    split(); log(`Success: ${successTest}, Failed: ${failedTest}, `
        + `Skipped: ${skippedTest}, Time consuming: ${duration} seconds.`)
    split();
    if (errors.length) {
        throw Object.assign(new Error(`${failedTest} test failed.`),
            { details: errors });
    }
})()

// const tests = {
//     getRpcUrl: {},
//     getSupportedApis: {},
//     createWallet: {},
//     listWallet: {},
//     openWallet: { args: [options.wallet] },
//     lock: {},
//     lockAll: {},
//     unlock: { pre: () => { return [getPasswordOptions()] } },
//     createKey: { pre: () => { return [getPasswordOptions()] } },
//     getPublicKeys: { pre: () => { return [getPasswordOptions()] } },
//     importKey: { pre: () => { return [testPrivateKey, getPasswordOptions()] } },
//     isWalletReady: {},
//     listKeys: { pre: () => { return [getPasswordOptions()] } },
//     removeKey: { pre: () => { return [results['createKey'].publicKey, getPasswordOptions()] } },
//     setTimeout: { args: [120] },
//     rpcRequest: { args: ['POST', 'sign_digest', [testDigest, testPublicKey]] },
//     signDigest: { pre: () => { return [testDigest, testPublicKey, getPasswordOptions()] } },
//     signTransaction: { skip: !prodPrivateKey, overload: signTransaction },
//     stop: { skip: true },
// };
