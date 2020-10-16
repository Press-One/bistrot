'use strict';

const path = require('path');
const fs = require('fs');

const libPath = path.join(__dirname, 'lib');

fs.readdirSync(libPath).filter((file) => {
    return /\.js$/i.test(file)
        && file.indexOf('.') !== 0
        && file.toLowerCase() !== 'config.js';
}).forEach((file) => {
    module.exports[file.replace(/^(.*)\.js$/, '$1')]
        = require(path.join(libPath, file));
});
