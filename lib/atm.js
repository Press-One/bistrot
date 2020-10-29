'use strict';

const { account, mixin, sushitrain, finance, uuid, utilitas }
    = require('sushitrain');

const openAccount = async (acc, publicKey, options = {}) => {
    account.assertNotPreservedName(acc);
    await account.assertNewName(acc);
    utilitas.assert(publicKey, 'Public key is required.', 400);
    let [trace, memo, amount] = [uuid.v1(), {
        action: 'newaccount', account: acc, publicKey
    }, account.getRegisterPrice()];
    const paymentUrl = mixin.createPaymentUrlToOfficialAccount(
        amount, trace, memo, options
    );
    return {
        trace, memo, paymentUrl,
        ramQuant: mixin.formatAmount(account.defaultRamQuant),
        netQuant: mixin.formatAmount(account.defaultNetQuant),
        cpuQuant: mixin.formatAmount(account.defaultCpuQuant),
        amount: mixin.formatAmount(amount),
    };
};

const makePermission = (actor, pms) => {
    return { weight: 1, permission: sushitrain.makeAuthorization(actor, pms) };
};

const updateAuth = async (acc, publicKey, privateKey, options = {}) => {
    return await account.updateAuth('active', publicKey, [
        makePermission('prs.prsc', 'eosio.code'),
        makePermission('prs.tproxy', 'eosio.code'),
    ], acc, privateKey, options);
};

const rawDelegate = async (
    from, action, receiver, cpuQuantity, netQuantity, privateKey, options = {}
) => {
    if (receiver) {
        account.assertName(receiver, 'Invalid receiver.');
    } else {
        receiver = from;
    }
    cpuQuantity = finance.parseAndFormat(cpuQuantity);
    netQuantity = finance.parseAndFormat(netQuantity);
    utilitas.assert(cpuQuantity
        || netQuantity, 'Invalid CPU or NET quantity.', 400);
    const data = { from, receiver };
    switch ((action = String(action || '').toLowerCase())) {
        case 'delegatebw':
            data.transfer = false;
            data.stake_cpu_quantity = finance.formatAmount(cpuQuantity);
            data.stake_net_quantity = finance.formatAmount(netQuantity);
            break;
        case 'undelegatebw':
            data.unstake_cpu_quantity = finance.formatAmount(cpuQuantity);
            data.unstake_net_quantity = finance.formatAmount(netQuantity);
            break;
        default:
            utilitas.throwError('Invalid delegate action.');
    }
    return await sushitrain.transact(
        from, privateKey, 'eosio', action, data, options
    );
};

const delegate = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options = {}
) => {
    return await rawDelegate(
        from, 'delegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const undelegate = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options = {}
) => {
    return await rawDelegate(
        from, 'undelegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const claimRewards = async (owner, privateKey, options = {}) => {
    return await sushitrain.transact(
        owner, privateKey, 'eosio', 'claimrewards', { owner }, options
    );
};

const refund = async (owner, privateKey, options = {}) => {
    return await sushitrain.transact(
        owner, privateKey, 'eosio', 'refund', { owner }, options
    );
};

const requestPayment = async (
    privateKey, transType, chainAccount, mixinAccount,
    mixinId, email, currency, amount, memo, options = {}
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
            options.mixinAccountOrIdRequired = true;
            break;
        default:
            utilitas.throwError('Invalid transaction type.');
    }
    var {
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, trace, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, null, memo, options
    );
    const varId = {};
    if (mixinAccount) { varId.mixinAccount = mixinAccount; }
    if (mixinId) { varId.mixinId = mixinId; }
    if (email) { varId.email = email; }
    return {
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, trace, requestId, memo,
        transaction: await sushitrain.transact(
            chainAccount, privateKey, 'prs.tproxy', transType,
            {
                user: chainAccount,
                [key]: requestId,
                mixin_trace_id: trace,
                mixin_account_id: JSON.stringify(varId),
                amount: finance.formatAmount(amount),
                memo,
            },
            options
        )
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

const deposit = async (
    privateKey, account, email, amount, memo, options = {}
) => {
    const result = await requestPayment(
        privateKey, 'reqdeposit', account, null, null,
        email, mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting deposit.', 500);
    result.paymentUrl = mixin.createPaymentUrlToOfficialAccount(
        result.amount, result.trace, result.memo, options
    );
    result.paymentTimeout = new Date(new Date(
    ).getTime() + finance.transferTimeout).toISOString();
    return result;
};

const withdraw = async (
    privateKey, account, mixinAccount,
    mixinId, email, amount, memo, options = {}
) => {
    const result = await requestPayment(
        privateKey, 'reqwithdraw', account, mixinAccount,
        mixinId, email, mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting withdraw.', 500);
    return result;
};

module.exports = {
    cancelPaymentRequest,
    claimRewards,
    delegate,
    deposit,
    openAccount,
    refund,
    undelegate,
    updateAuth,
    withdraw,
};
