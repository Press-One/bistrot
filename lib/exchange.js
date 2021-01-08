'use strict';

const { account, swap, sushitrain, mixin, utilitas, math, finance }
    = require('sushitrain');
const statement = require('./statement');
const atm = require('./atm');

const mergeKeys = {
    from_user: true, to_user: true, type: 'transaction_type',
    status: 'transaction_status', pool_name: true, from_token: true,
    to_token: true, slippage: true, oracle_info: true, oracle_trx_id: true,
    oracle_timestamp: true,
};
const format = (num) => { return swap.formatNumber(math.bignumber(num)); };
const multiply = (a, b) => { return format(math.multiply(a, b)); };
const formatPercentage = (num) => { return `${math.multiply(num, 100)} %`; }

const swapToken = async (
    privateKey, chainAccount, currency, amount,
    to_currency, slippage, email, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    var {
        chainAccount, email, currency, amount, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, null, null, email, currency, amount,
        null, memo || swap.defaultTransMemo, options
    );
    to_currency = utilitas.trim(to_currency, { case: 'UP' });
    slippage = ~~slippage || swap.defaultSlippage;
    utilitas.assert(0 < slippage && slippage < 100, 'Invalid slippage.', 400);
    const mixin_account_id = email ? { email } : {};
    const catchPool = await swap.getPoolByCurrency(currency, to_currency);
    const rate = catchPool.rates[`${currency}-${to_currency}`];
    const swap_fee = multiply(catchPool.swap_fee, amount);
    const result = {
        chainAccount, receiver: chainAccount,
        pool: catchPool.pool_name, currency, to_currency, rate, swap_fee,
        swap_fee_rate: formatPercentage(catchPool.swap_fee),
        slippage: formatPercentage(math.divide(slippage, 100)),
        amount: format(amount),
        to_amount: multiply(math.subtract(amount, swap_fee), rate),
        notification: mixin_account_id, memo
    };
    if (!options.dryrun) {
        result.transaction = await sushitrain.transact(
            chainAccount, privateKey, 'prs.swap', 'swaptoken',
            {
                req_id: requestId,
                from_user: chainAccount,
                to_user: chainAccount,
                pool_name: catchPool.pool_name,
                amount: `${amount} ${currency}`,
                slippage, mixin_trace_id: '', memo,
                mixin_account_id: JSON.stringify(mixin_account_id),
            }
        );
    }
    return result;
};

const addLiquid = async (
    privateKey, chainAccount, currency_a,
    amount_a, currency_b, email, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    var {
        chainAccount, email, currency: currency_a,
        amount: amount_a, requestId, memo, volumeA, volumeB
    } = mixin.verifyPaymentArgs(
        chainAccount, null, null, email, currency_a, amount_a,
        null, memo || swap.addLiquidMemo, options
    );
    currency_b = utilitas.trim(currency_b, { case: 'UP' });
    const mixin_account_id = email ? { email } : {};
    const catchPool = await swap.getPoolByCurrency(currency_a, currency_b);
    catchPool.tokens.map(x => {
        if (x.symbol === currency_a) { volumeA = x.volume; }
        if (x.symbol === currency_b) { volumeB = x.volume; }
    });
    const amount_b = math.divide(math.multiply(amount_a, volumeB), volumeA);
    const result = {
        chainAccount, receiver: chainAccount,
        pool: catchPool.pool_name, currency_a, currency_b,
        amount_a: finance.bigFormat(amount_a),
        amount_b: finance.bigFormat(amount_b),
        notification: mixin_account_id, memo
    };
    const [token1_amount, token2_amount]
        = catchPool.tokens[0].symbol === currency_a
            ? [
                `${finance.bigFormat(amount_a, currency_a)}`,
                `${finance.bigFormat(amount_b, currency_b)}`
            ] : [
                `${finance.bigFormat(amount_b, currency_b)}`,
                `${finance.bigFormat(amount_a, currency_a)}`
            ];
    if (!options.dryrun) {
        result.transaction = await sushitrain.transact(
            chainAccount, privateKey, 'prs.swap', 'addliquid',
            {
                req_id: requestId,
                user: chainAccount,
                pool_name: catchPool.pool_name,
                token1_amount, token2_amount, mixin_trace_id: '', memo,
                mixin_account_id: JSON.stringify(mixin_account_id),
            }
        );
    }
    return result;
};

const rmLiquid = async (
    privateKey, chainAccount, currency_a,
    currency_b, amount, email, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    options.mixinAccountRequired = true;
    const bMixinAccount = options.mixinAccount || utilitas.extract(
        await atm.queryMixinBoundByAccount(chainAccount, { assert: true }),
        'bound_account'
    );
    var {
        chainAccount, mixinAccount, email,
        currency: currency_a, amount, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, bMixinAccount, null, email, currency_a,
        amount, null, memo || swap.rmLiquidMemo, options
    );
    await atm.updateAuth(chainAccount, null, privateKey);
    const varId = { mixinAccount };
    if (email) { varId.email = email; }
    currency_b = utilitas.trim(currency_b, { case: 'UP' });
    const catchPool = await swap.getPoolByCurrency(currency_a, currency_b);
    return await sushitrain.transact(
        chainAccount, privateKey, 'prs.swap', 'rmliquid',
        {
            req_id: requestId,
            user: chainAccount,
            pool_name: catchPool.pool_name,
            pool_token_amount: finance.bigFormat(
                amount, catchPool.pool_token.symbol
            ), mixin_trace_id: '', memo,
            mixin_account_id: JSON.stringify(varId),
        }
    );
};

const getPaymentRequest = async (chainAccount) => {
    account.assertName(chainAccount);
    const [tr, ts] = await Promise.all([swap.getAllTrxs(), swap.getAllTrans()]);
    let [trxs, trans] = [{}, []];
    tr.filter(x => {
        return utilitas.insensitiveCompare(x.from_user, chainAccount);
    }).map(x => { trxs[x.trx_id] = x; });
    trans = ts.filter(x => {
        return utilitas.insensitiveCompare(x.user, chainAccount);
    }).map(x => {
        for (let i in mergeKeys) {
            x[utilitas.isString(mergeKeys[i]) ? mergeKeys[i] : i]
                = (trxs[x.id] || {})[i];
        }
        return x;
    });
    return trans.length ? trans[0] : null;
};

const cancelSwap = async (privateKey, user, memo) => {
    account.assertName(user);
    const request = await getPaymentRequest(user);
    utilitas.assert(request, 'Payment request not found.', 400);
    request.transaction = await sushitrain.transact(
        user, privateKey, 'prs.swap', 'cancel',
        {
            req_id: request.id, user, pool_name: request.pool_name,
            memo: memo || 'Cancel swap transaction on PRESS.one'
        }
    );
    return request;
};

const packStatement = (item) => {
    const map = {
        fee: true, type: true, from_user: true, to_user: true, token1: 'from',
        token2: 'to', req_id: true, trx_id: true, pool_token: true,
        timestamp: 'trx_timestamp',
    };
    const toDel = [
        'transactions_trx_transaction_actions_data_type',
        'transactions_trx_transaction_actions_data__from_user',
        'transactions_trx_transaction_actions_data__to_user',
        'transactions_trx_transaction_actions_data__amount_quantity__amt',
        'transactions_trx_transaction_actions_data__amount_quantity__cur',
        'transactions_trx_transaction_actions_data_mixin_trace_id',
    ];
    try {
        const memo = item.transactions_trx_transaction_actions_data_data.memo;
        for (let i in map) {
            item[utilitas.isString(map[i]) ? map[i] : i] = memo[i];
        }
        toDel.map(x => { delete item[x]; });
    } catch (err) { };
    return item;
};

const queryStatement = async (acc, timestamp, count, options) => {
    options = options || {};
    options.force = true;
    options.packFunc = packStatement;
    return await statement.query(acc, timestamp, 'SWAP', count, null, options);
};

module.exports = {
    addLiquid,
    cancelSwap,
    getPaymentRequest,
    queryStatement,
    rmLiquid,
    swapToken,
};
