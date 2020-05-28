'use strict';

const request = require('request-promise');
const utility = require('./utility');
const config = require('./config');
const assert = require('assert');

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const getChainApiUrl = () => {
    return utility.isArray(config.chainApi)
        ? config.chainApi[utility.getRandomInt(config.chainApi.length)]
        : config.chainApi;
};

const assembleApiUrl = (host, path, args) => {
    return utility.assembleUrl(`${host}/${path}`, args);
};

const assembleChainApiUrl = (path, args) => {
    return assembleApiUrl(getChainApiUrl(), `api/${path}`, args);
};

const assembleIpfsApiUrl = (path, args) => {
    return assembleApiUrl(config.ipfsApi, `api/v0/${path}`, args);
};

const assembleMixinApiUrl = (path, args) => {
    return assembleApiUrl('https://mixin.one/', path, args);
};

const requestChainApi = async (method, path, urlArgs, body, error, options) => {
    assert(method && path, 'Invalid chain api requesting args.');
    const req = {
        method: method,
        json: true,
        uri: assembleChainApiUrl(path, urlArgs),
    };
    if (body) {
        req.body = body;
    }
    const result = await request(req).promise();
    assert(
        result && result.data && !result.errors,
        error || 'Error querying chain api.'
    );
    return result;
};

const getTransactionById = async (transactionId) => {
    transactionId = String(transactionId || '').trim().toUpperCase();
    assert(transactionId, 'Invalid transaction id.');
    let [trx, error] = [null, 'Error querying transaction.'];
    const resp = await requestChainApi(
        'GET', `chain/transactions/${transactionId}`, null, null, error
    );
    assert(
        resp
        && resp.data
        && resp.data.transaction
        && resp.data.transaction.block
        && resp.data.transaction.block.transactions
        && resp.data.transaction.block.transactions.length,
        error
    );
    for (let i in resp.data.transaction.block.transactions) {
        if (transactionId === (
            resp.data.transaction.block.transactions[i]
            && resp.data.transaction.block.transactions[i].trx
            && resp.data.transaction.block.transactions[i].trx.id
        )) {
            trx = resp.data.transaction.block.transactions[i].trx.transaction;
            break;
        }
    }
    assert(
        trx
        && trx.actions
        && trx.actions.length
        && trx.actions[0]
        && trx.actions[0].data,
        error
    );
    if (trx.actions[0].data.unpacked_meta) {
        trx.actions[0].data.meta = trx.actions[0].data.unpacked_meta;
        delete trx.actions[0].data.unpacked_meta;
    }
    if (trx.actions[0].data.unpacked_data) {
        trx.actions[0].data.data = trx.actions[0].data.unpacked_data;
        delete trx.actions[0].data.unpacked_data;
    }
    return { data: trx.actions[0].data, transaction: resp.data };
};

module.exports = {
    assembleChainApiUrl,
    assembleIpfsApiUrl,
    assembleMixinApiUrl,
    requestChainApi,
    getTransactionById,
};
