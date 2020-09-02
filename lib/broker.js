'use strict';

const { utilitas } = require('utilitas');
const table = require('./table');

const formatPrice = (price, accuracy) => {
    const arrPrice = String(price || '').split('');
    return (arrPrice.splice(0, arrPrice.length - accuracy).join('') || '0')
        + '.' + (arrPrice.splice(0 - accuracy).join('') || '0');
};

const formatTime = (chainTimestamp) => {
    return new Date(parseInt(chainTimestamp) / 1000);
};

const checkPrice = async () => {
    let resp = await table.getAll('prs.price', 'exchange');
    utilitas.assert(resp, 'Error fetching coin prices on DeFi.', 500);
    const result = {};
    for (let x of resp) {
        if (!x.token || !x.prices) { continue; }
        // tweak time (stage 1)
        let maxTime = 0;
        // tweak token
        x.token = x.token.toUpperCase().split('.');
        x.currency = x.token[0];
        x.base = x.token[1];
        delete x.token;
        // tweak price
        x.price = formatPrice(x.price, x.accuracy);
        // tweak prices
        for (let i in x.prices) {
            // tweak price
            x.prices[i].price = formatPrice(
                x.prices[i].price, x.prices[i].accuracy
            );
            // tweak accuracy
            x.accuracy = x.prices[i].accuracy > x.accuracy
                ? x.prices[i].accuracy : x.accuracy;
            // tweak time
            x.prices[i].time = formatTime(x.prices[i].chain_timestamp);
            maxTime = x.prices[i].time.getTime() > maxTime
                ? x.prices[i].time.getTime() : maxTime;
            // tweak user
            x.prices[i].submitter = x.prices[i].user;
            delete x.prices[i].user;
            // tweak trx_id
            x.prices[i].transaction_id = x.prices[i].trx_id;
            delete x.prices[i].trx_id;
        }
        // tweak time (stage 2)
        x.time = new Date(maxTime);
        // return
        result[`${x.currency}-${x.base}`] = x;
    };
    return result;
};

module.exports = {
    checkPrice,
};
