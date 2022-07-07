import { assertAmount as _assertAmount } from './finance.mjs';
import { getMirroredAsset } from './mixin.mjs';
import { utilitas } from 'utilitas';
import web3 from 'web3';

import {
    assertAsset, assertOwner, assertRecipient,
    assertSender, assertSpender, privateKeyToAddress,
} from './crypto.mjs';

import {
    callPreparedContractMethod, deployPreparedContract,
    sendToPreparedContractMethod,
} from './quorum.mjs';

const [ether, abiName, defaultCap] = ['ether', 'RumERC20', '21000000'];
const [rrum, abiRrum] = [true, 'RRUM'];
const fromWei = (str, options) => convert('fromWei', str, options);
const toWei = (str, options) => convert('toWei', str, options);
const rrumDeposit = (amount, key, opts) => deposit(abiRrum, amount, key, opts);
const rrumWithdraw = (amount, key, opts) => withdraw(abiRrum, amount, key, opts);

const convert = (mth, str, opts) => {
    const rs = web3.utils[mth](utilitas.ensureString(str), opts?.unit || ether);
    return opts?.asBn ? web3.utils.toBN(rs) : rs;
};

const assertAmount = (amount, options) => {
    amount = _assertAmount(amount);
    return toWei(amount, { ...options || {}, asBn: true });
};

const assertUuid = (uuid, msg, code) => {
    utilitas.assertUuid(uuid, msg || 'Invalid transaction UUID.', code || 400);
    return uuid;
};

const deploy = async (symbol, privateKey, options) => {
    symbol = utilitas.ensureString(symbol || (options?.rrum ? 'RRUM' : ''), { case: 'UP' });
    privateKey = utilitas.ensureString(privateKey);
    assert(symbol, 'Symbol is required', 400);
    assert(privateKey, 'Private-key is required', 400);
    return await deployPreparedContract(options?.rrum ? abiRrum : abiName, [
        utilitas.ensureString(options?.name) || `${symbol} Token`, symbol,
        toWei(options?.cap || defaultCap, { ...options || {}, asBn: true }),
        utilitas.ensureString(options?.miner)
        || privateKeyToAddress(privateKey, { ...options || {}, standard: true }),
    ], { ...options || {}, privateKey });
};

const matchAssetAddress = (contractAddress) => {
    if (String(contractAddress || '').length <= 10) {
        contractAddress = getMirroredAsset(contractAddress)?.rumAddress;
    }
    return assertAsset(contractAddress);
};

const callPreparedMethod = (add, mth, args, opts) => callPreparedContractMethod(
    opts?.rrum ? abiRrum : abiName, mth, args || [], {
    ...opts || {}, contractAddress: matchAssetAddress(add)
});

const sendToPreparedMethod = (ad, m, a, key, o) => sendToPreparedContractMethod(
    o?.rrum ? abiRrum : abiName, m, a || [], {
    ...o || {}, contractAddress: matchAssetAddress(ad), privateKey: key
});

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

const transfer = (contractAddress, recipient, amount, privateKey, options) =>
    sendToPreparedMethod(contractAddress, 'transfer', [
        assertRecipient(recipient), assertAmount(amount, options),
    ], privateKey, options);

const rumTransfer = (contractAddress, recipient, amount, uuid, privateKey, o) =>
    sendToPreparedMethod(contractAddress, 'rumTransfer', [
        assertRecipient(recipient), assertAmount(amount, o), assertUuid(uuid)
    ], privateKey, o);

const adjustAllowance = (contractAddress, method, spender, amount, key, opts) =>
    sendToPreparedMethod(contractAddress, method, [
        assertSpender(spender), assertAmount(amount, opts),
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

const rumApprove = (contractAddress, spender, amount, uuid, key, options) =>
    sendToPreparedMethod(contractAddress, 'rumApprove', [
        assertSpender(spender), assertAmount(amount, options), assertUuid(uuid)
    ], key, options);

const transferFrom = (contractAddress, sender, recipient, amount, options) =>
    callPreparedMethod(contractAddress, 'transferFrom', [
        assertSender(sender), assertRecipient(recipient),
        assertAmount(amount, options),
    ], options);

const rumTransferFrom = (contractAddress, sender, recipient, amount, uuid, o) =>
    callPreparedMethod(contractAddress, 'rumTransferFrom', [
        assertSender(sender), assertRecipient(recipient),
        assertAmount(amount, o), assertUuid(uuid)
    ], o);

const deposit = (contractAddress, amount, privateKey, options) =>
    sendToPreparedMethod(contractAddress, 'deposit', [], privateKey, {
        rrum, call: { value: assertAmount(amount, options) }, ...options || {}
    });

const withdraw = (contractAddress, amount, privateKey, options) =>
    sendToPreparedMethod(contractAddress, 'withdraw', [
        assertAmount(amount, options),
    ], privateKey, { rrum, ...options || {} });

export {
    abiName,
    abiRrum,
    allowance,
    approve,
    assertAmount,
    assertAsset,
    assertUuid,
    balanceOf,
    callPreparedMethod,
    decreaseAllowance,
    deploy,
    deposit,
    fromWei,
    getDecimals,
    getInfo,
    getName,
    getSymbol,
    getTotalSupply,
    increaseAllowance,
    matchAssetAddress,
    rrumDeposit,
    rrumWithdraw,
    rumApprove,
    rumTransfer,
    rumTransferFrom,
    sendToPreparedMethod,
    toWei,
    transfer,
    transferFrom,
    withdraw,
};
