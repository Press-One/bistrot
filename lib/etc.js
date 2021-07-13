'use strict';

const readFile = async (filename, options) => {
    let efile = etcBundle[filename];
    utilitas.assert(efile, `File not found: \`${filename}\` .`);
    options?.json && (efile = JSON.parse(efile));
    return efile;
};

const readAbi = async (name, options) => {
    utilitas.assert(name, 'Invalid ABI name.', 400);
    return await readFile(`abi${name}.json`, { json: true, ...options || {} });
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
    readFile,
    readAbi,
};

const { utilitas } = require('utilitas');
const etcBundle = require('../etc/index.json');
const fs = require('fs').promises;
