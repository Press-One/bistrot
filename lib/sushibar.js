'use strict';

const log = (content) => { return utilitas.modLog(content, __filename); };

let api = null;

const getApiUrl = async (path, args, options) => {
    options = options || {};
    const authority = utilitas.insensitiveCompare(path, 'nodes');
    const safe = utilitas.insensitiveCompare(path, 'finance/pay');
    const c = await config({ authority, safe });
    if (options.api) {
        return path ? utilitas.assembleApiUrl(options.api, `api/${path}`, args)
            : options.api;
    }
    let curApi = api;
    if (!curApi) {
        if (c.speedTest) {
            if (c.debug) { log('Evaluating Chain API nodes...'); }
            curApi = await network.pickFastestHttpServer(
                c.chainApi, { debug: c.debug }
            );
        } else { curApi = utilitas.getConfigFromStringOrArray(c.chainApi); }
    }
    utilitas.assert(curApi, 'Chain api root has not been configured', 500);
    if (!authority && !safe) { api = curApi; }
    return path ? utilitas.assembleApiUrl(curApi, `api/${path}`, args) : curApi;
};

const requestApi = async (method, path, urlArgs, body, error, options) => {
    options = options || {};
    options.headers = options.headers || {};
    utilitas.assert(method && path, 'Invalid chain api requesting args.', 400);
    const url = await getApiUrl(path, urlArgs, options);
    options.api && delete options.api;
    if (method === 'POST' && utilitas.isObject(body)) {
        options.headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }
    const req = { method: method, ...options };
    if (body) { req.body = body; }
    const result = await fetch(url, req).then(res => res.json());
    utilitas.assert(
        result && result.data && !result.error,
        error || result.error || 'Error querying chain api.', 500
    );
    return result.data;
};

const getTransactionById = async (transactionId) => {
    transactionId = String(transactionId || '').trim().toUpperCase();
    utilitas.assert(transactionId, 'Invalid transaction id.', 400);
    let [trx, error] = [null, 'Error querying transaction.'];
    const resp = await requestApi('GET',
        `chain/transactions/${transactionId}`, null, null, error);
    utilitas.assert(
        resp
        && resp.block
        && resp.block.transactions
        && resp.block.transactions.length, error, 500
    );
    for (let i in resp.block.transactions) {
        if (transactionId === (
            resp.block.transactions[i]
            && resp.block.transactions[i].trx
            && resp.block.transactions[i].trx.id
        )) { trx = resp.block.transactions[i].trx.transaction; break; }
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
    getApiUrl,
    getTransactionById,
    requestApi,
};

const { utilitas, network, fetch } = require('utilitas');
const config = require('./config');
