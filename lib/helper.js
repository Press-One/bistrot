'use strict';

const { utilitas } = require('utilitas');
const config = require('./config');
const fetch = require('node-fetch');

const getChainApiUrl = () => {
    return utilitas.getConfigFromStringOrArray(config.chainApi);
};

const assembleApiUrl = (host, path, args) => {
    return utilitas.assembleUrl(`${host}/${path}`, args);
};

const assembleChainApiUrl = (path, args) => {
    return assembleApiUrl(getChainApiUrl(), `api/${path}`, args);
};

const assembleIpfsApiUrl = (path, args) => {
    return assembleApiUrl(config.ipfsApi, `api/v0/${path}`, args);
};

const requestChainApi = async (
    method, path, urlArgs, body, error, options = {}
) => {
    utilitas.assert(method && path, 'Invalid chain api requesting args.', 400);
    const req = { method: method, ...options };
    if (body) {
        req.body = body;
    }
    const result = await fetch(assembleChainApiUrl(path,
        urlArgs), req).then(res => res.json());
    utilitas.assert(result && result.data && !result.errors, error
        || 'Error querying chain api.', 500);
    return result;
};

const getTransactionById = async (transactionId) => {
    transactionId = String(transactionId || '').trim().toUpperCase();
    utilitas.assert(transactionId, 'Invalid transaction id.', 400);
    let [trx, error] = [null, 'Error querying transaction.'];
    const resp = await requestChainApi(
        'GET', `chain/transactions/${transactionId}`, null, null, error
    );
    utilitas.assert(
        resp
        && resp.data
        && resp.data.transaction
        && resp.data.transaction.block
        && resp.data.transaction.block.transactions
        && resp.data.transaction.block.transactions.length, error, 500
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
    utilitas.assert(
        trx
        && trx.actions
        && trx.actions.length
        && trx.actions[0]
        && trx.actions[0].data, error, 500
    );
    if (trx.actions[0].data.unpacked_meta) {
        trx.actions[0].data.meta = trx.actions[0].data.unpacked_meta;
        delete trx.actions[0].data.unpacked_meta;
    }
    if (trx.actions[0].data.unpacked_data) {
        trx.actions[0].data.data = trx.actions[0].data.unpacked_data;
        delete trx.actions[0].data.unpacked_data;
    }
    return { data: trx.actions[0].data, transaction: trx.actions[0] };
};

module.exports = {
    assembleChainApiUrl,
    assembleIpfsApiUrl,
    requestChainApi,
    getTransactionById,
};
