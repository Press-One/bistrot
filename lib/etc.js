'use strict';

const abis = {};

const getFileByName = async (filename, options) => {
    let efile = etcBundle[filename];
    utilitas.assert(efile, `File not found: \`${filename}\` .`);
    options?.json && (efile = JSON.parse(efile));
    return efile;
};

// https://github.com/ConsenSys/abi-decoder
const getAbiByName = async (name, options) => {
    utilitas.assert(name, 'Invalid ABI name.', 400);
    if (!abis[name]) {
        abis[name] = await getFileByName(
            `abi${name}.json`, { json: true, ...options || {} }
        );
        abiDecoder.addABI(abis[name].abi);
        abis[name].contract = name;
        abis[name].decoder = abiDecoder;
    }
    return abis[name];
};

const getAllAbis = async (options) => {
    for (let i in etcBundle) {
        if (i.startsWith('abi')) {
            await getAbiByName(i.replace(/^abi(.*)\.json$/, '$1'), options);
        }
    }
    return abis;
};

const getAbiByAddress = async (address, options) => {
    utilitas.assert(address, 'Invalid ABI address.', 400);
    const a = await getAllAbis(options);
    for (let i in a) {
        if (utilitas.insensitiveCompare(a[i].address, address)) { return a[i]; }
    }
    utilitas.throwError('ABI not found.', 400);
};

const getAbiDecoder = async (options) => {
    await getAllAbis(options);
    return abiDecoder;
};

const dumpFile = async (file, content, options) => {
    options = options || {};
    if (!options.overwrite) {
        let stat = null;
        try { stat = await fs.stat(file); } catch (err) {
            utilitas.assert(err.code === 'ENOENT',
                err.message || 'Invalid path.', 400);
        }
        utilitas.assert(!stat, 'File already exists.', 400);
    }
    const result = [];
    result.push(await fs.writeFile(file, content, 'utf8'));
    if (options.executable) {
        await utilitas.timeout(1000);
        result.push(await fs.chmod(file, '755'));
    }
    return result;
};

module.exports = {
    dumpFile,
    getAbiByAddress,
    getAbiByName,
    getAbiDecoder,
    getAllAbis,
    getFileByName,
};

const { utilitas } = require('utilitas');
const abiDecoder = require('abi-decoder');
const etcBundle = require('../etc/index.json');
const fs = require('fs').promises;
