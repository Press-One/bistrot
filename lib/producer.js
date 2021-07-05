'use strict';

const defaultQueryRows = 50;

const queryByRange = async (lower_bound, limit) => {
    return await (await sushitrain.getClient(
    )).api.rpc.get_producers(true, lower_bound, utilitas.ensureInt(
        limit || defaultQueryRows, { min: 1, max: table.maxQueryRows }
    ));
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
    url = utilitas.ensureString(url);
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

const queryByRegExp = async (regexp) => {
    utilitas.assert(regexp, 'Regular expression is required.', 400);
    return await sushibar.requestApi(
        'GET', 'producers', { regexp }, null, 'Error querying producers.'
    );
};

module.exports = {
    defaultQueryRows,
    getAll,
    queryByName,
    queryByRange,
    queryByRegExp,
    register,
    unRegister,
};

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
const sushibar = require('./sushibar');
const table = require('./table');
