'use strict';

const { account, table, mixin, utilitas, sushibar } = require('sushitrain');

const transactionTypes = [
    'INCOME', 'EXPENSE', 'TRANSFER', 'DEPOSIT', 'WITHDRAW', 'REWARD', 'ALL'
];

const [d, r, a, t, f, y, u, m, i, o, e, n, l] = [
    'transactions_trx_transaction_actions_data_data',
    'transactions_trx_transaction_actions_data__sync_auth__result',
    'transactions_trx_transaction_actions_data__amount_quantity__amt',
    'transactions_trx_transaction_actions_data__to_user',
    'transactions_trx_transaction_actions_data__from_user',
    'transactions_trx_transaction_actions_data_type',
    'UNKNOW', 'MIXIN', 'INCOME', 'EXPENSE', 'SUCCESS', 'INVALID', 'FAILED'
];

const pack = async (data, options = {}) => {
    if (data) {
        const [toMe, fromMe, s] = [
            options.account === data[t], options.account === data[f],
            data[a] > 0,
        ];
        switch (data.transactions_trx_transaction_actions_account
        + '-' + data.transactions_trx_transaction_actions_name) {
            case 'eosio.token-transfer':
                if (toMe) {
                    data.type = i; data[y] = 'TRANSFER IN';
                } else if (fromMe) {
                    data.type = o; data[y] = 'TRANSFER OUT';
                }
                data.status = s ? e : n;
                break;
            case 'prs.tproxy-sync':
                if (~~data[y] === 1) {
                    data.type = i; data[f] = m; data[y] = 'DEPOSIT';
                } else if (~~data[y] === 2) {
                    data.type = o; data[t] = m; data[y] = 'WITHDRAW';
                }
                data.status = s && data[r] ? e : l;
                break;
            case 'tprxy.oracle-cnfmpaymt':
                if (toMe) { data.type = i; } else if (fromMe) { data.type = o; }
                data.status = s ? e : n;
                data[y] = 'REWARD';
        }
        if (data.status !== e && data[d] && utilitas.isString(data[d].memo)) {
            data.detail = data[d].memo;
        } else if (data.status === l) {
            data.block.transactions.map(x => {
                if (x.trx.id === data.transactions_trx_id
                    && x.trx.transaction.actions[0]
                    && x.trx.transaction.actions[0].data
                    && utilitas.isString(
                        x.trx.transaction.actions[0].data.memo
                    )) {
                    data.detail = x.trx.transaction.actions[0].data.memo;
                }
            });
        } else {
            data.detail = '';
        }
        if (/Insufficient balance/.test(data.detail)) {
            data.detail = 'Insufficient balance.';
        }
        if (/please wait for manual review/.test(data.detail)) {
            data.detail = 'Manual review failed.';
        }
        if (/^FAILED/i.test(data.detail)) {
            data.detail = data.detail.replace(/^FAILED(:| \/) /, '');
        }
        if (/Mixin User ID/i.test(data.detail)) {
            data.detail = data.detail.replace(/Mixin User ID/, 'Mixin ID');
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

const query = async (acc, timestamp, type, count, detail, options = {}) => {
    account.assertName(acc);
    timestamp && utilitas.assert(utilitas.isDate(timestamp
        = new Date(timestamp), true), 'Invalid timestamp.', 400);
    utilitas.assert([...transactionTypes, ''].includes(
        String(type || '').toUpperCase()
    ), 'Invalid statement type', 400);
    count = parseInt(count || 100);
    count = count < 1 ? 1 : count;
    count = count > table.maxQueryRows ? table.maxQueryRows : count;
    let args = { count };
    if (timestamp) { args[timestamp] = timestamp.toISOString(); }
    if (type) { args.type = type; }
    if (detail) { args.detail = detail }
    const result = await sushibar.requestApi('GET', `chain/statements/${acc}`,
        args, null, 'Error querying statement.', options);
    options.account = acc;
    return await packBatch(result, options);
};

module.exports = {
    transactionTypes,
    query,
};
