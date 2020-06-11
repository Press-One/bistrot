'use strict';

const request = require('request-promise');
const assert = require('assert');
const utility = require('./utility');
const atm = require('./atm');
const config = require('./config');

const maxQueryTableRows = 1000;

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const chainRpcApi = `${config.rpcApi}/v1/chain/`;

const eos_queryTable = async (account, table, options) => {
    assert(account, 'EOS account is required.');
    assert(table, 'EOS table is required.');
    options = options || {};
    const query = {
        table: table,
        scope: account,
        code: account,
        json: true,
    };
    for (let i in options) {
        switch (i) {
            case 'limit':
                query[i] = ~~options[i] || 1;
                break;
            case 'index_postion':
            case 'key_type':
            case 'upper_bound':
            case 'lower_bound':
                query[i] = options[i];
                break;
        }
    }
    const reqOpt = {
        method: 'POST',
        uri: `${chainRpcApi}get_table_rows`,
        json: true,
        body: query,
    };
    const resp = await request(reqOpt).promise();
    assert(resp && resp.rows, 'Fail to request table api.');
    return resp;
};

const eos_queryTableByKeyAndValue = async (
    account, table, index_postion, key_type, value
) => {
    const result = await eos_queryTable(account, table, {
        index_postion,
        key_type,
        upper_bound: value,
        lower_bound: value,
        limit: 1,
    });
    return result && result.rows && result.rows.length ? result.rows[0] : null;
};

const queryByRange = async (lower_bound, limit) => {
    const [result, resp] = [[], await eos_queryTable('eosio', 'voters', {
        key_type: 'name',
        index_postion: 1,
        lower_bound,
        limit: limit || maxQueryTableRows,
    })];
    (resp && resp.rows ? resp.rows : []).map(x => {
        // https://cmichel.io/how-to-fetch-table-indexes-using-eosjs/
        if (x.owner !== lower_bound) {
            result.push(x);
        }
    });
    resp.more = resp.more && (resp.rows = result).length;
    return resp;
};

const queryByOwner = async (acc) => {
    return await eos_queryTableByKeyAndValue('eosio', 'voters', 1, 'name', acc);
};

const queryAll = async () => {
    let [result, lower_bound, more] = [[], null, true];
    do {
        const resp = await queryByRange(lower_bound);
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
    if (arrName) {
        arrName = utility.isArray(arrName) ? arrName : [arrName];
        arrName.map(x => {
            atm.assertAccountName(x, `${err}: \`${x}\`${subErr}.`);
        });
    } else {
        arrName = [];
    }
    return arrName;
};

const getCurrentVotes = async (account) => {
    const resp = await queryByOwner(account);
    return resp && resp.producers ? resp.producers : [];
};

const vote = async (chainAccount, approve, unapprove, privateKey, options) => {
    approve = verifyProducers(approve, ` to be approved`);
    unapprove = verifyProducers(unapprove, ` to be unapproved`);
    unapprove.map(x => {
        assert(!approve.includes(x), `Conflicting producer: '${x}'.`);
    });
    const votes = await getCurrentVotes(chainAccount);
    let final = {};
    [...votes, ...approve].map(x => {
        final[x] = true;
    });
    unapprove.map(x => {
        try {
            delete final[x];
        } catch (err) { }
    });
    final = Object.keys(final).sort();
    return await atm.transact(
        chainAccount, privateKey, 'eosio', 'voteproducer',
        {
            proxy: '',
            voter: chainAccount,
            producers: final,
        },
        options
    );
};

module.exports = {
    queryByOwner,
    queryAll,
    vote,
};
