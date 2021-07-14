const requestPayment = async (
    privateKey, transType, chainAccount, mixinAccount,
    email, currency, amount, memo, options = {}
) => {
    options.chainAccountRequired = true;
    let key = null;
    switch (transType) {
        case 'reqdeposit':
            key = 'deposit_id';
            memo = memo || 'Deposit on PRESS.one';
            break;
        case 'reqwithdraw':
            key = 'withdraw_id';
            memo = memo || 'Withdraw from PRESS.one';
            options.mixinAccountRequired = true;
            break;
        default:
            utilitas.throwError('Invalid transaction type.');
    }
    var {
        chainAccount, mixinAccount, email, currency, amount, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, mixinAccount, null, email,
        currency, amount, null, memo, options
    );
    const varId = {};
    if (mixinAccount) { varId.mixinAccount = mixinAccount; }
    if (email) { varId.email = email; }
    const transaction = await sushitrain.transact(
        chainAccount, privateKey, 'prs.tproxy', transType,
        {
            user: chainAccount,
            [key]: requestId,
            mixin_trace_id: '',
            mixin_account_id: JSON.stringify(varId),
            amount: finance.formatAmount(amount),
            memo,
        },
        options
    );
    const trace = mixin.getTraceByTransactionId(transaction.transaction_id);
    return {
        chainAccount, mixinAccount, email, currency,
        amount, trace, requestId, memo, transaction
    };
};

const cancelPaymentRequest = async (privateKey, user, memo, options = {}) => {
    return await sushitrain.transact(
        user, privateKey, 'prs.tproxy', 'cancelreq',
        {
            user, memo: memo || 'Payment request canceled by user.',
        }, options
    );
};

const packDeposit = async (result, options) => {
    result.paymentUrl = await system.magicPayment(
        mixin.createPaymentUrlToOfficialAccount(
            result.amount, result.trace, result.memo, options
        ), { cnb: true, screening: true }
    );
    result.paymentTimeout = new Date(new Date(
    ).getTime() + finance.transferTimeout).toISOString();
    return result;
};

const deposit = async (
    privateKey, account, email, amount, memo, options = {}
) => {
    const result = await requestPayment(
        privateKey, 'reqdeposit', account, null, email,
        mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting deposit.', 500);
    return await packDeposit(result, options);
};

const withdraw = async (privateKey, acc, email, amount, memo, options) => {
    options = options || {};
    const mixinAccount = options.mixinAccount || utilitas.extract(
        await queryMixinBoundByAccount(acc, { assert: true }),
        'bound_account'
    );
    const result = await requestPayment(
        privateKey, 'reqwithdraw', acc, mixinAccount,
        email, mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting withdraw.', 500);
    return result;
};
