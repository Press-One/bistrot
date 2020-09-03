'use strict';

const columns = ['currency', 'base', 'price', 'accuracy', 'prices', 'time'];
const log = (content) => { silent || utilitas.modLog(content, __filename); };

let pricesCallback = null;
let silent = false;

const sqlExtract = (groupBy, gbField, exField, interval) => {
    return groupBy.includes(gbField) ? (
        `, (extract(${(exField || gbField).toUpperCase()} from time)`
        + (interval ? (`::int / ${parseInt(interval)}`) : '')
        + `) as ${gbField.toLowerCase()}`
    ) : '';
};

const queryPrices = async (
    currency, base, extract, interval, groupBy, fromTime, toTime, options = {}
) => {
    base = base || 'USDT';
    groupBy = groupBy || [];
    const sql = 'SELECT'
        + ' max(id) as id'
        + ', max(currency) as currency'
        + ', max(base) as base'
        + ', avg(price:: numeric) as price'
        + ', max(time) as time'
        + sqlExtract(groupBy, 'year')
        + sqlExtract(groupBy, 'month')
        + sqlExtract(groupBy, 'day')
        + sqlExtract(groupBy, 'hour')
        + sqlExtract(groupBy, 'slot', extract, interval)
        + ' FROM defiprices'
        + ' where currency = $1'
        + ' AND base = $2'
        + ' AND time >= $3'
        + ' AND time <= $4'
        + ` GROUP BY ${groupBy.join(', ')} ORDER BY time`;
    const val = [currency, base, fromTime, toTime];
    const resp = await database.query(sql, val);
    utilitas.assert(resp && resp.rows, 'Error querying defi prices.', 500);
    return resp.rows;
};

const getTimePeriod = (day) => {
    return [
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 1), new Date()
    ];
};

const queryPricesQuick = async (currency, extract, interval, groupBy, days) => {
    const timePeriod = getTimePeriod(days);
    return await queryPrices(
        currency, null, extract, interval, groupBy, timePeriod[0], timePeriod[1]
    );
};

// group by 5 mins, 288 results
const queryPricesLast24h = async (currency) => {
    return await queryPricesQuick(
        currency, 'minute', 5, ['year', 'month', 'day', 'slot'], 1
    );
};

// group by 30 mins, 336 results
const queryPricesLast1w = async (currency) => {
    return await queryPricesQuick(
        currency, 'minute', 30, ['year', 'month', 'day', 'hour', 'slot'], 7
    );
};

// group by 2 hrs, 360 results
const queryPricesLast1m = async (currency) => {
    return await queryPricesQuick(
        currency, 'hour', 2, ['year', 'month', 'day', 'slot'], 30
    );
};

// group by 1day > 365 results
const queryPricesLast1y = async (currency) => {
    return await queryPricesQuick(
        currency, null, null, ['year', 'month', 'day'], 365
    );
};

// group by 3day > 365 results for 3 years
const queryPricesLastMax = async (currency) => {
    return await queryPricesQuick(
        currency, 'day', 3, ['year', 'month', 'slot'], 365 * 3
    );
};

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

const archivePrices = async (prices) => {
    const [sql, result] = [
        `INSERT INTO defiprices (${columns.join(', ')}) VALUES (${columns.map(
            (_, x) => { return `\$${x + 1}`; }
        ).join(', ')})`, []
    ];
    for (let i in prices) {
        try {
            const val = [];
            prices[i].prices = JSON.stringify(prices[i].prices);
            columns.map(x => { val.push(prices[i][x]); });
            result.push(await database.query(sql, val));
            delete prices[i].id;
            delete prices[i].prices;
            log(JSON.stringify(prices[i]));
        } catch (err) { console.log(err); }
    }
    return result;
};

const processPrices = async () => {
    const prices = await checkPrice();
    pricesCallback && await pricesCallback(prices);
    config.serviceDefiPricesArchive && await archivePrices(prices);
};

const init = async (prsCallback, options = {}) => {
    pricesCallback = prsCallback;
    silent = !!options.silent;
    if (config.serviceDefiPricesWatcher) {
        return await (options && options.event || event).loop(
            processPrices, 60, 50, 3, null, options
        );
    }
};

module.exports = {
    checkPrice,
    init,
    queryPricesLast1m,
    queryPricesLast1w,
    queryPricesLast1y,
    queryPricesLast24h,
    queryPricesLastMax,
};

const { utilitas, event } = require('utilitas');
const database = require('./database');
const config = require('./config');
const table = require('./table');
