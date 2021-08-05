'use strict';

const [ether, solName, defaultCap] = ['ether', 'RumERC20', '21000000'];
const toWei = (str, options) => { return convert('toWei', str, options); };
const fromWei = (str, options) => { return convert('fromWei', str, options); };

const convert = (mth, str, opts) => {
    const rs = web3.utils[mth](utilitas.ensureString(str), opts?.unit || ether);
    return opts?.asBn ? web3.utils.toBN(rs) : rs;
};

const deploy = async (symbol, privateKey, options) => {
    utilitas.assert((
        symbol = utilitas.ensureString(symbol, { case: 'UP' })
    ), 'Symbol is required', 400);
    utilitas.assert((
        privateKey = utilitas.ensureString(privateKey)
    ), 'Private-key is required', 400);
    const args = [
        utilitas.ensureString(options?.name) || `${symbol} Token`, symbol,
        toWei(options?.cap || defaultCap, { ...options || {}, asBn: true }),
        utilitas.ensureString(options?.miner) || crypto.privateKeyToAddress(
            privateKey, { ...options || {}, standard: true }
        ),
    ];
    return await quorum.deployPreparedContract(
        solName, args, { ...options || {}, privateKey }
    );
};

const callPreparedMethod = async (contractAddress, method, args, options) => {
    return await quorum.callPreparedContractMethod(
        solName, method, args || [], { ...options || {}, contractAddress }
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

module.exports = {
    callPreparedMethod,
    deploy,
    getDecimals,
    getInfo,
    getName,
    getSymbol,
    getTotalSupply,
};

const { utilitas } = require('utilitas');
const quorum = require('./quorum');
const crypto = require('./crypto');
const web3 = require('web3');


// balanceOf(address account)
// 返回某地址拥有的 token 总数
// transfer(address recipient, uint256 amount)
// 将调用地址(可以是合约地址)下的token 转到接收地址下
// allowance(address owner, address spender)
// 查询 owner 地址授权给 spender 地址可转账的 token 数
// approve(address spender, uint256 amount)
// 调用地址授权给 spender 地址, 可用于转账的 token 数量为 amount
// transferFrom(address sender, address recipient, uint256 amount)
// 调用地址在 sender 地址授权给其的转账额度内对 sender 地址内的 token 进行转账操作
// increaseAllowance(address spender, uint256 addedValue)
// 调用地址将授权给 spender 地址用于转账的 token 数量增加 addedValue，非 ERC20 标准方法。
// decreaseAllowance(address spender, uint256 subtractedValue)
// 调用地址将授权给 spender 地址用于转账的 token 数量减少 addedValue，非 ERC20 标准方法。
// 事件
