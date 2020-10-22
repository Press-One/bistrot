'use strict';

const { utilitas } = require('sushitrain');
const path = require('path');
const fs = require('fs').promises;

const readFile = async (filename) => {
    return await fs.readFile(path.join(path.dirname(module.filename),
        `../etc/${filename}`), 'utf8');
};

const buildGenesis = async () => {
    return await readFile('genesis.json');
};

const buildConfig = async (
    producer_name, agent_name, public_key, private_key
) => {
    utilitas.assert(producer_name, 'Invalid producer name.', 400);
    utilitas.assert(private_key, 'Invalid private key.', 400);
    agent_name = agent_name || producer_name;
    let content = await readFile('config.ini');
    content = content.replace(/\{\{producer\-name\}\}/g, producer_name);
    content = content.replace(/\{\{agent\-name\}\}/g, agent_name);
    content = content.replace(/\{\{public\-key\}\}/g, public_key);
    content = content.replace(/\{\{private\-key\}\}/g, private_key);
    return content;
};

const buildRunservice = async () => {
    return await readFile('runservice.sh');
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
    buildGenesis,
    buildConfig,
    buildRunservice,
    dumpFile,
};
