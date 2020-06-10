'use strict';

const { utilitas } = require('utilitas');
const mathjs = require('mathjs');

const maxWithdrawAmount = 200000;
const defaultTransMemo = 'Transfer via PRESS.one';
const transferTimeout = 1000 * 60 * 60 * 24 * 7;
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

const largerEq = (x, y) => {
    return mathjs.largerEq(mathjs.bignumber(x), mathjs.bignumber(y));
};

const assertPayment = (amount, price) => {
    return utilitas.assert(parseFloat(amount) && parseFloat(price)
        && largerEq(amount, price), 'Payment amount is not enough', 400);
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

const parseBalance = (balance) => {
    const result = {};
    balance.map(x => {
        const res = parseAmountAndCurrency(x);
        result[res[1]] = res[0];
    });
    return result;
};

const mapCurrency = (currency, source, target) => {
    return currency === source ? target : currency;
};

module.exports = {
    chainCurrency,
    defaultTransMemo,
    maxWithdrawAmount,
    transferTimeout,
    assertPayment,
    bigFormat,
    largerEq,
    mapCurrency,
    multiplyAmount,
    parseAmount,
    parseAmountAndCurrency,
    parseAndFormat,
    parseBalance,
    restoreAmount,
};
