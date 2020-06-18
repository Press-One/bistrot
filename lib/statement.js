'use strict';

const { account, table, mixin } = require('sushitrain');
const { utilitas } = require('utilitas');
const helper = require('./helper');

const pack = async (data, options = {}) => {
    if (data) {
        const [t, f, y, u, m, i, o] = [
            'transactions_trx_transaction_actions_data__to_user',
            'transactions_trx_transaction_actions_data__from_user',
            'transactions_trx_transaction_actions_data_type',
            'UNKNOW', 'MIXIN', '+ INCOME', '- EXPENSE',
        ];
        const toMe = options.account === data[t];
        const fromMe = options.account === data[f];
        switch (data.transactions_trx_transaction_actions_account
        + '-' + data.transactions_trx_transaction_actions_name) {
            case 'eosio.token-transfer':
                if (toMe) {
                    data.type = i; data[y] = 'TRANSFER IN';
                } else if (fromMe) {
                    data.type = o; data[y] = 'TRANSFER OUT';
                }
                break;
            case 'prs.tproxy-sync':
                if (~~data[y] === 1) {
                    data.type = i; data[f] = m; data[y] = 'DEPOSIT';
                } else if (~~data[y] === 2) {
                    data.type = o; data[t] = m; data[y] = 'WITHDRAW';
                }
                break;
            case 'proxy.oracle-cnfmpaymt':
                if (toMe) { data.type = i; } else if (fromMe) { data.type = o; }
                data[y] = 'REWARD';
        }
        data.currency = mixin.defaultCurrency;
        data.type = data.type || u;
        data[y] = data[y] || u;
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
