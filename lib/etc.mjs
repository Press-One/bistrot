import { promises as fs } from 'fs';
import { utilitas } from 'utilitas';
import abiDecoder from 'abi-decoder';
import * as crypto from './crypto.mjs';
import * as quorum from './quorum.mjs';
import web3 from 'web3';

// import * as etcBundle from '../etc/index.json'; {
// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const etcBundle = require('../etc/index.json');
// }
const abis = {};

const getFileByName = (filename, options) => {
    let efile = etcBundle[filename];
    utilitas.assert(efile, `File not found: \`${filename}\` .`);
    options?.json && (efile = JSON.parse(efile));
    return efile;
};

// https://github.com/ConsenSys/abi-decoder
const getAbiByName = async (name, options) => {
    utilitas.assert(name, 'ABI name is required.', 400);
    if (!abis[name]) {
        abis[name] = getFileByName(
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
    crypto.assertAddress(address);
    const a = await getAllAbis(options);
    for (let i in a) {
        if (utilitas.insensitiveCompare(a[i].address, address)) { return a[i]; }
    }
    utilitas.throwError('ABI not found.', 400);
};

const getAbiByNameOrAddress = async (nameOrAdd, options) => {
    try {
        return await (
            web3.utils.isAddress(nameOrAdd)
                ? getAbiByAddress(nameOrAdd, options)
                : getAbiByName(nameOrAdd, options)
        );
    } catch (err) { utilitas.assert(options?.ignoreError, err, 400); }
};

const getContractNameByAddress = async (address, options) => {
    return (await getAbiByNameOrAddress(
        address, { ...options || {}, ignoreError: true }
    ))?.contract || null;
};

const getSolByName = async (name, op) => {
    let sol = getFileByName(`sol${name}.sol`, op);
    if (!op?.raw) { sol = quorum.compile(sol, { single: true, ...op || {} }); }
    return sol;
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

export {
    dumpFile,
    getAbiByNameOrAddress,
    getAbiDecoder,
    getAllAbis,
    getContractNameByAddress,
    getFileByName,
    getSolByName,
};
