'use strict';

const { utilitas, event, defi } = require('sushitrain');
const helper = require('./helper');

const currencies = ['ETH', 'BTC', 'EOS', 'PRS'];
const periods = ['1m', '1w', '1y', '24h', 'max'];
const daemonInterval = 60;

let [daemonCallback, daemonCurrency, daemonPeriod] = [null, null, null];

const checkCurrency = (currency, period) => {
    currency = String(currency || '').toUpperCase();
    period = String(period || '').toLowerCase();
    utilitas.assert(currencies.includes(currency), 'Invalid currency.', 400);
    utilitas.assert(periods.includes(period), 'Invalid period.', 400);
    return [currency, period];
};

const queryPricesHistory = async (currency, period) => {
    [currency, period] = checkCurrency(currency, period);
    const url = await helper.assembleChainApiUrl(
        `defi/prices/${currency}/${period}`
    );
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp && resp.data, 'Error querying price data.', 500);
    return resp.data;
};

const pricesProcess = async () => {
    let [prices, error] = [null, null];
    try {
        prices = await queryPricesHistory(daemonCurrency, daemonPeriod);
    } catch (err) { error = err; }
    daemonCallback && daemonCallback(error, prices);
};

const pricesHistoryDaemon = async (
    currency, period, interval, pricesCallback, options = {}
) => {
    [daemonCurrency, daemonPeriod] = checkCurrency(currency, period);
    utilitas.assert(daemonCallback = pricesCallback, 'Callback required.', 400);
    return await event.loop(pricesProcess, interval
        || daemonInterval, daemonInterval, 0, null, options);
};

module.exports = Object.assign({
    queryPricesHistory,
    pricesHistoryDaemon,
}, defi);
