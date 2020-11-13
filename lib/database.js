'use strict';

let pool = null;

const getPool = async () => {
    if (!pool) {
        pool = new Pool((await config({ basicConfigOnly: true })).database);
    }
    utilitas.assert(pool, 'Database has not been initialized.', 501);
    return pool;
};

const query = async (text, params) => {
    return await (await getPool()).query(text, params);
};

module.exports = {
    getPool,
    query,
};

const { utilitas } = require('utilitas');
const { Pool } = require('pg');
const config = require('./config');
