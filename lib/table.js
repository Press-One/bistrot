'use strict';

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
    return await sushitrain.rpcRequest('POST', 'chain/get_table_rows', query);
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
    // https://cmichel.io/how-to-fetch-table-indexes-using-eosjs/
    (resp && resp.rows ? resp.rows : []).map(x => {
        if (x.owner !== lower_bound) { result.push(x); }
    });
    resp.more = resp.more && (resp.rows = result).length;
    return resp;
};

const getAll = async (
    account, table, lower_bound_field,
    index_postion, key_type, limit, options = {}
) => {
    let [result, lower_bound, more] = [[], null, true];
    do {
        const resp = await queryByRange(
            account, table, lower_bound, index_postion, key_type, limit, options
        );
        resp.rows.map(x => {
            result.push(x); lower_bound = x[lower_bound_field || 'id'];
        });
        more = resp.more;
    } while (more);
    return result;
};

module.exports = {
    maxQueryRows,
    getAll,
    query,
    queryByKeyAndValue,
    queryByRange,
};

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
