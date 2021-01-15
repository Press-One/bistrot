'use strict';

const { utilitas } = require('utilitas');
const path = require('path');
const fs = require('fs');

const modLog = (content) => { return utilitas.modLog(content, 'BUILD ETC'); };
const fileContent = {};

modLog('Loading files...');
(fs.readdirSync(__dirname) || []).filter(file => {
    return file.indexOf('.') !== 0 && file !== __filename;
}).forEach(file => {
    fileContent[file] = fs.readFileSync(path.join(__dirname, file), 'utf8');
});

modLog('Updating bundle...');
fs.writeFileSync(
    path.join(__dirname, 'index.json'),
    JSON.stringify(fileContent),
    { encoding: 'utf8', flag: 'w' }
);

modLog('Done!');
