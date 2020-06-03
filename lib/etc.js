'use strict';

const utilitas = require('utilitas');
const assert = require('assert');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const writeFile = util.promisify(fs.writeFile);

const exists = util.promisify(fs.exists);

const chmod = util.promisify(fs.chmod);

const buildGenesis = async () => {
    return await readFile('./etc/genesis.json', 'utf8');
};

const buildConfig = async (
    producer_name, agent_name, public_key, private_key
) => {
    assert(producer_name, 'Invalid producer name.');
    assert(private_key, 'Invalid private key.');
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
    assert(options.overwrite || !await exists(file), 'File already exists.');
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
