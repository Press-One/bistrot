const transfer = async (from, privateKey, to, quantity, memo, options) => {
    quantity = parseAndFormat(quantity, chainCurrency);
    utilitas.assert(quantity, 'Invalid quantity.', 400);
    return await sushitrain.transact(
        from, privateKey, 'eosio.token', 'transfer',
        { from, to, quantity, memo: memo || defaultTransMemo }, options
    );
};

const sushitrain = require('./sushitrain');
