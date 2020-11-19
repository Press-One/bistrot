'use strict';

const [swapFeeRate, precision] = [0.003, 8];
const poolStatus = [null, 'OK', 'GONE'];
const getPoolStatus = (enumInt) => { return poolStatus[enumInt] || 'UNKNOW'; };

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
    Object.assign(p, calculateRate(p));
    delete p.token1;
    delete p.token2;
    delete p.created_timestamp;
    return p;
};

const getPool = async () => {
    const resp = await table.getAll('prs.swap', 'pool');
    return resp.map(packPool);
};


module.exports = {
    getPool,
    rawCalculateRate,
};

const { utilitas, math } = require('utilitas');
const table = require('./table');
