import { assertAmount as _assertAmount } from './finance.mjs';
import { utilitas } from 'utilitas';
import web3 from 'web3';

import {
    assertAddress as _assertAddress, privateKeyToAddress
} from './crypto.mjs';

import {
    callPreparedContractMethod, deployPreparedContract,
    sendToPreparedContractMethod,
} from './quorum.mjs';

const [ether, abiName, defaultCap] = ['ether', 'RumERC20', '21000000'];
const toWei = (str, options) => convert('toWei', str, options);
const fromWei = (str, options) => convert('fromWei', str, options);
const assertOwner = (add) => assertAddress(add, 'Owner');
const assertSpender = (add) => assertAddress(add, 'Spender');
const assertSender = (add) => assertAddress(add, 'Sender');
const assertRecipient = (add) => assertAddress(add, 'Recipient');

const convert = (mth, str, opts) => {
    const rs = web3.utils[mth](utilitas.ensureString(str), opts?.unit || ether);
    return opts?.asBn ? web3.utils.toBN(rs) : rs;
};

const assertAddress = (address, name) => {
    _assertAddress(address, `Invalid ${name}-address.`);
    return address;
};

const assertAmount = (amount, options) => {
    amount = _assertAmount(amount);
    return toWei(amount, { ...options || {}, asBn: true });
};

const deploy = async (symbol, privateKey, options) => {
    symbol = utilitas.ensureString(symbol, { case: 'UP' });
    privateKey = utilitas.ensureString(privateKey);
    assert(symbol, 'Symbol is required', 400);
    assert(privateKey, 'Private-key is required', 400);
    return await deployPreparedContract(abiName, [
        utilitas.ensureString(options?.name) || `${symbol} Token`, symbol,
        toWei(options?.cap || defaultCap, { ...options || {}, asBn: true }),
        utilitas.ensureString(options?.miner)
        || privateKeyToAddress(privateKey, { ...options || {}, standard: true }),
    ], { ...options || {}, privateKey });
};

const callPreparedMethod = (contractAddress, method, args, options) =>
    callPreparedContractMethod(
        abiName, method, args || [], { ...options || {}, contractAddress }
    );

const sendToPreparedMethod = (contractAddress, me, ag, privateKey, o) =>
    sendToPreparedContractMethod(
        abiName, me, ag || [], { ...o || {}, contractAddress, privateKey }
    );

const getTotalSupply = async (contractAddress, o) => {
    const r = await callPreparedMethod(contractAddress, 'totalSupply', null, o);
    return o?.asWei ? r : fromWei(r, o);
};

const getName = (contractAddress, options) =>
    callPreparedMethod(contractAddress, 'name', null, options);

const getSymbol = (contractAddress, options) =>
    callPreparedMethod(contractAddress, 'symbol', null, options);

const getDecimals = (contractAddress, options) =>
    callPreparedMethod(contractAddress, 'decimals', null, options);

const getInfo = async (contractAdd, op) => {
    let [rules, resp, result] = [[
        ['name', getName], ['symbol', getSymbol],
        ['totalSupply', getTotalSupply], ['decimals', getDecimals],
    ], [], {}];
    resp = await Promise.all(rules.map(x => { return x[1](contractAdd, op); }));
    rules.map((x, i) => { result[x[0]] = resp[i]; });
    return result;
};

const balanceOf = async (contractAddress, owner, options) => {
    const resp = await callPreparedMethod(contractAddress, 'balanceOf', [
        assertOwner(owner),
    ], options);
    return options?.asWei ? resp : fromWei(resp, options);
};

const transfer = (contractAddress, recipient, am, privateKey, option) =>
    sendToPreparedMethod(contractAddress, 'transfer', [
        assertRecipient(recipient), assertAmount(am, option),
    ], privateKey, option);

const adjustAllowance = (contractAddress, method, spender, amount, key, opts) =>
    sendToPreparedMethod(contractAddress, method, [
        assertSpender(spender), assertAmount(amount),
    ], key, opts);

const approve = (contractAddress, spender, amount, key, options) =>
    adjustAllowance(contractAddress, 'approve', spender, amount, key, options);

const increaseAllowance = (contractAdr, spender, amount, key, op) =>
    adjustAllowance(contractAdr, 'increaseAllowance', spender, amount, key, op);

const decreaseAllowance = (contractAdr, spender, amount, key, op) =>
    adjustAllowance(contractAdr, 'decreaseAllowance', spender, amount, key, op);

const allowance = async (contractAddress, owner, spender, options) => {
    const resp = await callPreparedMethod(contractAddress, 'allowance', [
        assertOwner(owner), assertSpender(spender),
    ], options);
    return options?.asWei ? resp : fromWei(resp, options);
};

const transferFrom = (contractAddress, sender, recipient, amount, options) =>
    callPreparedMethod(contractAddress, 'transferFrom', [
        assertSender(sender), assertRecipient(recipient), assertAmount(amount),
    ], options);

export {
    allowance,
    approve,
    balanceOf,
    callPreparedMethod,
    decreaseAllowance,
    deploy,
    getDecimals,
    getInfo,
    getName,
    getSymbol,
    getTotalSupply,
    increaseAllowance,
    sendToPreparedMethod,
    transfer,
    transferFrom,
};
