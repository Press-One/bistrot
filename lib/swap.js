'use strict';

const [swapFeeRate, precision] = [0.003, 8];
const poolStatus = ['OK', 'GONE'];
const tranType = ['COLLECT', 'SETTLE'];
const tranStatus = ['REQ_RECEIVED', 'PAID', 'RETURNED'];
const trxType = ['SWAP', 'ADD_LIQUID', 'RM_LIQUID'];
const trxStatus = [
    'WAIT_COLLECT', 'WAIT_SETTLE', 'WAIT_ORACLE', 'SUCCESS', 'FAILED', 'TIMEOUT'
];

const getEnum = (eArr, eInt) => { return [null, ...eArr][eInt] || 'UNKNOW'; };
const getPoolStatus = (enumInt) => { return getEnum(poolStatus, enumInt); };
const getTranType = (enumInt) => { return getEnum(tranType, enumInt); };
const getTranStatus = (enumInt) => { return getEnum(tranStatus, enumInt); };
const getTrxType = (enumInt) => { return getEnum(trxType, enumInt); };
const getTrxStatus = (enumInt) => { return getEnum(trxStatus, enumInt); };
const getTimeByTimestamp = (tStamp) => { return new Date(tStamp * 1000); };

// const parseEosUint128 = (strNum, options) => {
//     options = options || {};
//     const Ox = '0x';
//     const arrNum = utilias.ensureString(strNum).replace(
//         new RegExp(`^${Ox}`), ''
//     ).split('');
//     const revNum = [];
//     while (arrNum.length) { revNum.unshift(arrNum.splice(0, 2).join('')) }
//     let bgn = math.bignumber(`${Ox}${revNum.join('')}`);
//     return bgn = options.asBigNumber
//         ? bgn : math.format(bgn || 0, { noation: 'fixed' }).replace(/"/g, '');
// };

const parsePoolToken = (str) => {
    return {
        symbol: str.replace(/^(.*)\ (.*)$/, '$2'),
        volume: str.replace(/^(.*)\ (.*)$/, '$1'),
    }
};

const formatNumber = (num, options) => {
    options = Object.assign({ notation: 'fixed', precision }, options || {});
    return math.format(num, options);
};

const packNumber = (num, options) => {
    return options && options.asBigNumber ? num : formatNumber(num);
};

const calculateInvariant = (a, b, options) => {
    const result = math.multiply(math.bignumber(a), math.bignumber(b));
    return packNumber(result, options);
};

const rawCalculateRate = (a, b, i, options) => {
    i = i ? math.bignumber(i) : calculateInvariant(a, b, { asBigNumber: true });
    const result = math.subtract(
        math.divide(i, math.subtract(math.bignumber(a), 1)), math.bignumber(b)
    );
    return packNumber(result, options);
};

const calculateRate = (p) => {
    const [a, b, i] = [p.tokens[0], p.tokens[1], p.invariant];
    return {
        [`${a.symbol}-${b.symbol}`]: rawCalculateRate(a.volume, b.volume, i),
        [`${b.symbol}-${a.symbol}`]: rawCalculateRate(b.volume, a.volume, i),
    };
};

const packPool = (p) => {
    p.created_at = new Date(p.created_timestamp * 1000)
    p.pool_status = getPoolStatus(p.pool_status);
    p.pool_token = parsePoolToken(p.pool_token);
    p.tokens = [parsePoolToken(p.token1), parsePoolToken(p.token2),];
    p.invariant = calculateInvariant(p.tokens[0].volume, p.tokens[1].volume);
    p.swap_fee = swapFeeRate;
    p.rates = calculateRate(p);
    delete p.token1;
    delete p.token2;
    delete p.created_timestamp;
    return p;
};

const packTrx = (p) => {
    p.type = getTrxType(p.type);
    p.status = getTrxStatus(p.status);
    return p;
};

const packTran = (p) => {
    // debug {
    p.mixin_trace_id = JSON.stringify([p.mixin_trace_id, p.mixin_trace_id]);
    // }
    p.mixin_trace_id = JSON.parse(p.mixin_trace_id);
    p.type = getTranType(p.type);
    p.status = getTranStatus(p.status);
    p.timestamp_received = getTimeByTimestamp(p.timestamp_received);
    p.payment_request = {};
    p.payment_timeout = new Date(p.timestamp_received.getTime(
    ) + finance.transferTimeout);
    for (let i = 0; i < 2; i++) {
        const plan = finance.parseAmountAndCurrency(p[`token${i + 1}`]);
        if (!plan[2]) { continue; }
        p.payment_request[p.mixin_trace_id[i]] = {
            currency: plan[1],
            amount: plan[0],
            payment_url: mixin.createPaymentUrlToOfficialAccount(
                plan[0], p.mixin_trace_id[i], p.memo, { currency: plan[1] }
            ),
        };
    }
    return p;
};

const getAllPools = async () => {
    const resp = await table.getAll('prs.swap', 'pool');
    return resp.map(packPool);
};

const getAllTrxs = async () => {
    const resp = await table.getAll('prs.swap', 'trxs');
    return resp.map(packTrx);
};

const getAllTrans = async () => {
    const resp = await table.getAll('swap.oracle', 'trans');
    return resp.map(packTran);
};

module.exports = {
    formatNumber,
    getAllPools,
    getAllTrxs,
    getAllTrans,
    rawCalculateRate,
};

const { utilitas, math } = require('utilitas');
const finance = require('./finance');
const table = require('./table');
const mixin = require('./mixin');
