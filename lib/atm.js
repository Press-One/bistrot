'use strict';

const {
    account, mixin, sushitrain, finance, prsc,
    uuid, utilitas, crypto, sushibar, prsUtility,
} = require('sushitrain');
const system = require('./system');

const pmsNeeded = ['prs.prsc', 'prs.swap', 'prs.tproxy'];

const getAccount = async (acc) => {
    const [accResp, accBound] = await Promise.all([
        account.getByName(acc), queryBoundByAccount(acc)
    ]);
    utilitas.assert(accResp, `Account Not Found (${acc}).`, 404);
    (accBound || []).map(b => {
        const { payment_provider, payment_account } = utilitas.extract(
            b, 'transactions_trx_transaction_actions_data_data'
        ) || {};
        if (!payment_provider || !payment_account) { return; }
        const lp = utilitas.ensureString(payment_provider, { case: 'LOW' });
        Object.assign(accResp, {
            [`bound_${lp}_account`]: payment_account,
            [`bound_${lp}_profile`]: utilitas.extract(b, `bound_${lp}_profile`),
        });
    });
    return accResp;
};

const openAccount = async (acc, publicKey, options = {}) => {
    await account.assertNotPreservedName(acc);
    await account.assertNewName(acc);
    utilitas.assert(publicKey, 'Public key is required.', 400);
    const [trace, memo, amount] = [uuid.v1(), {
        action: 'newaccount', account: acc, publicKey
    }, account.getRegisterPrice()];
    const paymentUrl = system.magicPayment(
        mixin.createPaymentUrlToOfficialAccount(amount, trace, memo, options),
        { cnb: true }
    );
    return {
        trace, memo, paymentUrl,
        ramQuant: mixin.formatAmount(account.defaultRamQuant),
        netQuant: mixin.formatAmount(account.defaultNetQuant),
        cpuQuant: mixin.formatAmount(account.defaultCpuQuant),
        amount: mixin.formatAmount(amount),
    };
};

const openFreeAccount = async (publicKey, privateKey, options = {}) => {
    utilitas.assert(publicKey, 'Public key is required.', 400);
    const data = { action: 'newaccount', publicKey, time: Date.now() };
    const pd = { data, signature: crypto.signData(data, privateKey).signature };
    return await sushibar.requestApi('POST', `chain/accounts`, null, pd);
};

const bindMixinIdentity = async (acc, privateKey, options = {}) => {
    await account.getByName(acc);
    const [trace, amount] = [uuid.v1(), account.bindingPrice];
    const memo = {
        a: 'b', c: acc, s: crypto.signData({ trace }, privateKey).signature,
    };
    const paymentUrl = system.magicPayment(
        mixin.createPaymentUrlToOfficialAccount(amount, trace, memo, options),
        { cnb: true }
    );
    return { trace, memo, paymentUrl, amount: mixin.formatAmount(amount) };
};

const makePermission = (actor, pms) => {
    return { weight: 1, permission: sushitrain.makeAuthorization(actor, pms) };
};

const updateAuth = async (acc, publicKey, privateKey, options) => {
    options = options || {};
    if (!publicKey) {
        const key = await account.getKeys(acc, 'active');
        utilitas.assert(key, 'Error finding public keys to auth.', 500);
        if (!options.force) {
            let authed = true;
            for (let p of pmsNeeded) {
                let found = false;
                for (let a of key.authorization) {
                    if (a.permission.actor === p) { found = true; continue; }
                }
                if (!found) { authed = false; break; }
            }
            if (authed) { return key; }
        }
        publicKey = key.key;
    }
    return await account.updateAuth('active', publicKey, pmsNeeded.map((x) => {
        return makePermission(x, 'eosio.code');
    }), acc, privateKey, options);
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

const refund = async (owner, privateKey, options = {}) => {
    return await sushitrain.transact(
        owner, privateKey, 'eosio', 'refund', { owner }, options
    );
};

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

const deposit = async (
    privateKey, account, email, amount, memo, options = {}
) => {
    const result = await requestPayment(
        privateKey, 'reqdeposit', account, null, email,
        mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting deposit.', 500);
    result.paymentUrl = system.magicPayment(
        mixin.createPaymentUrlToOfficialAccount(
            result.amount, result.trace, result.memo, options
        ), { cnb: true }
    );
    result.paymentTimeout = new Date(new Date(
    ).getTime() + finance.transferTimeout).toISOString();
    return result;
};

const withdraw = async (privateKey, account, email, amount, memo, options) => {
    options = options || {};
    const mixinAccount = options.mixinAccount || utilitas.extract(
        await queryMixinBoundByAccount(account, { assert: true }),
        'bound_account'
    );
    await updateAuth(account, null, privateKey);
    const result = await requestPayment(
        privateKey, 'reqwithdraw', account, mixinAccount,
        email, mixin.defaultCurrency, amount, memo, options
    );
    utilitas.assert(result, 'Error requesting withdraw.', 500);
    return result;
};

const queryBoundByAccount = async (acc, options) => {
    options = options || {};
    account.assertName(acc, 'Invalid account.');
    const args = {};
    if (options.provider) { args.provider = options.provider; }
    return await sushibar.requestApi('GET', `chain/bounds/${acc}`, args);
};

const queryMixinBoundByAccount = async (acc, options) => {
    options = Object.assign(options || {}, { provider: 'MIXIN' });
    const transaction = await queryBoundByAccount(acc, options);
    const bound_account = utilitas.extract(
        transaction, 'transactions_trx_transaction_actions_data_data',
        'payment_account'
    );
    const bound_profile = utilitas.extract(transaction, 'bound_mixin_profile');
    utilitas.assert(
        !options.assert || bound_account,
        `Bound Mixin-Account Not Found for Account (${acc}).`
    );
    return { transaction, bound_account, bound_profile };
};

const authOfficialReward = async (acc, privateKey, options = {}) => {
    const resp = await account.addClaimerAuth(acc, privateKey, options);
    const auth = {
        keystore: resp.keystore,
        account: acc,
        permission: 'claimrewards',
        time: Date.now(),
    };
    resp.signature = crypto.signData(auth, privateKey).signature;
    resp.authresult = await system.requestSushichef(
        'POST', 'chain/auth', null,
        { auth, signature: resp.signature }, null, options
    );
    return resp;
};

const unauthOfficialReward = async (acc, privateKey, options = {}) => {
    const resp = await account.delClaimerAuth(acc, privateKey, options);
    const auth = {
        account: acc,
        permission: 'claimrewards',
        time: Date.now(),
    };
    resp.signature = crypto.signData(auth, privateKey).signature;
    resp.authresult = await system.requestSushichef(
        'POST', 'chain/unauth', null,
        { auth, signature: resp.signature }, null, options
    );
    return resp;
};

const accountEvolution = async (prevKey, account, publicKey, privateKey) => {
    prsc.assertString(account, 'Invalid evolved user account.');
    prsc.assertString(publicKey, 'Invalid evolved public key.');
    const userAddress = prsUtility.privateKeyToAddress(prevKey);
    const data = {
        account, userAddress, publicKey, provider: 'PRSLEGACY',
        time: Date.now(), action: 'BINDIDENTITY',
    };
    const postData = {
        data, evolvedSignature: prsc.sign(data, privateKey),
        legacySignature: prsUtility.signBlockData(data, prevKey),
    };
    return await sushibar.requestApi('POST', `chain/bounds`, null, postData);
};

module.exports = {
    accountEvolution,
    authOfficialReward,
    bindMixinIdentity,
    cancelPaymentRequest,
    delegate,
    deposit,
    getAccount,
    openAccount,
    openFreeAccount,
    queryBoundByAccount,
    queryMixinBoundByAccount,
    refund,
    unauthOfficialReward,
    undelegate,
    updateAuth,
    withdraw,
};
