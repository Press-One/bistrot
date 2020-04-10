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
        uri: utility.assemblyUrl(`${ipfsApi}/ls`, {
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
        console.log(enc);
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

(async () => {
    try {
        await require('./utility').timeout(500);

        const x = await add('/Users/leask/Desktop/t/1.pdf', { encryption: true });
        console.log(x);

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
