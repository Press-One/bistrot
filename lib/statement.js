'use strict';

const request = require('request-promise');
const assert = require('assert');
const atm = require('./atm');
const config = require('./config');

const maxTransactionQueryCount = 100;

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const getType = (object) => {
    return typeof object === 'undefined' ? 'Undefined'
        : Object.prototype.toString.call(object).replace(
            /^\[[^\ ]*\ (.*)\]$/, '$1'
        );
};

const is = (object, type) => {
    return getType(object) === type;
};

const isArray = (object) => {
    return is(object, 'Array');
};

const isDate = (object, strict) => {
    return is(object, 'Date') ? (
        strict ? object.toTimeString().toLowerCase() !== 'invalid date' : true
    ) : false;
};

const pack = async (data, options) => {
    if (data) {
        options = options || {};
        const [tan, taf, tto, tat, tfi, tfo, dep, wdr, ukn] = [
            'transactions_trx_transaction_actions_name',
            'transactions_trx_transaction_actions_data__from_user',
            'transactions_trx_transaction_actions_data__to_user',
            'transactions_trx_transaction_actions_data_type',
            'TRANSFER_IN',
            'TRANSFER_OUT',
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

const packBatch = async (data) => {
    for (let item of data || []) {
        item = await pack(item);
    }
    return data;
};

const query = async (account, timestamp, type, count, options) => {
    assert(atm.verifyAccountName(account), 'Invalid account.');
    timestamp && assert(
        isDate(timestamp = new Date(timestamp), true), 'Invalid timestamp.'
    );
    assert(['INCOME', 'EXPENSE', '', 'ALL'].includes(
        String(type || '').toUpperCase()
    ), 'Invalid statement type');
    count = parseInt(count || 100);
    count = count < 1 ? 1 : count;
    count = count > maxTransactionQueryCount ? maxTransactionQueryCount : count;
    let args = [];
    if (timestamp) {
        args.push(['timestamp', timestamp]);
    }
    if (type) {
        args.push(['type', type]);
    }
    const req = {
        method: 'GET',
        uri: `${config.chainApi}/api/chain/statements/${account}?count=${count}${
            args.map(x => {
                return `${x[0]}=${encodeURIComponent(x[1])}`;
            }).join('&')}`,
        json: true,
    };
    const result = await request(req).promise();
    assert(result && result.data && !result.errors, 'Error querying statement.');
    return await packBatch(result.data);
};

module.exports = {
    isArray,
    query,
};
