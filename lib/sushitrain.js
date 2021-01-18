'use strict';

const transactConfig = { blocksBehind: 60, expireSeconds: 120 };
const contracts = {};
const clients = {};
const log = (content) => { return utilitas.modLog(content, __filename); };
const getRpc = async () => { return new JsonRpc(await getRpcUrl(), { fetch }) };
const funcConfig = async (options) => { return await config(options); };

let rpc = null;

const getRpcUrl = async (path) => {
    const c = await config();
    if (!rpc) {
        if (c.speedTest) {
            if (c.debug) { log('Evaluating RPC API nodes...'); }
            rpc = await network.pickFastestHttpServer(
                c.rpcApi, { debug: c.debug }
            );
        } else { rpc = utilitas.getConfigFromStringOrArray(c.rpcApi); }
    }
    utilitas.assert(rpc, 'RPC api root has not been configured', 500);
    return `${rpc}${path ? ('/v1/' + path) : ''}`;
};

const buildClient = async (account, privateKey, options = {}) => {
    utilitas.assert(
        options.noKey || privateKey, 'Private key is required.', 400
    );
    const signatureProvider = new JsSignatureProvider(
        privateKey ? [privateKey] : []
    );
    // const signatureProvider = new KeosSignatureProvider( { password: 'xx' } );
    utilitas.assert(
        signatureProvider, 'Error configurating signature provider.', 500
    );
    const api = new Api({
        rpc: await getRpc(), signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
    });
    utilitas.assert(api, 'Error configurating api client.', 500);
    return { account, signatureProvider, api };
};

const buildDefaultClient = async () => {
    return await buildClient(null, null, { noKey: true });
};

const getClient = async (account, privateKey, options = {}) => {
    const key = !account && !privateKey ? '_' : account;
    if (key && clients[key]) {
        return clients[key];
    }
    const client = account || privateKey
        ? await buildClient(account, privateKey, options)
        : await buildDefaultClient();
    if (key) {
        clients[key] = client;
    }
    return client;
};

const throwRpcError = async (error, status = 500, options = {}) => {
    if (!options.ignoreError || !options.ignoreError.test(error)) {
        let message = 'Unknown RPC error.';
        if (error instanceof RpcError) {
            message = `PRS API > ${String(error)}`;
            options.json = error.json;
        } else {
            message = error.message;
        }
        if ((await config()).debug && (options.logs || err.json)) {
            const output = [];
            if (options.logs) {
                options.logs.map(x => { output.push('', x); });
            }
            if (error.json) {
                output.push(
                    '', `RPC Error: ${utilitas.prettyJson(error.json)}`, ''
                );
            }
            utilitas.fullLengthLog('VERBOSE LOG FOR DEBUG ONLY');
            output.map(x => console.log(x));
            utilitas.fullLengthLog();
        }
        try { delete options.logs } catch (err) { }
        utilitas.throwError(message, status, options);
    }
};

const rpcRequest = async (method, api, body, options = {}) => {
    const resp = await fetch(await getRpcUrl(api), {
        method: method = utilitas.trim(method, { case: 'UP' }),
        body: method === 'GET' ? null : JSON.stringify(body || {}),
        headers: { 'Content-Type': 'application/json' }, ...options
    }).then(x => x.json());
    utilitas.assert(resp, 'Error querying RPC api.', 500);
    return resp;
};

const makeAuthorization = (actor, permission) => {
    return { actor, permission };
};

const makeAuthorizations = (actor, permission) => {
    return [makeAuthorization(actor, permission)];
};

const makeActions = (account, name, data, actor, permission) => {
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
            authorization: makeAuthorizations(actor, permission || 'active'),
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

// require history plugin if no block_num_hint
const getTransactionById = async (id, block_num_hint = 0) => {
    utilitas.assert((id = id.trim()), 'Invalid transaction id.', 400);
    const resp = await rpcRequest(
        'POST', 'history/get_transaction', { id, block_num_hint }
    );
    utilitas.assert(resp && resp.id, 'Error fetching transaction info.', 500);
    return resp;
};

const getInfo = async (args) => {
    return await (await getClient()).api.rpc.get_info(args || {});
};

const transact = async (
    actor, privateKey, account, name, data, options = {}
) => {
    utilitas.assert(actor, 'Actor is required.', 400);
    const client = await getClient(actor, privateKey);
    let [actions, result] = [makeActions(
        account, name, data, client.account, options.permission
    ), null];
    // console.log(utilitas.prettyJson(client));
    // console.log(utilitas.prettyJson(actions));
    try {
        result = await client.api.transact(actions, transactConfig);
    } catch (err) {
        const logKey = (await config()).secret ? privateKey
            : privateKey.split('').map(() => { return '*' }).join('');
        await throwRpcError(err, 500, {
            logs: [
                `Client: ${utilitas.prettyJson(client)}`,
                `Actor: ${actor} (${logKey})`,
                `Action: ${account} -> ${name}`,
                `Payload: ${utilitas.prettyJson(actions)}`,
            ], ...options,
        });
        result = {};
    }
    utilitas.assert(result, 'Error pushing PRS transaction.', 500);
    return result;
};

const getPreparedActor = async (account) => {
    const conf = await config();
    const result = conf.accounts && conf.accounts[account] && {
        account: account,
        privateKey: conf.accounts[account].privateKey,
        publicKey: conf.accounts[account].publicKey,
    };
    utilitas.assert(
        result && result.account && result.privateKey && result.publicKey,
        'Actor has not been configured.', 501
    );
    return result;
};

const preparedTransact = async (actor, ctAccount, name, data, options = {}) => {
    const { account, privateKey } = await getPreparedActor(actor);
    return await transact(account, privateKey, ctAccount, name, data, options);
};

const getContractByName = async (name) => {
    utilitas.assert(name, 'Contract name is required.', 400);
    try {
        return contracts[name] || (
            contracts[name] = await (await getClient()).api.getContract(name)
        );
    } catch (err) { await throwRpcError(err); }
};

module.exports = {
    config: funcConfig,
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
// const { KeosSignatureProvider } = require('eosjs-keos/sig');
const { utilitas, network, fetch } = require('utilitas');
const config = require('./config');
