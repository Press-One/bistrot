'use strict';

const { account, swap, sushitrain, mixin, utilitas, math, uuid }
    = require('sushitrain');

const defaultSlippage = 5;
const mergeKeys = {
    from_user: true, to_user: true, type: 'transaction_type',
    status: 'transaction_status', pool_name: true, from_token: true,
    to_token: true, slippage: true, oracle_info: true, oracle_trx_id: true,
    oracle_timestamp: true,
};
const multiply = (a, b) => { return swap.formatNumber(math.multiply(a, b)); };
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
    slippage = ~~slippage || defaultSlippage;
    to_currency = utilitas.trim(to_currency, { case: 'UP' });
    const toCid = mixin.assetIds[to_currency] && mixin.assetIds[to_currency].id;
    const mixin_account_id = email ? { email } : {};
    utilitas.assert(0 < slippage && slippage < 100, 'Invalid slippage.', 400);
    utilitas.assert(toCid, 'Invalid target currency.', 400);
    const [deal, pool] = [[currency, to_currency], await swap.getAllPools()];
    utilitas.assert(pool && pool.length, 'No swap-pool is available.', 500);
    let catchPool;
    for (let x of pool) {
        if (utilitas.arrayEqual(deal, x.tokens.map(y => { return y.symbol }))) {
            catchPool = x;
            break;
        }
    };
    utilitas.assert(
        catchPool,
        `No pool is available to swap between ${currency} and ${to_currency}.`,
        400
    );
    const rate = catchPool.rates[`${currency}-${to_currency}`];
    const swap_fee = multiply(catchPool.swap_fee, amount);
    const result = {
        chainAccount, receiver: chainAccount,
        pool: catchPool.pool_name, currency, to_currency, rate, swap_fee,
        swap_fee_rate: formatPercentage(catchPool.swap_fee),
        slippage: formatPercentage(math.divide(slippage, 100)),
        amount: swap.formatNumber(math.bignumber(amount)),
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
                slippage, mixin_trace_id: '',
                mixin_account_id: JSON.stringify(mixin_account_id),
                memo
            }
        );
    }
    return result;
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

module.exports = {
    cancelSwap,
    getPaymentRequest,
    swapToken,
};
