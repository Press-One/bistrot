'use strict';

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
const table = require('./table');

const queryByRange = async (lower_bound, limit = table.maxQueryRows) => {
    const [result, resp]
        = [[], await sushitrain.getClient().api.rpc.get_producers(
            true, lower_bound, limit
        )];
    (resp && resp.rows ? resp.rows : []).map(x => {
        // https://cmichel.io/how-to-fetch-table-indexes-using-eosjs/
        if (x.owner !== lower_bound) {
            result.push(x);
        }
    });
    resp.more = resp.more && (resp.rows = result).length;
    return resp;
};

const getAll = async () => {
    let [rows, lower_bound, more, total_producer_vote_weight]
        = [[], null, true, null];
    do {
        const resp = await queryByRange(lower_bound);
        resp.rows.map(x => {
            rows.push(x);
            lower_bound = x.owner;
        });
        total_producer_vote_weight = resp.total_producer_vote_weight;
        more = resp.more;
    } while (more);
    return { rows, total_producer_vote_weight };
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

module.exports = {
    queryByRange,
    getAll,
    register,
};
