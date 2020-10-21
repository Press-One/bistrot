'use strict';

const utilitas = require('utilitas');
const path = require('path');
const fs = require('fs');

const lib = (options = {}) => {
    utilitas.mergeAtoB(options, global.chainConfig = global.chainConfig || {});
    return lib;
};

Object.assign(lib, utilitas);

const libPath = path.join(__dirname, 'lib');
fs.readdirSync(libPath).filter((file) => {
    return /\.js$/i.test(file)
        && file.indexOf('.') !== 0
        && file.toLowerCase() !== 'config.js';
}).forEach((file) => {
    lib[file.replace(/^(.*)\.js$/, '$1')] = require(path.join(libPath, file));
});

module.exports = lib;
