import { utilitas, math } from 'utilitas';

const amountMultiple = 10000;
const chainCurrency = 'SYS';
const defaultTransMemo = 'Transfer via Quorum';
const maxWithdrawAmount = 200000;
const transferTimeout = 1000 * 60 * 60 * 24 * 7;
const transStatuses = { REQUESTED: 1, WAIT_ORACLE: 2, SUCCESS: 3, FAILED: 4 };
const transTypes = { DEPOSIT: 1, WITHDRAW: 2 };

const getTransTypeByValue = (typeValue) => {
    return utilitas.getKeyByValue(transTypes, typeValue);
};

const getTransStatusByValue = (statusValue) => {
    return utilitas.getKeyByValue(transStatuses, statusValue);
};

const bigFormat = (bignumber, currency, options) => {
    return math.format(bignumber || 0, {
        notation: 'fixed', precision: options?.precision ?? 4,
    }).replace(/"/g, '') + (currency ? ` ${currency.toUpperCase()}` : '');
};

const formatAmount = (number, currency = chainCurrency) => {
    return bigFormat(number, currency);
};

const parseAmount = (amount) => {
    return /^-?\d+(\.\d+)?$/.test(amount = String(amount))
        && math.larger('1000000000000000000000000000000', amount)
        && math.larger(amount, 0) // max length = 30 // + 1 for checking
        && amount;
};

const assertAmount = (amount, error, code = 400) => {
    amount = parseAmount(amount);
    utilitas.assert(amount, error || 'Invalid amount.', code);
    return amount;
};

const parseAndFormat = (amount, currency) => {
    return parseAmount(amount) && bigFormat(math.bignumber(amount), currency);
};

const restoreAmount = (number) => {
    return bigFormat(math.divide(math.bignumber(number), amountMultiple));
};

const multiplyAmount = (number) => {
    return parseInt(
        math.multiply(math.bignumber(number), amountMultiple).toString()
    );
};

const bignumberSum = function() {
    return bigFormat(math.add.apply(null, [
        0, ...Array.from(arguments).map((x) => { return math.bignumber(x); })
    ]));
};

const largerEq = (x, y) => {
    return math.largerEq(math.bignumber(x), math.bignumber(y));
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

export {
    chainCurrency,
    defaultTransMemo,
    maxWithdrawAmount,
    transferTimeout,
    transStatuses,
    assertAmount,
    assertPayment,
    bigFormat,
    bignumberSum,
    formatAmount,
    getTransStatusByValue,
    getTransTypeByValue,
    largerEq,
    mapCurrency,
    multiplyAmount,
    parseAmount,
    parseAmountAndCurrency,
    parseAndFormat,
    parseBalance,
    restoreAmount,
};
