'use strict';

const mathjs = require('mathjs');

const amountMultiple = 10000;
const chainCurrency = 'SRP';

const bigFormat = (bignumber) => {
    return mathjs.format(bignumber, {
        notation: 'fixed',
        precision: 4,
    }).replace(/"/g, '');
};

const parseAmount = (amount) => {
    return /^-?\d+(\.\d+)?$/.test(amount = String(amount))
        && mathjs.larger('1000000000000000000000000000000', amount)
        && mathjs.larger(amount, 0) // max length = 30 // + 1 for checking
        && amount;
};

const parseAndFormat = (amount) => {
    return parseAmount(amount) && bigFormat(amount);
};

const restoreAmount = (number) => {
    return bigFormat(mathjs.divide(mathjs.bignumber(number), amountMultiple));
};

const multiplyAmount = (number) => {
    return parseInt(
        mathjs.multiply(mathjs.bignumber(number), amountMultiple).toString()
    );
};

const parseAmountAndCurrency = (string) => {
    let result = null;
    if (string) {
        result = [
            string.replace(/(^[\d\.]*) ([a-z]*$)/i, '$1'),
            string.replace(/(^[\d\.]*) ([a-z]*$)/i, '$2'),
        ];
        result.push(multiplyAmount(result[0], amountMultiple));
    }
    return result;
};

module.exports = {
    chainCurrency,
    bigFormat,
    multiplyAmount,
    parseAmount,
    parseAmountAndCurrency,
    parseAndFormat,
    restoreAmount,
};
