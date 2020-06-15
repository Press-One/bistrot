'use strict';

const { utilitas } = require('utilitas');
const config = require('./config');

for (let i in global.chainConfig || {}) {
    config[i] = utilitas.isUndefined(global.chainConfig[i])
        ? config[i] : global.chainConfig[i];
}

const transactConfig = { blocksBehind: 10, expireSeconds: 60 };
const contracts = {};
const clients = {};

const getRpcUrl = (path) => {
    const url = utilitas.getConfigFromStringOrArray(config.rpcApi);
    utilitas.assert(url, 'RPC api root has not been configured', 500);
    return `${url}${path ? ('/v1/' + path) : ''}`;
};

const getRpc = () => { return new JsonRpc(getRpcUrl(), { fetch }); };

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
        rpc: getRpc(), signatureProvider,
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

const throwRpcError = (error, status = 500, options = {}) => {
    if (!options.ignoreError || !options.ignoreError.test(error)) {
        let message = 'Unknown RPC error.';
        if (error instanceof RpcError) {
            message = `PRS API > ${String(error)}`;
            options.json = error.json;
        } else {
            message = error.message;
        }
        if (config.debug && (options.logs || err.json)) {
            const output = [];
            if (options.logs) {
                options.logs.map(x => { output.push('', x); });
            }
            if (error.json) {
                output.push(
                    '', `RPC Error: ${utilitas.prettyJson(error.json)}`, ''
                );
            }
            fullLengthLog('VERBOSE LOG FOR DEBUG ONLY');
            output.map(x => console.log(x));
            fullLengthLog();
        }
        try { delete options.logs } catch (err) { }
        utilitas.throwError(message, status, options);
    }
};

const rpcRequest = async (method, api, body, options = {}) => {
    const resp = await fetch(getRpcUrl(api), {
        method: String(method || '').toUpperCase(),
        body: JSON.stringify(body || {}),
        headers: { 'Content-Type': 'application/json' }, ...options
    }).then(x => x.json());
    utilitas.assert(resp, 'Error querying RPC api.', 500);
    return resp;
};

const makeAuthorization = (actor, permission) => {
    return { actor: actor, permission: permission };
};

const makeAuthorizations = (actor, permission) => {
    return [makeAuthorization(actor, permission)];
};

const makeActions = (account, name, data, actor) => {
    utilitas.assert(actor, 'Actor is required.', 400);
    utilitas.assert(account, 'Action account is required.', 400);
    utilitas.assert(name, 'Action name is required.', 400);
    utilitas.assert(data, 'Action data is required.', 400);
    let [arrAc, arrNm, arrDt, actions] = [
        Array.isArray(account), Array.isArray(name), Array.isArray(data), []
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
    const resp = await rpcRequest(
        'POST', 'chain/get_block', { block_num_or_id: blockNumOrId }
    );
    utilitas.assert(resp.ref_block_prefix, 'Error fetching block info.', 500);
    return resp;
};

const getTransactionById = async (id, block_num_hint = 0) => {
    utilitas.assert((id = id.trim()), 'Invalid transaction id.', 400);
    const resp = await rpcRequest(
        'POST', 'history/get_transaction', { id, block_num_hint }
    );
    utilitas.assert(resp && resp.id, 'Error fetching transaction info.', 500);
    return resp;
};

const getInfo = async (args) => {
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
        const full = makeStringByLength(pad, maxLength);
        console.log(`${full} \n${string} \n${full} `);
    } else {
        string = string ? ` ${string} ` : '';
        const lLen = Math.floor((maxLength - string.length) / 2);
        const rLen = maxLength - lLen - string.length;
        console.log(`${makeStringByLength(pad,
            lLen)}${string}${makeStringByLength(pad, rLen)}`);
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
        throwRpcError(err, 500, {
            logs: [
                `Client: ${utilitas.prettyJson(client)}`,
                `Actor: ${actor} (${privateKey})`,
                `Action: ${account} -> ${name}`,
                `Payload: ${utilitas.prettyJson(actions)}`,
            ], ...options,
        });
        result = {};
    }
    utilitas.assert(result, 'Error pushing PRS transaction.', 500);
    return result;
};

const getPreparedActor = (account) => {
    const result = config.accounts && config.accounts[account] && {
        account: account,
        privateKey: config.accounts[account].privateKey,
        publicKey: config.accounts[account].publicKey,
    };
    utilitas.assert(
        result && result.account && result.privateKey && result.publicKey,
        'Actor has not been configured.', 500
    );
    return result;
};

const preparedTransact = async (actor, ctAccount, name, data, options = {}) => {
    const { account, privateKey } = getPreparedActor(actor);
    return await transact(account, privateKey, ctAccount, name, data, options);
};

const getContractByName = async (name) => {
    utilitas.assert(name, 'Contract name is required.', 400);
    try {
        return contracts[name]
            || (contracts[name] = await getClient().api.getContract(name));
    } catch (err) {
        throwRpcError(err);
    }
};

module.exports = {
    getBlockByNumOrId,
    getClient,
    getContractByName,
    getInfo,
    getPreparedActor,
    getRpcUrl,
    getTransactionById,
    makeAuthorization,
    preparedTransact,
    rpcRequest,
    throwRpcError,
    transact,
};

const { TextEncoder, TextDecoder } = require('util');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const request = require('request-promise');
const fetch = require('node-fetch');
