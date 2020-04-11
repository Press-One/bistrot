'use strict';

const crypto = require('crypto');
const aesjs = require('aes-js');
const utility = require('./utility');

const buildAesCtr = (key, counter) => {
    const aesCounter = new aesjs.Counter(parseInt(counter));
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, aesCounter);
    return aesCtr;
};

const createAesKey = () => {
    const key = crypto.randomBytes(32);
    return { key: Array.from(key), hex: aesjs.utils.hex.fromBytes(key) };
};

const createAesCtr = () => {
    return parseInt(crypto.randomBytes(4).toString('hex'), 16);
};

const dumpKeySet = (keySet) => {
    return utility.base64Pack({
        key: keySet.hex, ctr: keySet.ctr, alg: keySet.alg
    });
};

const createAesKeySet = () => {
    const keySet = Object.assign(
        createAesKey(), { ctr: createAesCtr(), alg: 'aes256-ctr' }
    );
    return { keySet: keySet, dump: dumpKeySet(keySet) };
};

const getBuffer = (obj, mode = 'hex') => {
    if (Buffer.isBuffer(obj)) {
        return obj;
    }
    switch (mode) {
        case 'hex':
            return aesjs.utils.hex.toBytes(obj);
        case 'utf8':
            return aesjs.utils.utf8.toBytes(obj);
    };
    return null;
};

const restoreAesKeySet = (dump) => {
    const keySet = { keySet: utility.base64Unpack(dump), dump };
    keySet.keySet.hex = keySet.keySet.key;
    keySet.keySet.key = getBuffer(keySet.keySet.hex);
    return keySet;
};

const aesEncrypt = (obj, key, counter, options) => {
    options = options || {};
    const bytes = getBuffer(obj, 'utf8');
    const aesCtr = buildAesCtr(key, counter);
    const encryptedBytes = aesCtr.encrypt(bytes);
    const encryptedResult = options.asBinary
        ? Buffer.from(encryptedBytes)
        : aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedResult;
};

const aesDecrypt = (encryptedHex, key, counter, options) => {
    options = options || {};
    const encryptedBytes = getBuffer(encryptedHex);
    const aesCtr = buildAesCtr(key, counter);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    const decryptedResult = options.asBinary
        ? Buffer.from(decryptedBytes)
        : aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedResult;
};

const autoEncrypt = (obj, options) => {
    const keySet = createAesKeySet();
    return {
        algorithm: keySet.keySet.alg,
        key: keySet.dump,
        content: aesEncrypt(obj, keySet.keySet.key, keySet.keySet.ctr, options),
    };
};

const autoDecrypt = (obj, key, options) => {
    const keySet = restoreAesKeySet(key);
    return aesDecrypt(obj, keySet.keySet.key, keySet.keySet.ctr, options);
};

module.exports = {
    aesEncrypt,
    aesDecrypt,
    autoEncrypt,
    autoDecrypt,
};

// (async () => {
//     try {
//         await require('./utility').timeout(500);


//         const a = autoEncrypt('AAAA BBBB CCCC DDDD');

//         console.log(a);

//         const b = autoDecrypt(a.content, a.key);

//         console.log(b);


//         // const a = createAesKeySet();

//         // console.log(a);

//         // const b = restoreAesKeySet(a.dump);
//         // console.log(b);

//         // const x = await add('/Users/leask/Desktop/t/1.pdf');
//         // console.log(x);
//         // const y = await ls(x.Hash);
//         // console.log(JSON.stringify(y, null, 2));
//         // const fs = require("fs");
//         // const path = require("path");
//         // let markdownFileUrl = "/Users/leask/Desktop/t/1.mkv";
//         // const content = fs.readFileSync(markdownFileUrl, 'binary');
//         // const fileHash = utility.keccak256(content);
//         // console.log(fileHash);

//         // let data = {
//         //     file_hash: fileHash
//         // };
//         // const sign = utility.signBlockData(data, '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77');
//         // console.log(sign);

//         // await ls();


//     } catch (err) {
//         console.log(err);
//     }
//     process.exit(0);
// })();
