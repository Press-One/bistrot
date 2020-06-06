'use strict';

const { TextEncoder, TextDecoder } = require('util');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { utilitas } = require('utilitas');
const request = require('request-promise');
const config = require('./config');
const fetch = require('node-fetch');
// const ecc = require('eosjs-ecc'); //////////////////////////////////////////////////////

for (let i in global.chainConfig || {}) {
    config[i] = typeof global.chainConfig[i] === 'undefined'
        ? config[i] : global.chainConfig[i];
}

const transactConfig = { blocksBehind: 10, expireSeconds: 60 };
const rpcApiRoot = `${config.rpcApi}/v1/`;
const contracts = {};
const clients = {};
const rpc = new JsonRpc(config.rpcApi, { fetch });

const buildClient = (account, privateKey, options = {}) => {
    utilitas.assert(
        options.noKey || privateKey, 'Private key is required.', 400
    );
    const signatureProvider = new JsSignatureProvider(
        privateKey ? [privateKey] : []
    );
    utilitas.assert(
        signatureProvider, 'Error configurating signature provider.', 500
    );
    const api = new Api({
        rpc, signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
    });
    utilitas.assert(api, 'Error configurating api client.', 500);
    return { account, signatureProvider, api };
};

const buildDefaultClient = () => {
    return buildClient(null, null, { noKey: true });
};

const getClient = (account, privateKey, options = {}) => {
    const key = !account && !privateKey ? '_' : account;
    if (key && clients[key]) {
        return clients[key];
    }
    const client = account || privateKey
        ? buildClient(account, privateKey, options) : buildDefaultClient();
    if (key) {
        clients[key] = client;
    }
    return client;
};

const makeAuthorizations = (actor, permission) => {
    return [{ actor: actor, permission: permission }];
};

const makeActions = (account, name, data, actor) => {
    utilitas.assert(actor, 'Actor is required.', 400);
    utilitas.assert(account, 'Action account is required.', 400);
    utilitas.assert(name, 'Action name is required.', 400);
    utilitas.assert(data, 'Action data is required.', 400);
    let [arrAc, arrNm, arrDt, actions] = [
        utilitas.isArray(account),
        utilitas.isArray(name),
        utilitas.isArray(data),
        []
    ];
    utilitas.assert(
        arrAc === arrNm && arrNm === arrDt,
        'Invalid transaction parameters.', 400
    );
    arrAc = arrAc ? account : [account];
    arrNm = arrNm ? name : [name];
    arrDt = arrDt ? data : [data];
    for (let i in arrAc) {
        actions.push({
            account: arrAc[i], name: arrNm[i], data: arrDt[i],
            authorization: makeAuthorizations(actor, 'active'),
        });
    }
    return { actions };
};

const getBlockByNumOrId = async (blockNumOrId) => {
    utilitas.assert(blockNumOrId, 'Invalid block num or id.', 400);
    const resp = await request({
        method: 'POST',
        uri: `${rpcApiRoot}chain/get_block`,
        json: true,
        body: { block_num_or_id: blockNumOrId },
    }).promise();
    utilitas.assert(
        resp && resp.ref_block_prefix, 'Error fetching block info.', 500
    );
    return resp;
};

const getTransactionById = async (id, block_num_hint = 0) => {
    utilitas.assert((id = id.trim()), 'Invalid transaction id.', 400);
    const resp = await request({
        method: 'POST',
        uri: `${rpcApiRoot}history/get_transaction`,
        json: true,
        body: { id, block_num_hint },
    }).promise();
    utilitas.assert(
        resp && resp.id, 'Error fetching transaction info.', 500
    );
    return resp;
};

const getChainInfo = async (args) => {
    return await getClient().api.rpc.get_info(args || {});
};

const makeStringByLength = (string, length) => {
    string = String(string || '');
    length = parseInt(length) || 0;
    let result = '';
    while (string && length && result.length < length) {
        result += string;
    }
    return result;
};

const fullLengthLog = (string, maxLength) => {
    string = String(string || '');
    maxLength = parseInt(maxLength) || process.stdout.columns;
    const pad = '=';
    if (string.length + 4 > maxLength) {
        console.log(makeStringByLength(pad, maxLength));
        console.log(string);
        console.log(makeStringByLength(pad, maxLength));
    } else {
        string = string ? ` ${string} ` : '';
        const lLen = Math.floor((maxLength - string.length) / 2);
        const rLen = maxLength - lLen - string.length;
        console.log(
            `${makeStringByLength(pad, lLen)}${string}`
            + `${makeStringByLength(pad, rLen)}`
        );
    }
    return { string, maxLength };
};

const transact = async (
    actor, privateKey, account, name, data, options = {}
) => {
    utilitas.assert(actor, 'Actor is required.', 400);
    const client = getClient(actor, privateKey);
    let [actions, result] = [
        makeActions(account, name, data, client.account), null
    ];
    // console.log(utilitas.prettyJson(client));
    // console.log(utilitas.prettyJson(actions));
    try {
        result = await client.api.transact(actions, transactConfig);
    } catch (err) {
        if (options.ignoreError && options.ignoreError.test(err)) {
            result = {};
            // console.log(err);
        } else {
            const strErr = `PRS API > ${String(err)}`;
            if (config.debug) {
                fullLengthLog('VERBOSE LOG FOR DEBUG ONLY');
                // console.log(strErr);
                console.log(`Client:\n${utilitas.prettyJson(client)}`);
                console.log(`\nActor: ${actor} (${privateKey})`);
                console.log(`\nAction: ${account} -> ${name}`);
                console.log(`\nPayload:\n${utilitas.prettyJson(actions)}`);
                if (err instanceof RpcError) {
                    console.log(
                        `\nRPC Error:\n${utilitas.prettyJson(err.json)}`
                    );
                }
                fullLengthLog();
            }
            utilitas.throwError(strErr);
        }
    }
    utilitas.assert(result, 'Error pushing PRS transaction.', 500);
    return result;
};

const getContractByName = async (name, options) => {
    utilitas.assert(name, 'Contract name is required.', 400);
    return contracts[name]
        || (contracts[name] = await getClient().api.getContract(name));
};

module.exports = {
    rpcApiRoot,
    getBlockByNumOrId,
    getClient,
    getInfo,
    getContractByName,
    getTransactionById,
    transact,
};
