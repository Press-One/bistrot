'use strict';



exports.deposit = async (ctx, next) => {
    try {
        const resp = await models.finance.deposit(
            ctx.request.body.account, ctx.request.body.amount
        );
        ctx.ok(resp);
    } catch (err) {
        ctx.er(err.message);
    }
};

const deposit = async (account, amount) => {
    let result = await requestDeposit(account, amount);
    result.paymentUrl = models.mixin.createMixinPaymentUrlToSystemAccount(
        amount, result.trace, depositMemo
    );
    return result;
};

const requestDeposit = async (account, amount) => {
    return await requestPayment(
        'reqdeposit', account, config.defaultCurrency,
        amount, uuidV1(), depositMemo
    );
};

const createMixinPaymentUrlToSystemAccount = (amount, trace, memo, options) => {
    return createMixinPaymentUrl(
        config.mixin.clientId,
        config.defaultCurrency,
        amount, trace, memo, options
    );
};

const createMixinPaymentUrl = (
    recipient, currency, amount, trace, memo, options
) => {
    var {
        recipient, currencyId, amount, trace, memo
    } = models.finance.verifyPaymentArgs(
        recipient, currency, amount, trace, memo
    );
    return 'https://mixin.one/pay'
        + '?recipient=' + encodeURIComponent(recipient)
        + '&asset=' + encodeURIComponent(currencyId)
        + '&amount=' + encodeURIComponent(amount)
        + '&trace=' + encodeURIComponent(trace)
        + '&memo=' + encodeURIComponent(memo);
};

const verifyPaymentArgs = (recipient, currency, amount, trace, memo) => {
    let currencyId = models.mixin.currencies[currency];
    amount = parseAndFormat(amount);
    models.utility.assert(recipient, 'Invalid recipient');
    models.utility.assert(currencyId, 'Invalid currency');
    models.utility.assert(amount, 'Invalid amount');
    models.utility.assert(models.utility.verifyUuid(trace), 'Invalid trace');
    return {
        recipient, currency, currencyId, amount, trace,
        requestId: getTimestampFromUuid(trace),
        memo: memo || config.defaultTransMemo,
    };
};

const bigFormat = (bignumber) => {
    return mathjs.format(bignumber, {
        notation: 'fixed',
        precision: 4,
    });
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
