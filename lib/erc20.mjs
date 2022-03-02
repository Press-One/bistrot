import { utilitas } from 'utilitas';
import * as crypto from './crypto.mjs';
import * as finance from './finance.mjs';
import * as quorum from './quorum.mjs';
import web3 from 'web3';

const [ether, abiName, defaultCap] = ['ether', 'RumERC20', '21000000'];
const toWei = (str, options) => { return convert('toWei', str, options); };
const fromWei = (str, options) => { return convert('fromWei', str, options); };
const assertOwner = (add) => { return assertAddress(add, 'Owner'); };
const assertSpender = (add) => { return assertAddress(add, 'Spender'); };
const assertSender = (add) => { return assertAddress(add, 'Sender'); };
const assertRecipient = (add) => { return assertAddress(add, 'Recipient'); };

const convert = (mth, str, opts) => {
    const rs = web3.utils[mth](utilitas.ensureString(str), opts?.unit || ether);
    return opts?.asBn ? web3.utils.toBN(rs) : rs;
};

const assertAddress = (address, name) => {
    crypto.assertAddress(address, `Invalid ${name}-address.`);
    return address;
};

const assertAmount = (amount, options) => {
    amount = finance.assertAmount(amount);
    return toWei(amount, { ...options || {}, asBn: true });
};

const deploy = async (symbol, privateKey, options) => {
    symbol = utilitas.ensureString(symbol, { case: 'UP' });
    privateKey = utilitas.ensureString(privateKey);
    utilitas.assert(symbol, 'Symbol is required', 400);
    utilitas.assert(privateKey, 'Private-key is required', 400);
    return await quorum.deployPreparedContract(abiName, [
        utilitas.ensureString(options?.name) || `${symbol} Token`, symbol,
        toWei(options?.cap || defaultCap, { ...options || {}, asBn: true }),
        utilitas.ensureString(options?.miner) || crypto.privateKeyToAddress(
            privateKey, { ...options || {}, standard: true }
        ),
    ], { ...options || {}, privateKey });
};

const callPreparedMethod = async (contractAddress, method, args, options) => {
    return await quorum.callPreparedContractMethod(
        abiName, method, args || [], { ...options || {}, contractAddress }
    );
};

const sendToPreparedMethod = async (contractAddress, me, ag, privateKey, o) => {
    return await quorum.sendToPreparedContractMethod(
        abiName, me, ag || [], { ...o || {}, contractAddress, privateKey }
    );
};

const getTotalSupply = async (contractAddress, o) => {
    const r = await callPreparedMethod(contractAddress, 'totalSupply', null, o);
    return o?.asWei ? r : fromWei(r, o);
};

const getName = async (contractAddress, options) => {
    return await callPreparedMethod(contractAddress, 'name', null, options);
};

const getSymbol = async (contractAddress, options) => {
    return await callPreparedMethod(contractAddress, 'symbol', null, options);
};

const getDecimals = async (contractAddress, options) => {
    return await callPreparedMethod(contractAddress, 'decimals', null, options);
};

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

const transfer = async (contractAddress, recipient, am, privateKey, option) => {
    return await sendToPreparedMethod(contractAddress, 'transfer', [
        assertRecipient(recipient), assertAmount(am, option),
    ], privateKey, option);
};

const adjustAllowance = async (contractAddress, mthd, spender, am, key, op) => {
    return await sendToPreparedMethod(contractAddress, mthd, [
        assertSpender(spender), assertAmount(am),
    ], key, op);
};

const approve = async (contractAddress, spender, amount, key, op) => {
    return await adjustAllowance(
        contractAddress, 'approve', spender, amount, key, op
    );
};

const increaseAllowance = async (contractAddress, spender, amount, key, op) => {
    return await adjustAllowance(
        contractAddress, 'increaseAllowance', spender, amount, key, op
    );
};

const decreaseAllowance = async (contractAddress, spender, amount, key, op) => {
    return await adjustAllowance(
        contractAddress, 'decreaseAllowance', spender, amount, key, op
    );
};

const allowance = async (contractAddress, owner, spender, options) => {
    const resp = await callPreparedMethod(contractAddress, 'allowance', [
        assertOwner(owner), assertSpender(spender),
    ], options);
    return options?.asWei ? resp : fromWei(resp, options);
};

const transferFrom = async (contractAddress, sender, recipient, amount, op) => {
    return await callPreparedMethod(contractAddress, 'transferFrom', [
        assertSender(sender), assertRecipient(recipient), assertAmount(amount),
    ], op);
};

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
