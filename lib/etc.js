'use strict';

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const writeFile = util.promisify(fs.writeFile);

const buildGenesis = async () => {
    return await readFile('./etc/genesis.json', 'utf8');
};

const dumpFile = async (file, content) => {
    return await writeFile(file, content);
};

module.exports = {
    buildGenesis,
    dumpFile,
};
