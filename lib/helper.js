'use strict';

const { utilitas, network } = require('utilitas');
const config = require('./config');
const fetch = require('node-fetch');

const getChainApiUrl = async () => {
    const url = config.speedTest
        ? await network.pickFastestHost(
            config.chainApi, { debug: config.debug }
        )
        : utilitas.getConfigFromStringOrArray(config.chainApi);
    utilitas.assert(url, 'Chain api root has not been configured', 500);
    return url;
};

const assembleChainApiUrl = async (path, args) => {
    return utilitas.assembleApiUrl(await getChainApiUrl(), `api/${path}`, args);
};

const assembleIpfsApiUrl = (path, args) => {
    return utilitas.assembleApiUrl(config.ipfsApi, `api/v0/${path}`, args);
};

const requestChainApi = async (
    method, path, urlArgs, body, error, options = {}
) => {
    utilitas.assert(method && path, 'Invalid chain api requesting args.', 400);
    const req = { method: method, ...options };
    if (body) {
        req.body = body;
    }
    const result = await fetch(await assembleChainApiUrl(path,
        urlArgs), req).then(res => res.json());
    utilitas.assert(result && result.data && !result.error, error
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
        && resp.data.block
        && resp.data.block.transactions
        && resp.data.block.transactions.length, error, 500
    );
    for (let i in resp.data.block.transactions) {
        if (transactionId === (
            resp.data.block.transactions[i]
            && resp.data.block.transactions[i].trx
            && resp.data.block.transactions[i].trx.id
        )) {
            trx = resp.data.block.transactions[i].trx.transaction;
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
