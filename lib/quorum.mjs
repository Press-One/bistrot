import { basename } from 'path';
import { privateKeyToAddress } from './crypto.mjs';
import { readFileSync } from 'fs';
import { utilitas } from 'utilitas';
import config from './config.mjs';
import hdWalletProvider from '@truffle/hdwallet-provider';
import web3 from 'web3';

import {
    CONTRACT_BYTES_END as ERC721_CONTRACT_BYTES_END,
    CONTRACT_BYTES_START as ERC721_CONTRACT_BYTES_START,
    CONTRACT_FLAVOR as ERC721_CONTRACT_FLAVOR,
} from './erc721.mjs';

import {
    getAbiByNameOrAddress, getAbiDecoder, getContractNameByAddress, getSolByName,
} from './etc.mjs';

let solc = null;
if (!utilitas.inBrowser()) {
    solc = await utilitas.need('solc');
    const uncRjc = 'unhandledRejection';
    const listeners = process.listeners(uncRjc);
    process.removeListener(uncRjc, listeners[listeners.length - 1]);
}

const direcyCall = new Set(['eth.net.getNetworkType']);
const defaultSol = 'default.sol';
const [actCall, actSend] = ['call', 'send'];
const acts = new Set([actCall, actSend]);
const getEthClient = async (pvtKey, opt) => (await getClient(pvtKey, opt)).eth;
const log = (content) => utilitas.log(content, import.meta.url);
const clients = {};
const utf8 = 'utf8';
const assertString = (s, e, c = 400) => assert(String.isString(s) && s.length, e, c);
const assertObject = (o, e, c = 400) => assert(Object.isObject(o), e, c);
const buildDefaultClient = (o) => buildClient(null, { ...o || {}, noKey: true });
const deepCleanBigInt = o => utilitas.deepCleanBigInt(o, Number);

// Method extend is deprecated in web3.js v4.0.0-alpha.0
// https://github.com/web3/web3.js/releases?q=extend&expanded=true
// const extendedMethods = {
//     property: 'txpool', methods: [
//         { name: 'content', call: 'txpool_content' },
//         { name: 'inspect', call: 'txpool_inspect' },
//         { name: 'status', call: 'txpool_status' },
//     ],
// };

const contracts = {
    RumSC: { mod: 'rumsc' },
    RumAccount: { mod: 'account' },
    PaidGroupMvm: { mod: 'paidGroup' },
};

const infoValues = [
    'defaultAccount',
    'transactionBlockTimeout',
    'transactionConfirmationBlocks',
];

const constructors = {
    [ERC721_CONTRACT_FLAVOR]: {
        startBytes: ERC721_CONTRACT_BYTES_START,
        endBytes: ERC721_CONTRACT_BYTES_END,
    },
};

const infoToFetch = [
    'eth.getAccounts',
    'eth.getBlockNumber',
    'eth.getChainId',
    'eth.getGasPrice',
    'eth.getHashrate',
    'eth.getNodeInfo',
    'eth.isMining',
    'eth.isSyncing',
    'eth.net.getNetworkType',
    'eth.net.getPeerCount',
    'eth.net.isListening',
    // 'eth.getCoinbase',
    // 'eth.getProtocolVersion',
];  // https://github.com/ethereum/go-ethereum/issues/19194

const RUM = {
    index: -1,
    id: '4f2ec12c-22f4-3a9e-b757-c84b6415ea8f',
    name: 'RumSystem.net RUM',
    icon: 'https://mixin-images.zeromesh.net/ypHHp9tN4C9K2OlYFLRRBmWn2wYL5olLtntyupiCdsnagR9ML7p-GyT9gmNRD6ETLbBT6i-ROjN9wEj7ItibyboWAhPi9BnKNc8=s128',
    rumAddress: '0x0000000000000000000000000000000000000000',
    symbol: 'RUM',
    symbolDisplay: 'RUM',
    rumSymbol: 'RUM',
};

const getRpcUrl = async (options) => {
    const resp = options?.rpcapi || utilitas.getItemFromStringOrArray(
        (await config())[options?.mvm ? 'rpcMvm' : 'rpcApi']
    );
    assert(resp, 'RPC api root has not been configured', 500);
    return resp;
};

const buildClient = async (privateKey, opts) => {
    assert(opts?.noKey || privateKey, 'Private key is required.', 400);
    let provider = (
        opts?.ignoreGivenProvider ? null : web3.givenProvider
    ) || new web3.providers.HttpProvider(await getRpcUrl(opts));
    // https://github.com/ChainSafe/web3.js/issues/1451
    // https://github.com/MetaMask/web3-provider-engine/issues/309
    provider.sendAsync = provider.send;
    // https://stackoverflow.com/questions/67736753/using-local-private-key-with-web3-js/67736754
    privateKey && (provider = new hdWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: provider,
    }));
    assert(provider, 'Error configurating signature provider.', 500);
    const client = new web3(provider);
    // client.eth.extend(extendedMethods);
    assert(client, 'Error configurating api client.', 500);
    return client;
};

// const getQueued = async (options) => {
//     const client = await getClient(options?.privateKey, options);
//     return await client.eth.txpool.content();
// };

const getClient = async (privateKey, options) => {
    const key = [
        `MVM:${String(!!options?.mvm)}`,
        `KEY:${privateKey ? privateKeyToAddress(privateKey) : '_'}`
    ].join('-');
    if (key && clients[key]) { return clients[key]; }
    const client = await (privateKey
        ? buildClient(privateKey, options)
        : buildDefaultClient(options));
    if (key) { clients[key] = client; }
    return client;
};

const objectify = (args) => {
    const o = {}; (args || []).map(x => { o[x.name] = x.value; }); return o;
};

const assertAddress = (a, e, c) => {
    a = utilitas.ensureString(a);
    assert(web3.utils.isAddress(a), e || 'Invalid address.', c || 400);
    return web3.utils.toChecksumAddress(a);
};

const assertHash = (h, e, c) => {
    h = utilitas.ensureString(h);
    assert(h.length === 66, e || 'Invalid transaction hash.', c || 400);
    return h;
};

const postProcess = async (contractNameOrHash, data, options) => {
    const cName = web3.utils.isAddress(contractNameOrHash)
        ? await getContractNameByAddress(contractNameOrHash)
        : contractNameOrHash;
    if (contracts[cName]) {
        contracts[cName].unpackTransaction = contracts[cName].unpackTransaction
            || (await import(`./${contracts[cName].mod}.mjs`)).unpackTransaction;
        data = await contracts[cName].unpackTransaction(data, options);
    }
    return data;
};

const getTransactionByHash = async (hash, options) => {
    assert(hash, 'Transaction hash is required.', 400);
    const [trx, receipt] = await Promise.all([
        (await getEthClient(null, options)).getTransaction(hash, options),
        options?.noReceipt ? utilitas.voidFunc() : getTransactionReceiptByHash(hash, options),
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
        block = deepCleanBigInt(block);
    }
    return block;
};

const decodeConstructor = async (contract, hex) => {
    let abi = [];
    for (let t of (await getAbiByNameOrAddress(contract))?.abi || []) {
        if (t.type === 'constructor') { abi = t.inputs; break; }
    }
    assert(abi?.length, 'Invalid constructor ABI.', 500);
    const [types, result] = [abi.map(x => x.type), {}];
    const params = (await getClient()).eth.abi.decodeParameters(types, hex);
    for (let i in abi) { result[abi[i].name] = params[i]; }
    return result;
};

const packTransaction = async (trx, receipt, options) => {
    if (!receipt && !options?.noReceipt) {
        receipt = await getTransactionReceiptByHash(trx.hash, options);
    }
    trx = deepCleanBigInt(trx);
    receipt = deepCleanBigInt(receipt);
    for (let key of [
        'blockNumber', 'gas', 'gasPrice', 'nonce', 'transactionIndex', 'value',
        'type', 'chainId', 'v',
    ]) { String.isString(trx[key]) && (trx[key] = Number(trx[key])); }
    const contract = await getContractNameByAddress(trx.to, options);
    const input = await decodeMethod(trx.input);
    input.params = await postProcess(contract, input.params);
    if (!Object.keys(input.params || {}).length) {
        for (let i in constructors) {
            if (trx.input.startsWith(constructors[i].startBytes)) {
                try {
                    input.params = await decodeConstructor(
                        input.contract = i,
                        trx.input.split(constructors[i].endBytes)[1] || ''
                    );
                } catch (e) { console.error(e); }
            }
        }
    }
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
    const decoder = await getAbiDecoder(options);
    let resp = {};
    try { resp = decoder.decodeMethod(method) || {}; } catch (e) { }
    if (options?.raw) { return resp; }
    return { ...resp, params: objectify(resp.params) };
};

const decodeLogs = async (logs, options) => {
    const decoder = await getAbiDecoder(options);
    let resp = [];
    try { resp = decoder.decodeLogs(logs) || []; } catch (e) { console.error(e); }
    if (options?.raw) { return resp; }
    for (let i in logs || []) {
        logs[i] = {
            ...logs[i], ...resp[i],
            events: objectify(resp[i]?.events || []),
            contract: await getContractNameByAddress(logs[i].address, options),
        }
    }
    return logs;
};

const getTransactionReceiptByHash = async (hash, opt) => {
    const r = await (await getEthClient(null, opt)).getTransactionReceipt(hash);
    assert(r, `Transaction not found: ${hash}.`, 404);
    await decodeLogs(r.logs);
    return r;
};

const getBlockByNumberOrHash = async (numOrHash, options) => {
    assert(numOrHash, 'Block number or hash is required.', 400);
    let blk = await (await getEthClient(null, options)).getBlock(numOrHash, true);
    assert(blk, `Block not found: ${numOrHash}.`, 404);
    blk = await packBlock(blk, options);
    blk.transactions = await Promise.all((blk?.transactions || []).map(
        x => packTransaction(x, null, options)
    ));
    return blk;
};

const initContract = async (abi, address, options) => {
    const client = await getEthClient(options?.privateKey, options);
    return { client, contract: new (client).Contract(abi, address) };
};

const initPreparedContract = async (name, option) => {
    const { abi, address } = await getAbiByNameOrAddress(name, option);
    return await initContract(abi, option?.contractAddress || address, option);
};

const getPreparedAccount = async (account) => {
    const conf = await config();
    const result = conf?.accounts?.[account] && {
        account: account, privateKey: conf.accounts[account],
        address: privateKeyToAddress(conf.accounts[account]),
    };
    assert(
        result && result.account && result.address && result.privateKey,
        'Account has not been configured.', 501
    );
    return result;
};

const executePreparedContractMethod = async (abi, method, act, arg, opts) => {
    opts?.privateKey && assertString(opts?.privateKey, 'Invalid privateKey.');
    const callOpts = {
        ...opts?.privateKey ? { from: privateKeyToAddress(opts?.privateKey, { standard: true }) } : {},
        ...opts?.call || {},
    };
    const { client, contract: ins } = await initPreparedContract(abi, opts);
    // patched nonce too low error by @LeaskH
    if (!callOpts.nonce && callOpts?.from && act === actSend) {
        callOpts.nonce = await client.getTransactionCount(callOpts?.from);
    }
    assert(ins.methods?.[method], `Invalid method: '${method}'.`, 400);
    assert(acts.has(act), `Invalid action: '${act}'.`, 400);
    let resp = await ins.methods[method].apply(null, arg ?? [])[act](callOpts);
    if (!opts?.raw && resp?.blockHash) {
        resp = await getBlockByNumberOrHash(resp?.blockHash);
    }
    return resp
};

const callPreparedContractMethod = (abi, method, arg, options) =>
    executePreparedContractMethod(abi, method, actCall, arg, options);

const sendToPreparedContractMethod = (abi, method, arg, options) =>
    executePreparedContractMethod(abi, method, actSend, arg, options);

const getLastIrreversibleBlockNumber = async (options) =>
    Number(await (await getEthClient(null, options)).getBlockNumber());

const deployContract = async (sol, args, opts) => {
    if (Object.isObject(sol)) { } else if (sol) {
        sol = compile(sol, { single: true, ...options || {} });
    } else { utilitas.throwError('Invalid contract source code.', 400); }
    opts?.privateKey && assertString(opts?.privateKey, 'Invalid privateKey.');
    const from = opts?.privateKey ? {
        from: privateKeyToAddress(opts?.privateKey, { standard: true }),
    } : {};
    const { contract } = await initContract(sol.abi, null, opts);
    const instant = contract.deploy({
        data: `0x${sol.evm.bytecode.object}`, arguments: args || [],
    });
    return await instant.send(from);
    // from.gas: utilitas.ensureInt(await instant.estimateGas()) + 1, // not work on latest web3
};

const deployPreparedContract = async (contractName, args, options) => {
    const sol = await getSolByName(contractName, options);
    return await deployContract(sol, args, options);
};

const batchRequest = async (actions, options) => {
    const client = await getClient(options?.privateKey, options);
    const batch = new client.BatchRequest();
    const pms = actions.map(a => {
        a = Array.isArray(a) ? a : [a];
        let act = a.pop();
        const isDirect = direcyCall.has(act);
        if (String.isString(act)) {
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
    const [nodes, hostname] = [
        (await config()).nodes, new URL(client._provider.host).hostname
    ];
    for (let i in nodes) {
        if (utilitas.insensitiveCompare(nodes[i].ip, hostname)) {
            Object.assign(resp, { enodeId: nodes[i].id, enodeUri: nodes[i].uri });
        }
    }
    return resp;
};

const compile = (content, options) => {
    assert(content, 'Contract source code is required.', 400);
    // dev dep: '@openzeppelin/contracts' {
    // https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/
    // master/contracts/token/ERC20/ERC20.sol
    // const im = options?.import || ((pth) => {
    //     let abs, contents;
    //     if ((abs = pth && pth.replace(/^(@openzeppelin)/, 'node_modules/$1'))) {
    //         try {
    //             assert(!options?.refresh, "Wolf's Coming!", 200);
    //             contents = getFileByName(pth);
    //         } catch (e) {
    //             contents = readFileSync(abs, 'utf8');
    //             log(`Import contract source: ${abs}.`);
    //         }
    //         dependencies[pth] = contents;
    //     }
    //     return { contents };
    // });
    // const resp=JSON.parse(solc.compile(JSON.stringify(code), { import: im }));
    // }
    const [code, dependencies] = [{
        language: 'Solidity',
        sources: { [defaultSol]: { content } },
        settings: {
            outputSelection: { '*': { '*': ['*'] } }, evmVersion: 'paris',
        }
    }, {}];
    const resp = JSON.parse(solc.compile(JSON.stringify(code)));
    const [contracts, e] = [resp?.contracts?.[defaultSol], resp?.errors?.['0']];
    const defaultKy = options?.contract || Object.keys(contracts || {})[0];
    assert(
        !e && defaultKy,
        e?.message || 'Error compiling contract source code.', 400
    );
    for (let i in contracts || {}) { contracts[i].dependencies = dependencies; }
    if (options?.raw) { return resp; }
    else if (options?.single) { return contracts?.[defaultKy]; }
    return contracts;
};

const trimCode = (content, separator) => {
    const lines = content.split('\n');
    content = [];
    lines.map(x => { (x = x.trim()) && content.push(x); });
    return content.join(separator || '');
};

const prepareContract = (file) => {
    log(`Compiling: ${file}`);
    const content = readFileSync(file, utf8);
    const [result, resp]
        = [{ [basename(file)]: content }, compile(content, { refresh: true })];
    for (let i in resp) {
        result[`abi${i}.json`] = JSON.stringify({ abi: resp[i].abi });
        for (let j in resp[i].dependencies) {
            result[j] = trimCode(resp[i].dependencies[j], '\n');
        }
    }
    return result;
};

export {
    RUM,
    assertAddress,
    assertHash,
    assertObject,
    assertString,
    buildClient,
    buildDefaultClient,
    callPreparedContractMethod,
    compile,
    decodeLogs,
    decodeMethod,
    deployContract,
    deployPreparedContract,
    executePreparedContractMethod,
    getBlockByNumberOrHash,
    getBlockIdByTransactionHash,
    getClient,
    getEthClient,
    getInfo,
    getLastIrreversibleBlockNumber,
    getPreparedAccount,
    // getQueued,
    getRpcUrl,
    getTransactionByHash,
    getTransactionReceiptByHash,
    initContract,
    initPreparedContract,
    packTransaction,
    prepareContract,
    sendToPreparedContractMethod,
    trimCode,
};
