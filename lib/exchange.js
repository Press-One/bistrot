'use strict';

const { account, swap, sushitrain, mixin, utilitas, math }
    = require('sushitrain');

const defaultSlippage = 5;
// const getPool = () => {

//     '    cleos  --url http://51.255.133.170:8888 push action prs.swap swaptoken '[123456, "testuser1", "testuser1", "usdt.eos", "10.0000 USDT", 5, "mixin_tid", "mixni_aid", "memo"]' -p testuser1@active'
// };

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
    const [deal, pool] = [[currency, to_currency], await swap.getPool()];
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
            req_id: requestId,
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

module.exports = {
    swapToken,
};





/**
 *
 *
 *
 *
 *[
{
    "name": "req_id",
    "type": "uint64"
},{
    "name": "from_user",
    "type": "name"
},{
    "name": "to_user",
    "type": "name"
},{
    "name": "pool_name",
    "type": "name"
},{
    "name": "amount",
    "type": "asset"
},{
    "name": "slippage",
    "type": "uint8"
},{
    "name": "mixin_trace_id",
    "type": "string"
},{
    "name": "mixin_account_id",
    "type": "string"
},{
    "name": "memo",
    "type": "string"
}
]

 *
 *
 *
 *
 *
 *
 */
