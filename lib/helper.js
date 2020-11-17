'use strict';

const { utilitas, sushibar } = require('sushitrain');
const config = require('./config');

// @todo: changed from sync to async!
const assembleIpfsApiUrl = async (path, args) => {
    const pfncs = await config();
    return utilitas.assembleApiUrl(pfncs.ipfsApi, `api/v0/${path}`, args);
};

const getTransactionById = async (transactionId) => {
    transactionId = String(transactionId || '').trim().toUpperCase();
    utilitas.assert(transactionId, 'Invalid transaction id.', 400);
    let [trx, error] = [null, 'Error querying transaction.'];
    const resp = await sushibar.requestApi('GET',
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
    assembleIpfsApiUrl,
    getTransactionById,
};
