'use strict';

const direcyCall = new Set(['eth.net.getNetworkType']);
const [actCall, actSend] = ['call', 'send'];
const acts = new Set([actCall, actSend]);
const vF = async () => { };
const getEthClient = async (pk, o) => { return (await getClient(pk, o)).eth; };
const clients = {};

const infoValues = [
    'defaultAccount',
    'transactionBlockTimeout',
    'transactionConfirmationBlocks',
];

const infoToFetch = [
    'eth.getAccounts',
    'eth.getBlockNumber',
    'eth.getChainId',
    'eth.getCoinbase',
    'eth.getGasPrice',
    'eth.getHashrate',
    'eth.getNodeInfo',
    'eth.isMining',
    'eth.isSyncing',
    'eth.net.getNetworkType',
    'eth.net.getPeerCount',
    'eth.net.isListening',
    // 'eth.getProtocolVersion',
];  // https://github.com/ethereum/go-ethereum/issues/19194

let rpc = null;

const assertString = (str, error, code = 400) => {
    return utilitas.assert(utilitas.isString(str) && str.length, error, code);
};

const assertObject = (object, error, code = 400) => {
    return utilitas.assert(utilitas.isObject(object), error, code);
};

const getRpcUrl = async (options) => {
    options = options || {};
    const c = await config();
    if (!options.rpcapi && !rpc) {
        if (c.speedTest) {
            if (c.debug) { log('Evaluating RPC API nodes...'); }
            rpc = await network.pickFastestHttpServer(
                c.rpcApi, { debug: c.debug }
            );
        } else { rpc = utilitas.getConfigFromStringOrArray(c.rpcApi); }
    }
    const resp = options.rpcapi || rpc;
    utilitas.assert(resp, 'RPC api root has not been configured', 500);
    return resp;
};

const buildClient = async (privateKey, opts) => {
    utilitas.assert(opts?.noKey || privateKey, 'Private key is required.', 400);
    let provider = (
        opts?.ignoreGiven ? null : web3.givenProvider
    ) || new web3.providers.HttpProvider(await getRpcUrl(opts));
    // https://stackoverflow.com/questions/67736753/using-local-private-key-with-web3-js/67736754
    privateKey && (provider = new hdWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: provider,
    }));
    utilitas.assert(provider, 'Error configurating signature provider.', 500);
    const client = new web3(provider);
    utilitas.assert(client, 'Error configurating api client.', 500);
    return client;
};

const buildDefaultClient = async () => {
    return await buildClient(null, { noKey: true });
};

const getClient = async (privateKey, options) => {
    options = options || {};
    const key = privateKey ? crypto.privateKeyToAddress(privateKey) : '_';
    if (key && clients[key]) { return clients[key]; }
    const client = privateKey
        ? await buildClient(privateKey, options)
        : await buildDefaultClient();
    if (key) { clients[key] = client; }
    return client;
};

const objectify = (args) => {
    const o = {}; (args || []).map(x => { o[x.name] = x.value; }); return o;
};

const postProcess = async (contractNameOrHash, data, options) => {
    const contractName = web3.utils.isAddress(contractNameOrHash)
        ? await etc.getContractNameByAddress(contractNameOrHash)
        : contractNameOrHash;
    switch (contractName) {
        case 'RumSC': return await rumsc.unpackTransaction(data, options);
        case 'RumAccount': return await account.unpackTransaction(data, options);
    }
    return data;
};

const getTransactionByHash = async (hash, options) => {
    const [trx, receipt] = await Promise.all([
        (await getEthClient(null, options)).getTransaction(hash, options),
        options?.noReceipt ? vF : getTransactionReceiptByHash(hash, options),
    ]);
    return await packTransaction(trx, receipt, options);
};

const getBlockIdByTransactionHash = async (hash, options) => {
    const { blockHash, blockNumber } = await getTransactionByHash(hash, {
        ...options || {}, noReceipt: true, raw: true
    });
    return { blockHash, blockNumber };
};

const packBlock = async (block, options) => {
    if (block && !options?.raw) {
        block.timestamp = new Date(Number(block.timestamp) * 1000);
    }
    return block;
};

const packTransaction = async (trx, receipt, options) => {
    if (!receipt && !options?.noReceipt) {
        receipt = await getTransactionReceiptByHash(trx.hash, options);
    }
    const contract = await etc.getContractNameByAddress(trx.to, options);
    const input = await decodeMethod(trx.input);
    input.params = await postProcess(contract, input.params);
    for (let logs of receipt?.logs || []) {
        logs.events = await postProcess(contract, logs.events);
    }
    return {
        ...trx,
        ...options?.raw ? {} : { contract, ...input },
        ...receipt ? { receipt } : {},
    };
};

const decodeMethod = async (method, options) => {
    const decoder = await etc.getAbiDecoder(options);
    let resp = {};
    try { resp = decoder.decodeMethod(method) || {}; } catch (e) { }
    if (options?.raw) { return resp; }
    return { ...resp, params: objectify(resp.params) };
};

const decodeLogs = async (logs, options) => {
    const decoder = await etc.getAbiDecoder(options);
    let resp = [];
    try { resp = decoder.decodeLogs(logs) || []; } catch (e) { }
    if (options?.raw) { return resp; }
    for (let i in logs || []) {
        logs[i] = {
            ...logs[i], ...resp[i],
            events: objectify(resp[i]?.events || []),
            contract: await etc.getContractNameByAddress(logs[i].address, options),
        }
    }
    return logs;
};

const getTransactionReceiptByHash = async (hash, opt) => {
    const r = await (await getEthClient(null, opt)).getTransactionReceipt(hash);
    await decodeLogs(r.logs);
    return r;
};

const getBlockByNumberOrHash = async (numOrHash, options) => {
    let blk = await (await getEthClient(null, options)).getBlock(numOrHash, 1);
    utilitas.assert(blk, `Block not found: ${numOrHash}.`, 404);
    blk = await packBlock(blk, options);
    blk.transactions = await Promise.all((blk?.transactions || []).map(x => {
        return packTransaction(x, null, options);
    }));
    return blk;
};

const initContract = async (abi, address, options) => {
    return new (
        await getEthClient(options?.privateKey, options)
    ).Contract(abi, address);
};

const initPreparedContract = async (name, options) => {
    const { abi, address } = await etc.getAbiByNameOrAddress(name, options);
    return await initContract(abi, address, options);
};

const getPreparedAccount = async (account) => {
    const conf = await config();
    const result = conf?.accounts?.[account] && {
        account: account, privateKey: conf.accounts[account],
        address: crypto.privateKeyToAddress(conf.accounts[account]),
    };
    utilitas.assert(
        result && result.account && result.address && result.privateKey,
        'Account has not been configured.', 501
    );
    return result;
};

const executePreparedContractMethod = async (abi, method, act, arg, opts) => {
    opts?.privateKey && assertString(opts?.privateKey, 'Invalid privateKey.');
    const from = opts?.privateKey ? {
        from: crypto.privateKeyToAddress(opts?.privateKey),
    } : {};
    const ins = await initPreparedContract(abi, opts);
    utilitas.assert(ins.methods?.[method], `Invalid method: '${method}'.`, 400);
    utilitas.assert(acts.has(act), `Invalid action: '${act}'.`, 400);
    let resp = await ins.methods[method].apply(null, arg ?? [])[act](from);
    if (!opts?.raw && resp?.blockHash) {
        resp = await getBlockByNumberOrHash(resp?.blockHash);
    }
    return resp
};

const callPreparedContractMethod = async (abi, method, arg, opts) => {
    return await executePreparedContractMethod(abi, method, actCall, arg, opts);
};

const sendToPreparedContractMethod = async (abi, method, arg, opts) => {
    return await executePreparedContractMethod(abi, method, actSend, arg, opts);
};

const assertAddress = (address, error, code = 400) => {
    utilitas.assert(web3.utils.isAddress(address), error || (
        address ? `Invalid address: ${address}.` : 'Address is required.'
    ), code);
};

const batchRequest = async (actions, options) => {
    const client = await getClient(options?.privateKey, options);
    const batch = new client.BatchRequest();
    const pms = actions.map(a => {
        a = Array.isArray(a) ? a : [a];
        let act = a.pop();
        const isDirect = direcyCall.has(act);
        if (utilitas.isString(act)) {
            let nAct = client;
            act.split('.').map(x => { nAct = nAct[x]; });
            act = nAct;
        }
        return isDirect ? act(...a) : new Promise((rslv, rjct) => {
            batch.add(act.request(...a, (e, d) => { e ? rjct(e) : rslv(d); }));
        });
    })
    batch.execute();
    return await Promise.all(pms);
};

const getInfo = async (options) => {
    const [client, resp] = [await getEthClient(null, options), {}];
    infoValues.map(x => { resp[x] = client[x]; });
    (await batchRequest(infoToFetch)).map((x, i) => {
        const key = infoToFetch[i].split('.').pop().replace(/^get/i, '');
        resp[key.charAt(0).toLowerCase() + key.slice(1)] = x;
    });
    return resp;
};

const getLastIrreversibleBlockNumber = async (options) => {
    return await (await getEthClient(null, options)).getBlockNumber();
};

module.exports = {
    assertAddress,
    assertObject,
    assertString,
    buildClient,
    buildDefaultClient,
    callPreparedContractMethod,
    decodeLogs,
    decodeMethod,
    executePreparedContractMethod,
    getBlockByNumberOrHash,
    getBlockIdByTransactionHash,
    getClient,
    getEthClient,
    getInfo,
    getLastIrreversibleBlockNumber,
    getPreparedAccount,
    getRpcUrl,
    getTransactionByHash,
    getTransactionReceiptByHash,
    initContract,
    initPreparedContract,
    sendToPreparedContractMethod,
};

const { utilitas, network } = require('utilitas');
const hdWalletProvider = require('@truffle/hdwallet-provider');
const account = require('./account');
const config = require('./config');
const crypto = require('./crypto');
const rumsc = require('./rumsc');
const web3 = require('web3');
const etc = require('./etc');
