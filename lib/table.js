'use strict';

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
const request = require('request-promise');

const query = async (account, table, options = {}) => {
    utilitas.assert(account, 'EOS account is required.', 400);
    utilitas.assert(table, 'EOS table is required.', 400);
    const query = {
        table: table,
        scope: account,
        code: account,
        json: true,
    };
    for (let i in options) {
        switch (i) {
            case 'limit':
                query[i] = ~~options[i] || 1;
                break;
            case 'index_postion':
            case 'key_type':
            case 'upper_bound':
            case 'lower_bound':
                query[i] = options[i];
                break;
        }
    }
    return await request({
        method: 'POST',
        uri: `${sushitrain.rpcApiRoot}chain/get_table_rows`,
        json: true,
        body: query,
    }).promise();
};

const queryByKeyAndValue = async (
    account, table, index_postion, key_type, value, options = {}
) => {
    const opts = Object.assign({
        index_postion,
        key_type,
        upper_bound: value,
        lower_bound: value,
        limit: 1,
    }, options)
    const result = await query(account, table, opts);
    return result && result.rows && result.rows.length ? result.rows[0] : null;
};

module.exports = {
    query,
    queryByKeyAndValue,
};
