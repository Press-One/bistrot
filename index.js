'use strict';

const path = require('path');
const fs = require('fs');

module.exports = require('utilitas');
module.exports['eos-name-verify'] = require('eos-name-verify');
module.exports['eosjsKeygen'] = require('eosjs-keygen');
module.exports['prsUtility'] = require('prs-utility');
module.exports['eosjsKeos'] = require('eosjs-keos');
module.exports['eosjsEcc'] = require('eosjs-ecc');
module.exports['eosjs'] = require('eosjs');
module.exports['pg'] = require('pg');
module.exports['ws'] = require('ws');

const libPath = path.join(__dirname, 'lib');
fs.readdirSync(libPath).filter((file) => {
    return /\.js$/i.test(file)
        && file.indexOf('.') !== 0
        && file.toLowerCase() !== 'config.js';
}).forEach((file) => {
    module.exports[file.replace(/^(.*)\.js$/, '$1')]
        = require(path.join(libPath, file));
});
