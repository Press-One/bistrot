'use strict';

const { account, table, sushitrain } = require('sushitrain');
const { utilitas } = require('utilitas');

const queryByOwner = async (acc) => {
    return await table.queryByKeyAndValue('eosio', 'voters', acc);
};

const getAll = async () => {
    return await table.getAll('eosio', 'voters', 'owner');
};

const verifyProducers = (arrName, subErr, err) => {
    subErr = subErr || '';
    err = err || 'Invalid producer';
    arrName = arrName || [];
    arrName = Array.isArray(arrName) ? arrName : [arrName];
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
    producers = Object.keys(producers).sort();
    return await sushitrain.transact(
        voter, privateKey, 'eosio', 'voteproducer',
        { proxy: '', voter, producers }, options
    );
};

module.exports = {
    getAll,
    queryByOwner,
    vote,
};
