'use strict';

const path = require('path');
const fs = require('fs');

fs.readdirSync(__dirname).filter((file) => {
    return /\.js$/i.test(file) && file.toLowerCase() !== 'config.js';
}).forEach((file) => {
    module.exports[file.replace(/^(.*)\.js$/, '$1')] = require(
        path.join(__dirname, file)
    );
});
