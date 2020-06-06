"use strict";

const { utilitas } = require('utilitas');
const { Pool } = require('pg');

const pool = global.chainConfig && global.chainConfig.database
    ? new Pool(global.chainConfig.database) : null;

const query = async (text, params) => {
    utilitas.assert(pool, 'Database is not initialized.', 500);
    return await pool.query(text, params);
};

module.exports = {
    query,
};
