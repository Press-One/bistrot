'use strict';

const { swap, sushitrain, mixin } = require('sushitrain');

// const getPool = () => {

//     '    cleos  --url http://51.255.133.170:8888 push action prs.swap swaptoken '[123456, "testuser1", "testuser1", "usdt.eos", "10.0000 USDT", 5, "mixin_tid", "mixni_aid", "memo"]' -p testuser1@active'
// };

const swapToken = async (
    privateKey, chainAccount, toAccount, mixinAccount, mixinId,
    email, currency, amount, toCurrency, slippage, memo, options
) => {
    options = options || {};
    options.chainAccountRequired = true;
    console.log({
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, memo, options
    });
    var {
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, trace, requestId, memo
    } = mixin.verifyPaymentArgs(
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, null, memo, options
    );
    toCurrency = utilitas.trim(toCurrency, { case: 'UP' });
    const toCurId = mixin.assetIds[toCurrency] && mixin.assetIds[toCurrency].id;
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
        `No pool is available to swap between ${argv.from} and ${argv.to}.`, 400
    );
    console.log(catchPool);
    console.log({
        chainAccount, mixinAccount, mixinId, email,
        currency, amount, trace, requestId, memo
    });

    // return await sushitrain.transact(
    //     chainAccount, privateKey, 'prs.swap', 'swaptoken',
    //     {
    //         123456,
    //         "testuser1",
    //         "testuser1",
    //         "usdt.eos",
    //         "10.0000 USDT",
    //         5,
    //         "mixin_tid",
    //         "mixni_aid",
    //         "memo"


    //             "name": "req_id",
    //         "type": "uint64"

    //             "name": "from_user",
    //         "type": "name"

    //             "name": "to_user",
    //         "type": "name"

    //             "name": "pool_name",
    //         "type": "name"

    //             "name": "amount",
    //         "type": "asset"

    //             "name": "slippage",
    //         "type": "uint8"

    //             "name": "mixin_trace_id",
    //         "type": "string"

    //             "name": "mixin_account_id",
    //         "type": "string"

    //             "name": "memo",
    //         "type": "string"
    //     }, {




    // }, options
    // );
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
