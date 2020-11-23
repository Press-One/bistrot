'use strict';

const { account, swap, sushitrain, mixin, utilitas, finance, math, uuid }
    = require('sushitrain');

const defaultSlippage = 5;

const multiply = (a, b) => {
    return swap.formatNumber(math.multiply(a, b));
};

const formatPercentage = (num) => {
    return `${math.multiply(num, 100)} %`;
}

const swapToken = async (
    privateKey, chainAccount, receiver, currency, amount, to_currency,
    slippage, email, mixinAccount, mixinId, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    var {
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, trace: mixin_trace_id, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, null, memo, options
    );
    receiver = receiver || chainAccount;
    slippage = ~~slippage || defaultSlippage;
    to_currency = utilitas.trim(to_currency, { case: 'UP' });
    const toCid = mixin.assetIds[to_currency] && mixin.assetIds[to_currency].id;
    account.assertName(receiver, 'Invalid receiver account name.');
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
    if (options.dryrun) {
        return {
            account: chainAccount,
            receiver,
            pool: catchPool.pool_name,
            currency,
            to_currency,
            rate,
            swap_fee_rate: formatPercentage(catchPool.swap_fee),
            slippage: formatPercentage(math.divide(slippage, 100)),
            amount: swap.formatNumber(math.bignumber(amount)),
            to_amount: multiply(math.subtract(amount, swap_fee), rate),
            swap_fee,
        };
    }
    return await sushitrain.transact(
        chainAccount, privateKey, 'prs.swap', 'swaptoken',
        {
            req_id: JSON.stringify([requestId, uuid.v1()]),
            from_user: chainAccount,
            to_user: receiver,
            pool_name: catchPool.pool_name,
            amount: `${amount} ${currency}`,
            slippage,
            mixin_trace_id,
            mixin_account_id: '', // @todo: to be removed
            memo
        }
    );
};

const getPaymentRequest = async (chainAccount) => {
    account.assertName(chainAccount);
    const trxs = await swap.getAllTrxs();
    console.log(trxs);
    const trans = await swap.getAllTrans();
    console.log(trans);
    return [];
    // const result = [];
    // trans.filter(x => {
    //     return utilitas.insensitiveCompare(x.user, chainAccount);
    // }).map(x => {
    //     const timestamp_received = new Date(x.timestamp_received * 1000);


    //     x.timestamp_received = timestamp_received.toISOString();
    //     x.payment_timeout = new Date(timestamp_received.getTime(
    //     ) + finance.transferTimeout).toISOString();
    //     for (let i = 0; i < 2; i++) {
    //         const plan = finance.parseAmountAndCurrency(x[`token${i + 1}`]);
    //         if (!plan[2]) { continue; }
    //         // debug {
    //         plan[1] = 'CNB';
    //         // }
    //         x.paymentUrls.push(mixin.createPaymentUrlToOfficialAccount(
    //             plan[0], x.mixin_trace_id[i], x.memo, { currency: plan[1] }
    //         ));
    //     }
    //     result.push(x);
    // });
    // return result;
};

module.exports = {
    swapToken,
    getPaymentRequest,
};
