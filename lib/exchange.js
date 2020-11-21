'use strict';

const { account, swap, sushitrain, mixin, utilitas } = require('sushitrain');

const defaultSlippage = 5;
// const getPool = () => {

//     '    cleos  --url http://51.255.133.170:8888 push action prs.swap swaptoken '[123456, "testuser1", "testuser1", "usdt.eos", "10.0000 USDT", 5, "mixin_tid", "mixni_aid", "memo"]' -p testuser1@active'
// };

const swapToken = async (
    privateKey, chainAccount, receiver, currency, amount, toCurrency,
    slippage, email, mixinAccount, mixinId, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    var {
        chainAccount: account, mixinAccount, mixinId, email,
        currency, amount, trace: mixin_tid, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, null, memo, options
    );
    receiver = receiver || account;
    slippage = ~~slippage || defaultSlippage;
    toCurrency = utilitas.trim(toCurrency, { case: 'UP' });
    const toCurId = mixin.assetIds[toCurrency] && mixin.assetIds[toCurrency].id;
    account.assertName(receiver, 'Invalid receiver account name.');
    utilitas.assert(0 < slippage && slippage < 100, 'Invalid slippage.', 400);
    utilitas.assert(toCurId, 'Invalid target currency.', 400);
    const [deal, pool] = [[currency, toCurrency], await swap.getPool()];
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
        `No pool is available to swap between ${currency} and ${toCurrency}.`,
        400
    );
    const swapFee = math.multiply(catchPool.swap_fee, amount)
    return {
        account,
        receiver,
        currency,
        toCurrency,
        pool: catchPool.pool_name,
        rate: catchPool.rates[`${currency}-${toCurrency}`],
        amount: amount,
        swapFeeRate: catchPool.swap_fee,

    };


    return await sushitrain.transact(
        from_user, privateKey, 'prs.swap', 'swaptoken',
        {
            req_id: requestId,
            from_user: account,
            to_user: receiver,
            pool_name: catchPool.pool_name,
            amount: `${amount} ${amount}`,
            slippage,
            mixin_tid,
            mixni_aid: '', // @todo: to be removed
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
