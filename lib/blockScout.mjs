
import { shot, utilitas } from 'utilitas';
import config from './config.mjs';

const getApiUrl = async () => `${(await config()).blockScout}/api`;

const get = async (module, action, params) => {
    const resp = (await shot.get(utilitas.assembleUrl(
        await getApiUrl(), { module, action, ...params || {} }
    ), { encode: 'JSON' }))?.content;
    assert(resp?.status === '1', resp?.message || 'Unknown error.', 500);
    return resp?.result;
};

// https://explorer.rumsystem.net/api-docs {

const account = (action, params) => get('account', action, params);
const eth_get_balance = (address, p) => account('eth_get_balance', { address, ...p || {} });
const balance = (address, p) => account('balance', { address, ...p || {} });
const balancemulti = (a, p) => account('balancemulti', { address: utilitas.ensureArray(a).join(','), ...p || {} });
const pendingtxlist = (address, p) => account('pendingtxlist', { address, ...p || {} });
const txlist = (address, p) => account('txlist', { address, ...p || {} });
const txlistinternal = (txhash, p) => account('txlistinternal', { txhash, ...p || {} });
const tokentx = (address, p) => account('tokentx', { address, ...p || {} });
const tokenbalance = (contractaddress, address, p) => account('tokenbalance', { contractaddress, address, ...p || {} });
const tokenlist = (address, p) => account('tokenlist', { address, ...p || {} });
const getminedblocks = (address, p) => account('getminedblocks', { address, ...p || {} });
const listaccounts = (params) => account('listaccounts', params);

const logs = (action, params) => get('logs', action, params);
const getLogs = (params) => logs('getLogs', params);

const token = (action, params) => get('token', action, params);
const getToken = (contractaddress, p) => token('getToken', { contractaddress, ...p || {} });
const getTokenHolders = (contractaddress, p) => token('getTokenHolders', { contractaddress, ...p || {} });
const bridgedTokenList = (params) => token('bridgedTokenList', params);

const stats = (action, params) => get('stats', action, params);
const tokensupply = (contractaddress, p) => stats('tokensupply', { contractaddress, ...p || {} });
const ethsupplyexchange = (params) => stats('ethsupplyexchange', params);
const ethsupply = (params) => stats('ethsupply', params);
const coinsupply = (params) => stats('coinsupply', params);
const coinprice = (params) => stats('coinprice', params);
const totalfees = (params) => stats('totalfees', params);

const block = (action, params) => get('block', action, params);
const getblockreward = (blockno, p) => block('getblockreward', { blockno, ...p || {} });
const getblocknobytime = (timestamp, closest, p) => block('getblocknobytime', { timestamp, closest, ...p || {} });
const eth_block_number = (params) => block('eth_block_number', params);

const contract = (action, params) => get('contract', action, params);
const listcontracts = (params) => contract('listcontracts', params);
const getabi = (address, p) => contract('getabi', { address, ...p || {} });
const getsourcecode = (address, p) => contract('getsourcecode', { address, ...p || {} });
const verify = (addressHash, name, compilerVersion, optimization, contractSourceCode, p) =>
    contract('verify', { addressHash, name, compilerVersion, optimization, contractSourceCode, ...p || {} });
// const verify_via_sourcify = (body) => post('contract', 'verify_via_sourcify', body);
const verify_vyper_contract = (addressHash, name, compilerVersion, contractSourceCode, p) =>
    contract('verify_vyper_contract', { addressHash, name, compilerVersion, contractSourceCode, ...p || {} });
const verifysourcecode = (codeformat, contractaddress, contractname, compilerversion, sourceCode, p) =>
    contract('verifysourcecode', { codeformat, contractaddress, contractname, compilerversion, sourceCode, ...p || {} });
const checkverifystatus = (guid, p) => contract('checkverifystatus', { guid, ...p || {} });

const transaction = (action, params) => get('transaction', action, params);
const gettxinfo = (txhash, p) => transaction('gettxinfo', { txhash, ...p || {} });
const gettxreceiptstatus = (txhash, p) => transaction('gettxreceiptstatus', { txhash, ...p || {} });
const getstatus = (txhash, p) => transaction('getstatus', { txhash, ...p || {} });

// }

export {
    get,
    getApiUrl,
    // shortcuts {
    /***/ account,
    txlist,
    tokentx,
    /***/ logs,
    /***/ token,
    /***/ stats,
    /***/ block,
    /***/ contract,
    /***/ transaction,
    // }
};
