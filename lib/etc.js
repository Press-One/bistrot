'use strict';

const readFile = async (filename) => {
    const efile = etcBundle[filename];
    utilitas.assert(efile, `File not found: \`${filename}\` .`);
    return efile;
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
    let [content, nodes] = await Promise.all([
        readFile('config.ini'), node.queryAll()
    ]);
    const addses = [];
    nodes.map(x => {
        if (x.status === 'NORMAL' && x.p2p_port) {
            addses.push(`p2p-peer-address = ${x.ip}:${x.p2p_port}`);
        }
    });
    content = content.replace(/\{\{p2p\-peer\-address\}\}/g, addses.join('\n'));
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

const { utilitas } = require('sushitrain');
const etcBundle = require('../etc/index.json');
const node = require('./node');
const fs = require('fs').promises;
