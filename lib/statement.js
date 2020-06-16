'use strict';

const { account, table, mixin } = require('sushitrain');
const { utilitas } = require('utilitas');
const helper = require('./helper');

const pack = async (data, options = {}) => {
    if (data) {
        const [tan, taf, tto, tat, tfi, tfo, dep, wdr, ukn] = [
            'transactions_trx_transaction_actions_name',
            'transactions_trx_transaction_actions_data__from_user',
            'transactions_trx_transaction_actions_data__to_user',
            'transactions_trx_transaction_actions_data_type',
            'TRANSFER IN ', 'TRANSFER OUT', 'DEPOSIT', 'WITHDRAW', 'UNKNOW',
        ];
        data[tat] = (data[tan] === 'transfer' && options.account
            ? (data[taf] === options.account ? tfo : tfi)
            : ([null, dep, wdr][~~data[tat]])) || ukn;
        if ([tfo, wdr].includes(data[tat])) {
            data.type = 'EXPENSE';
            if (wdr === data[tat]) { data[tto] = 'MIXIN'; }
        } else if ([tfi, dep].includes(data[tat])) {
            data.type = 'INCOME';
            if (dep === data[tat]) { data[taf] = 'MIXIN'; }
        } else {
            data.type = ukn;
        }
        data.currency = mixin.defaultCurrency;
    }
    return data;
};

const packBatch = async (data, options = {}) => {
    for (let item of data || []) { item = await pack(item, options); }
    return data;
};

const query = async (acc, timestamp, type, count, options = {}) => {
    account.assertName(acc);
    timestamp && utilitas.assert(utilitas.isDate(timestamp
        = new Date(timestamp), true), 'Invalid timestamp.', 400);
    utilitas.assert(['INCOME', 'EXPENSE', '', 'ALL'].includes(
        String(type || '').toUpperCase()
    ), 'Invalid statement type', 400);
    count = parseInt(count || 100);
    count = count < 1 ? 1 : count;
    count = count > table.maxQueryRows ? table.maxQueryRows : count;
    let args = { count };
    if (timestamp) { args[timestamp] = timestamp.toISOString(); }
    if (type) { args[type] = type; }
    const result = await helper.requestChainApi(
        'GET', `chain/statements/${acc}`, args,
        null, 'Error querying statement.', options
    );
    options.account = acc;
    return await packBatch(result.data, options);
};

module.exports = {
    query,
};
