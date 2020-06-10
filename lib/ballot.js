'use strict';

const { account, table, sushitrain } = require('sushitrain');
const { utilitas } = require('utilitas');

const queryByOwner = async (acc) => {
    return await table.queryByKeyAndValue('eosio', 'voters', acc);
};

const queryAll = async () => {
    let [result, lower_bound, more] = [[], null, true];
    do {
        const resp = await table.queryByRange('eosio', 'voters', lower_bound);
        resp.rows.map(x => {
            result.push(x);
            lower_bound = x.owner;
        });
        more = resp.more;
    } while (more);
    return result;
};

const verifyProducers = (arrName, subErr, err) => {
    subErr = subErr || '';
    err = err || 'Invalid producer';
    arrName = arrName || [];
    arrName = utilitas.isArray(arrName) ? arrName : [arrName];
    arrName.map(x => {
        account.assertName(x, `${err}: \`${x}\` to be ${subErr}.`);
    });
    return arrName;
};

const getCurrentVotes = async (account) => {
    const resp = await queryByOwner(account);
    return resp && resp.producers ? resp.producers : [];
};

const vote = async (
    voter, approve, unapprove, privateKey, options = {}
) => {
    approve = verifyProducers(approve, 'approved');
    unapprove = verifyProducers(unapprove, 'unapproved');
    unapprove.map(x => {
        utilitas.assert(!approve.includes(x), `Conflicting producer: '${x}'.`);
    });
    const curVotes = await getCurrentVotes(voter);
    let producers = {};
    [...curVotes, ...approve].map(x => { producers[x] = true; });
    unapprove.map(x => { try { delete producers[x]; } catch (err) { } });
    producers = Object.keys(producers);
    return await sushitrain.transact(
        voter, privateKey, 'eosio', 'voteproducer',
        { proxy: '', voter, producers }, options
    );
};

module.exports = {
    queryByOwner,
    queryAll,
    vote,
};
