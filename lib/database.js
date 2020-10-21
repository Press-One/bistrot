'use strict';

const { Pool } = require('pg');
const config = require('./config');

const pool = config().database ? new Pool(config().database) : null;

const query = async (text, params) => {
    utilitas.assert(pool, 'Database is not initialized.', 500);
    return await pool.query(text, params);
};

module.exports = {
    query,
};

const { utilitas } = require('utilitas');
