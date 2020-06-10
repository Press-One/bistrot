'use strict';

const defaultDepositMemo = 'Deposit on PRESS.one';
const defaultWithdrawMemo = 'Withdraw from PRESS.one';
const { utilitas } = require('utilitas');
const { account, finance } = require('sushitrain');
const uuidv1 = require('uuid').v1;
const mathjs = require('mathjs');

const openAccount = async (account, publicKey, options) => {
    account.assertName(account);
    utilitas.assert(publicKey, 'Public key is required.', 400);
    let [accCheck, trace, memo, amount] = [
        null, uuidv1(), { action: 'newaccount', account, publicKey },
        finance.bigFormat(mathjs.add(
            mathjs.bignumber(account.defaultRamQuant),
            mathjs.bignumber(account.defaultNetQuant),
            mathjs.bignumber(account.defaultCpuQuant),
        ))
    ];
    const encMemo = JSON.stringify(memo);
    utilitas.assert(encMemo.length <= 140, 'Memo too long.', 400);
    try { await atm.getAccount(account); } catch (err) { accCheck = err; }
    utilitas.assert(/unknown\ key/i.test(
        accCheck
    ), 'Unable to verify account name or account name already exists.', 400);
    return {
        trace, memo,
        ramQuant: `${account.defaultRamQuant} ${atm.mixinCurrency}`,
        netQuant: `${account.defaultNetQuant} ${atm.mixinCurrency}`,
        cpuQuant: `${account.defaultCpuQuant} ${atm.mixinCurrency}`,
        amount: `${amount} ${atm.mixinCurrency}`,
        paymentUrl: atm.createMixinPaymentUrlToSystemAccount(
            amount, trace, encMemo, options
        )
    };
};

const updateAuth = async (chainAccount, publicKey, privateKey, options) => {
    assert(publicKey, 'Invalid publicKey key.');
    return await transact(chainAccount, privateKey, 'eosio', 'updateauth', {
        parent: 'owner',
        account: chainAccount,
        permission: 'active',
        auth: {
            threshold: 1,
            waits: [],
            keys: [{ key: publicKey, weight: 1 }],
            accounts: [{
                weight: 1,
                permission: { actor: 'prs.prsc', permission: 'eosio.code' }
            }, {
                weight: 1,
                permission: { actor: 'prs.tproxy', permission: 'eosio.code' }
            }],
        },
    }, options);
};



const getStakeQuantity = (amount) => {
    return `${amount || '0.0000'} ${chainCurrency}`;
};

const rawDelegateBw = async (
    from, action, receiver, cpuQuantity, netQuantity, privateKey, options
) => {
    if (receiver) {
        assertAccountName(receiver, 'Invalid receiver.');
    } else {
        receiver = from;
    }
    cpuQuantity = parseAndFormat(cpuQuantity);
    netQuantity = parseAndFormat(netQuantity);
    assert(cpuQuantity || netQuantity, 'Invalid CPU or NET quantity.');
    const data = { from, receiver };
    switch ((action = String(action || '').toLowerCase())) {
        case 'delegatebw':
            data.transfer = false;
            data.stake_cpu_quantity = getStakeQuantity(cpuQuantity);
            data.stake_net_quantity = getStakeQuantity(netQuantity);
            break;
        case 'undelegatebw':
            data.unstake_cpu_quantity = getStakeQuantity(cpuQuantity);
            data.unstake_net_quantity = getStakeQuantity(netQuantity);
            break;
        default:
            assert(false, 'Invalid delegate action.');
    }
    return await transact(from, privateKey, 'eosio', action, data, options);
};

const delegateBw = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options
) => {
    return await rawDelegateBw(
        from, 'delegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const undelegateBw = async (
    from, receiver, cpuQuantity, netQuantity, privateKey, options
) => {
    return await rawDelegateBw(
        from, 'undelegatebw', receiver, cpuQuantity,
        netQuantity, privateKey, options
    );
};

const claimRewards = async (chainAccount, privateKey, options) => {
    return await transact(chainAccount, privateKey, 'eosio', 'claimrewards', {
        owner: chainAccount,
    }, options);
};

const requestPayment = async (
    privateKey, transType, chainAccount, mixinAccount,
    mixinId, email, currency, amount, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    let key = null;
    switch (transType) {
        case 'reqdeposit':
            key = 'deposit_id';
            memo = memo || defaultDepositMemo;
            break;
        case 'reqwithdraw':
            key = 'withdraw_id';
            memo = memo || defaultWithdrawMemo;
            options.mixinAccountOrIdRequired = true;
            break;
        default:
            assert(false, 'Invalid transaction type.');
    }
    var {
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, trace, requestId, memo
    } = verifyPaymentArgs(
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, null, memo, options
    );
    const varId = {};
    if (mixinAccount) {
        varId.mixinAccount = mixinAccount;
    }
    if (mixinId) {
        varId.mixinId = mixinId;
    }
    if (email) {
        varId.email = email;
    }
    return {
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, trace, requestId, memo,
        transaction: await transact(
            chainAccount, privateKey, 'prs.tproxy', transType,
            {
                user: chainAccount,
                [key]: requestId,
                mixin_trace_id: trace,
                mixin_account_id: JSON.stringify(varId),
                amount: `${amount} ${chainCurrency}`,
                memo,
            },
            options
        )
    };
};

const cancelPaymentRequest = async (privateKey, account, memo, options) => {
    return await transact(account, privateKey, 'prs.tproxy', 'cancelreq', {
        user: account,
        memo: memo || 'Payment request canceled by user.',
    }, options);
};

const deposit = async (privateKey, account, email, amount, memo, options) => {
    let result = await requestPayment(
        privateKey, 'reqdeposit', account, null, null,
        email, mixinCurrency, amount, memo, options
    );
    assert(result, 'Error requesting deposit.');
    result.paymentUrl = createMixinPaymentUrlToSystemAccount(
        result.amount, result.trace, result.memo, options
    );
    result.paymentTimeout = new Date(new Date(
    ).getTime() + paymentTimeout).toISOString();
    return result;
};

const withdraw = async (
    privateKey, account, mixinAccount, mixinId, email, amount, memo, options
) => {
    let result = await requestPayment(
        privateKey, 'reqwithdraw', account, mixinAccount,
        mixinId, email, mixinCurrency, amount, memo, options
    );
    assert(result, 'Error requesting withdraw.');
    return result;
};

const getBalance = async (privateKey, account) => {
    return await getBalanceByAccountAndCurrency(
        privateKey, account, chainCurrency
    );
};


module.exports = {
    createAccount,
    openAccount,
    regProducer,
    bigFormat,
    chainCurrency,
    mixinCurrency,
    paymentTimeout,
    transact,
    assertAccountName,
    updateAuth,
    claimRewards,
    deposit,
    withdraw,
    cancelPaymentRequest,
    getInfo,
    getProducers,
    getAccount,
    getBalance,
    delegateBw,
    undelegateBw,
    createMixinPaymentUrlToSystemAccount,
};
