'use strict';

const yonJigenPoketto = require('./yonJigenPoketto');
const bigNumber = require('bignumber.js');
const helper = require('./helper');
const crypto = require('crypto');
const mathjs = require('mathjs');
const event = require('./event');
const ecc = require('eosjs-ecc');
const atm = require('./atm');

let lastBlockId = null;

let logSuccess = [];

const getLatestBlockId = async () => {
    const resp = await atm.getInfo();
    // console.log(resp);
    // return lastBlockId !== resp.last_irreversible_block_id
    //     && (lastBlockId = resp.last_irreversible_block_id);
    return lastBlockId !== resp.head_block_id
        && (lastBlockId = resp.head_block_id);
};

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

// condition: INT64(sha256(sha256(blockId + promiseTrxId + publicKey))) mod 42 === 0
const tryMatch = async (blockId, promiseTrxId, publicKey) => {
    const now = new Date();
    const hexPubKey = ecc.PublicKey(publicKey).toHex();
    const hash = sha256(sha256(`${blockId}${promiseTrxId}${hexPubKey}`));
    const decHash = hexToDec(hash);
    const sDocHash = decHash.substr(0, 18)
    const m = mathjs.mod(mathjs.bignumber(sDocHash), 42);
    console.log('');
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
    logSuccess.push(now);
    console.log('>>> SUCCESS', logSuccess.length);
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
};

const probe = async () => {
    const blockId = await getLatestBlockId();
    if (!blockId) { return; }
    for (let p of currentPromises) {
        await tryMatch(blockId, p, nodePubKey);
    }
    if (logSuccess.length >= 1) {
        // let sum = 0;
        // for (let i = 0; i < logSuccess.length - 1; i++) {
        //     sum += logSuccess[i + 1].getTime() - logSuccess[i].getTime();
        // }
        // console.log('\nAVG wait       :', `${sum / (logSuccess.length - 1) / 1000} seconds`);
        // console.log(logSuccess);
        process.exit(1);
    }
};

// EVENT LOOP //////////////////////////////////////////////////////////////////

// const nodePubKey = 'EOS7ZtBTNsekNJWJHMieEeELQWPpVwbKs7ezVE9nKk9rpkJ69wxUR';

// const currentPromises = [
//     '9eb79429d0955d0ea33a9154e1ff401007d3da051a88b9e0b6464900585b81ea',
//     // 'e155fc0d4d7965b109fb3f03344285ba84270c631d7c4a256c95bb1cdc8df789',
//     // '1e50eae43032d23b21305ba812a2881c6a894872eb0993ecbe9a27533856d777',
//     // '77cf72f25c18e714f7528e5b3a008bf6f85c1abf866d316bcbb74ae3311e270e',
//     // '99935d8859db4eb635ad873e0aa769ed7e676b4d201f42c1294780af090a3be5',
// ];

// (async () => {
//     await event.loop(probe, 0.4, 60, 1);
// })();
