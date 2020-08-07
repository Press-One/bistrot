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

const pmsTimeout = 1000 * 60 * 60 * 24;
// const matchRate = 42;
const matchRate = 2;
const promises = {};

let lastBlockId = null;

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
    // console.log(resp);
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
        console.log('TRX > ' + transaction.trx.id);
        if (action.account !== 'prs.ipfs') { continue; }
        switch (action.name) {
            case 'addslice':
                console.log(action);
                const psResult = await yonJigenPoketto.provideStorage(
                    transaction.trx.id, account, nodePubKey, privateKey
                );
                console.log(psResult);
                break;
            case 'addpromise':
                action.time = new Date(transaction.trx.transaction.expiration);
                promises[transaction.trx.id] = action;
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
    const sDocHash = decHash.substr(0, 18)
    const m = mathjs.mod(mathjs.bignumber(sDocHash), matchRate);
    console.log('');
    console.log('>>> Try...');
    console.log('Time           :', now.toISOString());
    console.log('Block ID       :', blockId);
    console.log('Promise Trx ID :', promiseTrxId);
    console.log('Public Key     :', `${publicKey} -> ${hexPubKey}`);
    console.log('Hash           :', hash);
    console.log('Hash Dec       :', `${decHash} -> ${sDocHash}`);
    console.log('MOD            :', m);
    if (m.toString() !== '0') {
        console.log('>>> FAILED');
        return;
    }
    console.log('>>> MATCHED');
    const verifyResult = await yonJigenPoketto.challengePromise(
        promiseTrxId, sDocHash, publicKey,
    );
    console.log('');
    console.log('>>> RESULT');
    const result = {
        publish_id: verifyResult.promiseData.publish_id,
        request_id: verifyResult.promiseData.request,
        promise_id: promiseTrxId,
        block_id: blockId,
        public_key: publicKey,
        verification_time: verifyResult.verification_time,
        verification_hash: verifyResult.verification_hash || '',
        verification_status: !verifyResult.error,
        verification_error: verifyResult.error || '',
    };
    console.log(result);
    return result;
};

const probe = async () => {
    const [blockId, now] = [await getLatestBlockId(), new Date()];
    if (!blockId) { return; }
    for (let i in promises) {
        if (now.getTime() - promises[i].time.getTime() > pmsTimeout) {
            delete promises[i];
            continue;
        }
        const result = await tryMatch(blockId, i, nodePubKey);
        if (!result) {
            continue;
        }
        const data = {
            user: account,
            size: parseInt(promises[i].data.size),
            publish_id: result.publish_id,
            ipfs_signatur: result.verification_hash,
            promise: result.promise_id,
            ipfs_peer_id: result.peerId,
            result: result.verification_status,
        };
        // console.log(data);
        const trx = await sushitrain.transact(
            account, privateKey, 'prs.ipfs', 'addverify', data
        );
        console.log(trx);
    }
};

let account = null;
let nodePubKey = null;
let privateKey = null;

const up = async (acc, npk, pvk, startBlock) => {
    account = acc;
    nodePubKey = npk;
    privateKey = pvk;
    await watch(startBlock || null, { event }); // 35156715 // 35283525
    await event.loop(probe, 0.4, 60, 1);
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
