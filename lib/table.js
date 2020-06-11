'use strict';

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
const request = require('request-promise');

const maxQueryRows = 1000;

const query = async (account, table, options = {}) => {
    utilitas.assert(account, 'EOS account is required.', 400);
    utilitas.assert(table, 'EOS table is required.', 400);
    const query = { table: table, scope: account, code: account, json: true };
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
    account, table, value, index_postion = 1, key_type = 'name', options = {}
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

const queryByRange = async (
    account, table, lower_bound, index_postion = 1,
    key_type = 'name', limit = maxQueryRows, options = {}
) => {
    const [result, resp] = [[], await query(account, table, {
        key_type, index_postion, lower_bound, limit,
    })];
    (resp && resp.rows ? resp.rows : []).map(x => {
        // https://cmichel.io/how-to-fetch-table-indexes-using-eosjs/
        if (x.owner !== lower_bound) {
            result.push(x);
        }
    });
    resp.more = resp.more && (resp.rows = result).length;
    return resp;
};

module.exports = {
    maxQueryRows,
    query,
    queryByKeyAndValue,
    queryByRange,
};
