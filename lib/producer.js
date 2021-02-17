'use strict';

const queryByRange = async (lower_bound, limit = table.maxQueryRows) => {
    return await (await sushitrain.getClient(
    )).api.rpc.get_producers(true, lower_bound, limit);
};

const queryByName = async (name) => {
    utilitas.assert(name, 'Producer name is required.', 400);
    const resp = await queryByRange(name, 1);
    let rslt = utilitas.extract(resp, 'rows', '0');
    rslt = utilitas.insensitiveCompare(name, rslt && rslt.owner) ? rslt : null;
    rslt && (rslt.total_producer_vote_weight = resp.total_producer_vote_weight);
    return rslt;
};

const getAll = async () => {
    let [rs, rows] = [null, []];
    do {
        rows = [...rows, ...(rs = await queryByRange(rs ? rs.more : '')).rows];
    } while (rs && rs.more);
    return { rows, total_producer_vote_weight: rs.total_producer_vote_weight };
};

const register = async (
    producer, url, location, producer_key, privateKey, options = {}
) => {
    utilitas.assert(producer, 'Producer is required.', 400);
    utilitas.assert(producer_key, 'Public key is required.', 400);
    utilitas.assert(privateKey, 'Private key is required.', 400);
    utilitas.assert(url
        ? utilitas.verifyUrl(url) : !(url = ''), 'Invalid producer url.', 400);
    return await sushitrain.transact(
        producer, privateKey, 'eosio', 'regproducer',
        { producer, producer_key, url, location: ~~location }, options
    );
};

const unRegister = async (producer, privateKey, options = {}) => {
    utilitas.assert(producer, 'Producer is required.', 400);
    utilitas.assert(privateKey, 'Private key is required.', 400);
    return await sushitrain.transact(
        producer, privateKey, 'eosio', 'unregprod', { producer }, options
    );
};

const claimRewards = async (owner, privateKey, options = {}) => {
    return await sushitrain.transact(
        owner, privateKey, 'eosio', 'claimrewards', { owner }, options
    );
};

module.exports = {
    claimRewards,
    getAll,
    queryByName,
    queryByRange,
    register,
    unRegister,
};

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
const table = require('./table');
