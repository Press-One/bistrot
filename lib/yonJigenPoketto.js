'use strict';

// ipfs config profile apply lowpower
// ipfs daemon

const childProcess = require('child_process');
const encryption = require('./encryption');
const prsUtility = require("prs-utility");
const request = require('request-promise');
const utility = require('./utility');
const assert = require('assert');
const mime = require('mime-types');
const path = require('path');
const util = require('util');
const fs = require('fs').promises;
const config = require('./config');
const pExec = util.promisify(childProcess.exec);

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const ipfsError = 'Error querying IPFS.';

const exec = async (command) => {
    const { stdout, stderr } = await pExec(command);
    assert(!stderr, stderr);
    return stdout;
};

const ipfsApi = 'http://127.0.0.1:5001/api/v0/';

const analyzeFile = async (filename) => {
    const stat = await fs.stat(filename);
    assert(stat.isFile(), `${filename} is not a file.`);
    const content = await fs.readFile(filename, 'binary');
    return {
        content,
        filename: path.basename(filename),
        extname: path.extname(filename).replace(/^\.|\.$/g, ''),
        mime: mime.lookup(filename) || 'application/octet-stream',
        hash: prsUtility.keccak256(content),
        hash_alg: 'keccak256',
        size: stat.size,
    };
};

const ipfsAdd = async (content, filename) => {
    const req = {
        method: 'POST',
        json: true,
        uri: `${ipfsApi}add`,
        formData: { file: content || fs.createReadStream(filename) },
    };
    const result = await request(req).then((resp) => {
        return Promise.resolve(resp);
    });
    assert(result && result.Hash, ipfsError);
    return result;
};

const ipfsLs = async (cid) => {
    const req = {
        method: 'GET',
        json: true,
        uri: utility.assemblyUrl(`${ipfsApi}ls`, {
            arg: cid,
            headers: true,
            'resolve-type': true,
            size: true,
        }),
    };
    const result = await request(req).promise();
    assert(result && result.Objects, ipfsError);
    return result;
};

const buildIpfsUri = (cid) => {
    const isArray = utility.isArray(cid);
    let cids = isArray ? cid : [cid];
    cids = cids.map(x => { return `ipfs://${x}`; });
    return isArray ? cids : cids[0];
};

const add = async (filename, options) => {
    options = options || {};
    const file = await analyzeFile(filename);
    if (options.encryption) {
        const enc = encryption.autoEncrypt(file.content, { asBinary: true });
        file.content = enc.content;
        file.encryption = { algorithm: enc.algorithm, key: enc.key };
    }
    const respAdd = await ipfsAdd(file.content);
    const respLs = await ipfsLs(respAdd.Hash);
    delete file.content;
    if (options.ipfsUri) {
        file.uri = buildIpfsUri(respAdd.Hash);
    }
    file.slices = buildIpfsUri(respLs.Objects[0].Links.map(x => {
        return x.Hash;
    }));
    return file;
};

const getIpfsCid = (uri) => {
    uri = String(uri || '');
    return /^ipfs:\/\//i.test(uri) ? uri.replace(/^ipfs:\/\//i, '') : uri;
};

const ipfsCat = async (uri) => {
    const req = {
        method: 'POST',
        json: true,
        encoding: null,
        uri: utility.assemblyUrl(`${ipfsApi}cat`, { arg: getIpfsCid(uri) }),
    };
    const result = await request(req).promise();
    assert(result && Buffer.isBuffer(result), ipfsError);
    return result;
};

const batchCat = async (uris) => {
    const pms = [];
    (uris || []).map(x => { pms.push(ipfsCat(x)) });
    const result = await Promise.all(pms);
    return result;
};

const verifyFormula = (formula) => {
    assert(formula, 'Invalid formula.');
    assert(formula.hash, 'Invalid hash in formula.');
    assert(formula.hash_alg, 'Invalid hash_alg in formula.');
    assert(utility.isArray(formula.slices)
        && formula.slices.length, 'Invalid slices in formula.');
};

const get = async (formula) => {
    verifyFormula(formula);
    let buffer = await batchCat(formula.slices);
    buffer = Buffer.concat(buffer);
    if (formula.encryption) {
        assert(
            formula.encryption.algorithm === 'aes256-ctr',
            'Invalid encryption algorithm.'
        );
        assert(formula.encryption.key, 'Invalid encryption key.');
        buffer = encryption.autoDecrypt(buffer, formula.encryption.key, {
            asBinary: true,
        });
    }
    const hash = prsUtility.keccak256(buffer);
    assert(formula.hash === hash, 'Invalid file hash, damaged file.');
    return buffer;
};

(async () => {
    try {
        await require('./utility').timeout(500);

        const f = {
            filename: '1.pdf',
            extname: 'pdf',
            mime: 'application/pdf',
            hash: 'ab05227ac3da7a8fa70a8297d88a1916625ef6ec7110fb782074010efabef384',
            hash_alg: 'keccak256',
            size: 3048359,
            encryption: {
                algorithm: 'aes256-ctr',
                key: 'eyJrZXkiOiJkZTNmN2NkOTc3Y2JjZjQ4ZDNiYTA3NWRjMmE3OGM1ZjBlNDg2ODJjMWExNzZlOThlYmYzZmQ5ZWFiNzNjYWI3IiwiY3RyIjoyNTkwMDI1MjMsImFsZyI6ImFlczI1Ni1jdHIifQ=='
            },
            slices: [
                'ipfs://Qmd4B35PDWHnWaRQFFwF9FgV8YnqfYfxnnmwWYFZpfqQk3',
                'ipfs://QmfBhfe1GhQKWoiZCkg6th5LuKLkZLEdQysAAsExjZSEFm',
                'ipfs://QmY7gMRJRLMLHVPXicaaZjnBidpCG9CW4i2CfwMuNLKUBi',
                'ipfs://QmXYTbrGMskAxAUmc1BRhSud2HuBPwEdcNP7sJpKZR22wQ',
                'ipfs://QmRQ6wcoeDJCJq7JidbBjtZHQoP8EaQrxLpLs9RWPqvT9A',
                'ipfs://QmZZPoyJwSWB4gu3x75vidvxSv9fJBoZew1Aeg5tch4LWd',
                'ipfs://Qmb5BztvxiA13YHzDvEzZeJopwiqkTMBUBfbu3whrSWpRe',
                'ipfs://QmWWWXERauyxYt5AUUxnzNYqsoFURR96rX8sWnfkvJS6CP',
                'ipfs://QmXXKB9Wor8SSWzKXuHb52A7ZnYHqERpskAorpciycbCb8',
                'ipfs://QmVUS1rGWN6ddgayeE4D9Jib5V9TGNyYvuEwQ5XDbcNCvk',
                'ipfs://QmYsuZzJVbSndTiYWh6vjEU9oahPLuoVj2cyWmMGXReZrE',
                'ipfs://QmcdtwnoycfF6Q4MhJVvPgWH23hV76yYtTkdqseSf9wDJB',
                'ipfs://QmRLXpYcZXcEeGxWTsdUkK9fAHNkLc61AGgnmSxk3DGQsk',
                'ipfs://QmVCNQGrriARdAGbbPzMikjf18SWkpGnW8Q3zYWdXvTa5f',
                'ipfs://QmVogrzNAXScagrQNzM6jm3rQwgLmB2iXNDbAFJQ8L1Gs5',
                'ipfs://QmZ7vLugqyukWGZkuzBJbwpWq9sChNCvpE1HGhQPtnjnuG',
                'ipfs://QmXaENF5Kc6XhF2KYJSWSCtPtGyW9FiFJYZQqJozC34k9E',
                'ipfs://QmUcgbYHVfTXUUJ96EKQPSWh5xDr4sE2zsYiGwsDA7QUyx'
            ]
        };


        const x = await add('/Users/leask/Desktop/t/1.pdf', { encryption: true });
        // console.log(x);

        // console.log(getIpfsCid('QmW3PDAHsEhNg9gECqpsaAiMxdLRgWi5enAZf8WAVQGDbu'));
        const a = await get(f);


        // const y = await ls(x.Hash);
        // console.log(JSON.stringify(y, null, 2));
        // const fs = require("fs");
        // const path = require("path");
        // let markdownFileUrl = "/Users/leask/Desktop/t/1.mkv";
        // const content = fs.readFileSync(markdownFileUrl, 'binary');
        // const fileHash = utility.keccak256(content);
        // console.log(fileHash);

        // let data = {
        //     file_hash: fileHash
        // };
        // const sign = utility.signBlockData(data, '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77');
        // console.log(sign);

        // await ls();


    } catch (err) {
        console.log(err);
    }
    process.exit(0);
})();
