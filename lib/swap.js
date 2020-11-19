'use strict';

const getPool = async () => {
    return await table.getAll('prs.swap', 'pool');
};

module.exports = {
    getPool,
};

const table = require('./table');
