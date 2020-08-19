'use strict';

global.chainConfig = global.chainConfig || {};
global.chainConfig.serviceStateHistoryPlugin = true;

const { sushitrain, pacman } = require('sushitrain');
const { utilitas, event } = require('utilitas');
const yonJigenPoketto = require('./yonJigenPoketto');
const bigNumber = require('bignumber.js');
const crypto = require('crypto');
const mathjs = require('mathjs');
const ecc = require('eosjs-ecc');

const pmsTimeout = 1000 * 60 * 60 * 24; // 1 day
const pinTimeout = 60 * 60 * 3; // 3 hours
// const matchRate = 42;
const matchRate = 2;
const jobs = {};

let lastBlockId = null;

const log = (content) => { return utilitas.modLog(content, __filename); };

// decimal = 'd(n-1)×16^(n-1) + ... + d(3)×16^(3) + d(2)×16^(2) + d(1)×16^(1) + d(0)×16^(0)'
const hexToDec = (hex) => {
    const bn = new bigNumber(hex, 16);
    return bn.toString(10);
};

// keccak256 will be failed!!!
const sha256 = (str) => {
    const hash = crypto.createHash('sha256');
    return hash.update(str).digest('hex');
};

const getLatestBlockId = async () => {
    const resp = await sushitrain.getInfo();
    // return lastBlockId !== resp.last_irreversible_block_id
    //     && (lastBlockId = resp.last_irreversible_block_id);
    return lastBlockId !== resp.head_block_id
        && (lastBlockId = resp.head_block_id);
};

const assign = async (transaction) => {
    if (!transaction || !transaction.trx || !transaction.trx.transaction) {
        return;
    }
    for (let action of transaction.trx.transaction.actions || []) {
        // log(`New trx: ${transaction.trx.id}`);
        if (action.account !== 'prs.ipfs') { continue; }
        if (['addslice', 'addpromise'].includes(action.name)) {
            jobs[transaction.trx.id] = {
                id: transaction.trx.id,
                action: action.name,
                data: action.data,
                status: 'PENDING',
            };
            log(`New job: ${transaction.trx.id} => ${action.name}`);
        }
    }
};

const watch = async (blocknum, options = {}) => {
    if (!(blocknum = parseInt(blocknum))) {
        const chainInfo = await sushitrain.getInfo();
        utilitas.assert(chainInfo && chainInfo.last_irreversible_block_num,
            'Error connecting to chain API.', 500);
        blocknum = chainInfo.last_irreversible_block_num;
    }
    try {
        return await pacman.init(() => {
            return blocknum;
        }, null, assign, { silent: true, event: options.event });
    } catch (err) { console.log(err); }
};

// condition: INT64(sha256(sha256(blockId + promiseTrxId + publicKey))) mod 42 === 0
const tryMatch = async (blockId, promiseTrxId, publicKey) => {
    const now = new Date();
    const hexPubKey = ecc.PublicKey(publicKey).toHex();
    const hash = sha256(sha256(`${blockId}${promiseTrxId}${hexPubKey}`));
    const decHash = hexToDec(hash);
    const sDocHash = decHash.substr(0, 18);
    const m = mathjs.mod(mathjs.bignumber(sDocHash), matchRate);
    const result = m.toString() !== '0';
    // console.log('Try Match:', {
    //     Time: now.toISOString(),
    //     BlockID: blockId,
    //     PromiseTrxID: promiseTrxId,
    //     PublicKey: `${publicKey} -> ${hexPubKey}`,
    //     Hash: hash,
    //     HashDec: `${decHash} -> ${sDocHash}`,
    //     MatchRate: matchRate,
    //     MOD: m,
    //     Result: result ? 'MATCHED' : 'FAILED',
    // });
    return { hexPubKey, hash, decHash, sDocHash, now, matchRate, result };
};

const getJob = (action, status, options = {}) => {
    const result = [];
    for (let i in jobs) {
        if (jobs[i].action === action && jobs[i].status === status) {
            result.push(jobs[i]);
            if (!options.all) { break; }
        }
    }
    return options.all ? result : result.shift();
};

const pin = async () => {
    // @todo 如果文件需求已經過期就不需要 pin 了，直接刪除
    const job = getJob('addslice', 'PENDING');
    if (!job) { return; }
    log(`Run job: ${job.id} => ${job.action}`);
    let result = null;
    try {
        result = await utilitas.asyncTimeout(
            yonJigenPoketto.provideStorage(
                job.id, account, nodePubKey, privateKey, { transaction: job }
            ), pinTimeout, `Failed to pin slices within ${pinTimeout} seconds.`
        );
    } catch (err) { console.log(err.message); }
    delete jobs[job.id];
    if (!result) {
        jobs[job.id] = job;
    }
    log(`Ext job: ${job.id} => ${job.action} => `
        + (result ? 'PIN SUCCESS' : 'PIN FAILED, RESCHEDULED'));
    return result;
};

const probe = async () => {
    // @todo 如果文件需求已經過期就不需要 pin 了，直接刪除
    const [blockId, jobs, now] = [
        await getLatestBlockId(),
        getJob('addpromise', 'PENDING', { all: true }),
        new Date()
    ];
    if (!blockId || !jobs.length) { return; }
    for (let i in jobs) {
        if (now.getTime() - new Date(jobs[i].time).getTime() > pmsTimeout) {
            delete job[i];
            continue;
        }
        const result = await tryMatch(blockId, jobs[i].id, nodePubKey);
        if (result && result.result) {
            jobs[i].blockId = blockId;
            jobs[i].sDocHash = result.sDocHash;
            jobs[i].status = 'MATCHED';
        }
        log(`Try job: ${jobs[i].id} => ${jobs[i].action} => ` + (
            result && result.result
                ? 'MATCH SUCCESS' : 'MATCH FAILED, RESCHEDULED'
        ));
    }
};

const verify = async () => {
    const job = getJob('addpromise', 'MATCHED');
    if (!job) { return; }
    const verifyResult = await yonJigenPoketto.challengePromise(
        job.id, nodePubKey, { sliceIndexSeed: job.sDocHash }
    );
    // console.log('>>> RESULT');
    // const result = {
    //     publish_id: verifyResult.promiseData.publish_id,
    //     request_id: verifyResult.promiseData.request,
    //     promise_id: job.id,
    //     block_id: job.blockId,
    //     public_key: nodePubKey,
    //     verification_time: verifyResult.verification_time,
    //     verification_hash: verifyResult.verification_hash || '',
    //     verification_status: !verifyResult.error,
    //     verification_error: verifyResult.error || '',
    // };
    // console.log(result);
    const data = {
        user: account,
        size: parseInt(job.data.size),
        publish_id: verifyResult.promiseData.publish_id,
        ipfs_signatur: verifyResult.verification_hash || '',
        promise: job.id,
        ipfs_peer_id: verifyResult.peerId,
        result: !verifyResult.error,
    };
    // console.log(data);
    const transaction = await sushitrain.transact(
        account, privateKey, 'prs.ipfs', 'addverify', data
    );
    // console.log(trx);
    delete jobs[job.id];
    if (!data.result) {
        jobs[job.id] = job;
    }
    log(`Ext job: ${job.id} => ${job.action} => `
        + (data.result ? 'VERIFY SUCCESS' : 'VERIFY FAILED, RESCHEDULED'));
    return { verifyResult, transaction };
};

let account = null;
let nodePubKey = null;
let privateKey = null;

const up = async (acc, npk, pvk, startBlock) => {
    account = acc;
    nodePubKey = npk;
    privateKey = pvk;
    ////////////////////////////////////////////////////////////////////////////
    // startBlock = 35156715;
    ////////////////////////////////////////////////////////////////////////////
    await watch(startBlock || null, { event }); // 35156715 // 35283525
    await event.loop(pin, 1, pinTimeout + 60, 1); // max 3 hours + 1 min
    await event.loop(probe, 0.4, 60, 1);
    await event.loop(verify, 1, 60 * 3, 1); // 時間需要修改為配合 Yjp 模塊的時間
};

module.exports = {
    up,
};

// (async () => {
// })();

// TESTING /////////////////////////////////////////////////////////////////////

// const account = 'test.bp2';
// const nodePubKey = 'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR';
// const privateKey = '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77';

// let logSuccess = [];
// if (logSuccess.length >= 1) {
// let sum = 0;
// for (let i = 0; i < logSuccess.length - 1; i++) {
//     sum += logSuccess[i + 1].getTime() - logSuccess[i].getTime();
// }
// console.log('\nAVG wait       :', `${sum / (logSuccess.length - 1) / 1000} seconds`);
// console.log(logSuccess);
//     process.exit(1);
// }

// const currentPromises = [
//     '9eb79429d0955d0ea33a9154e1ff401007d3da051a88b9e0b6464900585b81ea',
//     // 'e155fc0d4d7965b109fb3f03344285ba84270c631d7c4a256c95bb1cdc8df789',
//     // '1e50eae43032d23b21305ba812a2881c6a894872eb0993ecbe9a27533856d777',
//     // '77cf72f25c18e714f7528e5b3a008bf6f85c1abf866d316bcbb74ae3311e270e',
//     // '99935d8859db4eb635ad873e0aa769ed7e676b4d201f42c1294780af090a3be5',
// ];
