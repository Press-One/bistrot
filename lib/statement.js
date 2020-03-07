'use strict';

const request = require('request-promise');
const assert = require('assert');
const utility = require('./utility');
const atm = require('./atm');
const config = require('./config');

const maxTransactionQueryCount = 100;

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const getApiUrl = () => {
    return utility.isArray(config.chainApi)
        ? config.chainApi[utility.getRandomInt(config.chainApi.length)]
        : config.chainApi;
};

const pack = async (data, options) => {
    if (data) {
        options = options || {};
        const [tan, taf, tto, tat, tfi, tfo, dep, wdr, ukn] = [
            'transactions_trx_transaction_actions_name',
            'transactions_trx_transaction_actions_data__from_user',
            'transactions_trx_transaction_actions_data__to_user',
            'transactions_trx_transaction_actions_data_type',
            'TRANSFER IN ',
            'TRANSFER OUT',
            'DEPOSIT',
            'WITHDRAW',
            'UNKNOW',
        ];
        data[tat] = (data[tan] === 'transfer' && options.account
            ? (data[taf] === options.account ? tfo : tfi)
            : ([null, dep, wdr][~~data[tat]])) || ukn;
        if ([tfo, wdr].includes(data[tat])) {
            data.type = 'EXPENSE';
            if (wdr === data[tat]) {
                data[tto] = 'MIXIN';
            }
        } else if ([tfi, dep].includes(data[tat])) {
            data.type = 'INCOME';
            if (dep === data[tat]) {
                data[taf] = 'MIXIN';
            }
        } else {
            data.type = ukn;
        }
        data.currency = atm.mixinCurrency;
    }
    return data;
};

const packBatch = async (data, options) => {
    for (let item of data || []) {
        item = await pack(item, options);
    }
    return data;
};

const query = async (account, timestamp, type, count, options) => {
    options = options || {};
    atm.assertAccountName(account);
    timestamp && assert(utility.isDate(
        timestamp = new Date(timestamp), true
    ), 'Invalid timestamp.');
    assert(['INCOME', 'EXPENSE', '', 'ALL'].includes(
        String(type || '').toUpperCase()
    ), 'Invalid statement type');
    count = parseInt(count || 100);
    count = count < 1 ? 1 : count;
    count = count > maxTransactionQueryCount ? maxTransactionQueryCount : count;
    let args = { count };
    if (timestamp) {
        args[timestamp] = timestamp.toISOString();
    }
    if (type) {
        args[type] = type;
    }
    const req = {
        method: 'GET',
        json: true,
        uri: utility.assemblyUrl(
            `${getApiUrl()}/api/chain/statements/${account}`, args
        ),
    };
    const result = await request(req).promise();
    assert(result && result.data && !result.errors, 'Error querying statement.');
    options.account = account;
    return await packBatch(result.data, options);
};

module.exports = {
    query,
};
