'use strict';

const defaultPort = 5432;
const log = (content) => { return utilitas.modLog(content, __filename); };

let pool = null;

const init = async (options) => {
    options = options || (await config({ basicConfigOnly: true })).database;
    if (!pool && options) {
        const { Pool: pg } = require('pg');
        pool = new pg(options);
        if (!options.silent) {
            log(`Initialized: postgresql://${options.user}@${options.host}`
                + `:${options.port || defaultPort}/${options.database} .`);
        }
    }
    utilitas.assert(pool, 'Database has not been initialized.', 501);
    return pool;
};

const end = async (options) => {
    pool && pool.end();
    log('Terminated.');
};

const query = async (text, params) => {
    return await (await init()).query(text, params);
};

module.exports = {
    end,
    init,
    query,
};

const { utilitas } = require('utilitas');
const config = require('./config');
