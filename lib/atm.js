'use strict';

const { account, mixin, sushitrain, finance } = require('sushitrain');
const { utilitas } = require('utilitas');
const uuidv1 = require('uuid').v1;

const openAccount = async (acc, publicKey, options = {}) => {
    account.assertNewName(acc);
    utilitas.assert(publicKey, 'Public key is required.', 400);
    let [trace, memo, amount] = [uuidv1(), {
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

const updateAuth = async (acc, publicKey, privateKey, options = {}) => {
    utilitas.assert(publicKey, 'Invalid publicKey key.', 400);
    return await sushitrain.transact(
        acc, privateKey, 'eosio', 'updateauth',
        {
            parent: 'owner',
            account: acc,
            permission: 'active',
            auth: {
                threshold: 1,
                waits: [],
                keys: [{ key: publicKey, weight: 1 }],
                accounts: [{
                    weight: 1, permission: sushitrain.makeAuthorization(
                        'prs.prsc', 'eosio.code'
                    ),
                }, {
                    weight: 1, permission: sushitrain.makeAuthorization(
                        'prs.tproxy', 'eosio.code'
                    ),
                }],
            },
        }, options
    );
};

const rawDelegateBw = async (
    from, action, receiver, cpuQuantity, netQuantity, privateKey, options = {}
) => {
    if (receiver) {
        account.assertName(receiver, 'Invalid receiver.');
    } else {
        receiver = from;
    }
    cpuQuantity = parseAmount(cpuQuantity);
    netQuantity = parseAmount(netQuantity);
    utilitas.assert(cpuQuantity || netQuantity, 'Invalid CPU or NET quantity.', 400);
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

const delegateBw = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options = {}
) => {
    return await rawDelegateBw(
        from, 'delegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const undelegateBw = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options = {}
) => {
    return await rawDelegateBw(
        from, 'undelegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const claimRewards = async (owner, privateKey, options = {}) => {
    return await sushitrain.transact(
        owner, privateKey, 'eosio', 'claimrewards', { owner }, options
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
    } = verifyPaymentArgs(
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
        email, mixinCurrency, amount, memo, options
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
        mixinId, email, mixinCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting withdraw.', 500);
    return result;
};

module.exports = {
    openAccount,
    updateAuth,
    claimRewards,
    deposit,
    withdraw,
    cancelPaymentRequest,
    delegateBw,
    undelegateBw,
};
