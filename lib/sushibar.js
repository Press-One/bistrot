'use strict';

const log = (content) => { return utilitas.modLog(content, __filename); };

let apiUrl = null;

const getApiUrl = async (path, args) => {
    const pfncs = await config({ basicConfigOnly: true });
    if (!apiUrl && pfncs.speedTest && pfncs.debug) {
        log('Evaluating Chain API nodes...');
    }
    apiUrl = pfncs.speedTest
        ? await network.pickFastestHost(pfncs.chainApi, { debug: pfncs.debug })
        : utilitas.getConfigFromStringOrArray(pfncs.chainApi);
    utilitas.assert(apiUrl, 'Chain api root has not been configured', 500);
    return path ? utilitas.assembleApiUrl(apiUrl, `api/${path}`, args) : apiUrl;
};

const requestApi = async (method, path, urlArgs, body, error, options = {}) => {
    utilitas.assert(method && path, 'Invalid chain api requesting args.', 400);
    const req = { method: method, ...options };
    if (body) { req.body = body; }
    const result = await fetch(await getApiUrl(path,
        urlArgs), req).then(res => res.json());
    utilitas.assert(result && result.data && !result.error, error
        || 'Error querying chain api.', 500);
    return result.data;
};

const getNodes = async () => {
    return await requestApi('GET', 'nodes');
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
    getNodes,
    getTransactionById,
    requestApi,
};

const { utilitas, network, fetch } = require('utilitas');
const config = require('./config');
