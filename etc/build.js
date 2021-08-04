'use strict';

const { utilitas } = require('utilitas');
const quorum = require('../lib/quorum');
const path = require('path');
const fs = require('fs');

const modLog = (content) => { return utilitas.modLog(content, 'BUILD ETC'); };
const targetFile = 'index.json';
const fileContent = {};

const trimCode = (content, separator) => {
    const lines = content.split('\n');
    content = [];
    lines.map(x => { (x = x.trim()) && content.push(x); });
    return content.join(separator || '');
};

modLog('Loading files...');
(fs.readdirSync(__dirname) || []).filter(file => {
    return file.indexOf('.') !== 0
        && !new Set([path.basename(__filename), targetFile]).has(file);
}).forEach(file => {
    modLog(`> ${file}`);
    let content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    if (/\.json$/.test(file)) { content = trimCode(content); }
    if (/\.sol$/.test(file)) {
        const deps = quorum.compile(content, { depOnly: true });
        for (let i in deps) { fileContent[i] = trimCode(deps[i], '\n'); }
    }
    fileContent[file] = content;
});

modLog('Updating bundle...');
modLog(`> ${targetFile}`);
fs.writeFileSync(
    path.join(__dirname, targetFile),
    JSON.stringify(fileContent),
    { encoding: 'utf8', flag: 'w' }
);

modLog('Done!');
