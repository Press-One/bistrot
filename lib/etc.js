'use strict';

const { utilitas } = require('utilitas');
const util = require('util');
const fs = require('fs');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const exists = util.promisify(fs.exists);
const chmod = util.promisify(fs.chmod);

const buildGenesis = async () => {
    return await readFile('./etc/genesis.json', 'utf8');
};

const buildConfig = async (
    producer_name, agent_name, public_key, private_key
) => {
    utilitas.assert(producer_name, 'Invalid producer name.', 400);
    utilitas.assert(private_key, 'Invalid private key.', 400);
    agent_name = agent_name || producer_name;
    let content = await readFile('./etc/config.ini', 'utf8');
    content = content.replace(/\{\{producer\-name\}\}/g, producer_name);
    content = content.replace(/\{\{agent\-name\}\}/g, agent_name);
    content = content.replace(/\{\{public\-key\}\}/g, public_key);
    content = content.replace(/\{\{private\-key\}\}/g, private_key);
    return content;
};

const buildRunservice = async () => {
    return await readFile('./etc/runservice.sh', 'utf8');
};

const dumpFile = async (file, content, options) => {
    options = options || {};
    utilitas.assert(options.overwrite
        || !await exists(file), 'File already exists.', 400);
    const result = [];
    result.push(await writeFile(file, content, 'utf8'));
    if (options.executable) {
        await utilitas.timeout(1000);
        result.push(await chmod(file, '755'));
    }
    return result;
};

module.exports = {
    buildGenesis,
    buildConfig,
    buildRunservice,
    dumpFile,
};
