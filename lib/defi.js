'use strict';

const interestedCoins = ['ETH', 'BTC', 'EOS', 'PRS'];
const mineInterval = 60;
const columns = ['currency', 'base', 'price', 'accuracy', 'prices', 'time'];
const log = (content) => { silent || utilitas.modLog(content, __filename); };

let [account, publicKey, privateKey] = [null, null, null];
let pricesCallback = null;
let silent = false;

const [map10to25, map25to10] = [{
    '0': 'b', '1': 'c', '2': 'd', '3': 'e', '4': 'f',
    '5': 'g', '6': 'h', '7': 'i', '8': 'j', '9': 'k',
    'a': 'l', 'b': 'm', 'c': 'n', 'd': 'o', 'e': 'p',
    'f': 'q', 'g': 'r', 'h': 's', 'i': 't', 'j': 'u',
    'k': 'v', 'l': 'w', 'm': 'x', 'n': 'y', 'o': 'z',
}, {}];

for (let i in map10to25) { map25to10[map10to25[i]] = i; }

const mapBase = (ipt, map) => {
    ipt = String(ipt).split('');
    map = map || {};
    for (let i in ipt) { ipt[i] = map[ipt[i]] || ipt[i]; }
    return ipt.join('');
};

const convertFrom10to25 = (ipt) => {
    return mapBase(utilitas.convertBase(ipt, 10, 25), map10to25);
};

const convertFrom25to10 = (ipt) => {
    return parseInt(utilitas.convertBase(mapBase(ipt, map25to10), 25, 10));
};

const encodeSymbol = (symbolOrId) => {
    const objTkn = mixin.getAssetByNameOrId(symbolOrId, { noChain: true });
    utilitas.assert(objTkn, `Invalid asset symbol or id: ${symbolOrId}.`, 400);
    let strEncoded = convertFrom10to25(objTkn.index);
    while (strEncoded.length < 3) {
        strEncoded = `${map10to25[0]}${strEncoded}`;
    }
    return strEncoded.toUpperCase();
};

const decodeSymbol = (code, options) => {
    options = options || {};
    code = String(code || '').toLowerCase();
    const errMsg = `Invalid symbol code: ${code || "''"}.`;
    utilitas.assert(code && code.length === 3, errMsg, 400);
    options.index = convertFrom25to10(code);
    const objTkn = mixin.getAssetByNameOrId(null, options);
    utilitas.assert(objTkn, errMsg, 400);
    return objTkn;
};

const encodeSymbolPair = (symbolOrIdA, symbolOrIdB) => {
    utilitas.assert(
        (symbolOrIdA = String(symbolOrIdA || '').toUpperCase())
        && (symbolOrIdB = String(symbolOrIdB || '').toUpperCase())
        && (symbolOrIdA !== symbolOrIdB), 'Invalid asset symbol or id.', 400
    );
    return `${encodeSymbol(symbolOrIdA)}A${encodeSymbol(symbolOrIdB)}`;
};

const decodeSymbolPair = (code, options) => {
    code = String(code || '').toUpperCase();
    const errMsg = `Invalid symbol code: ${code || "''"}.`;
    utilitas.assert(code && code.length === 7, errMsg, 400);
    const aCode = code.split('A');
    return [decodeSymbol(aCode[0], options), decodeSymbol(aCode[1], options)];
};

const standardize = (price, rate) => {
    const [pAcc, rAcc] = [
        String(price).split('.')[1].length, String(rate).split('.')[1].length
    ];
    return math.format(math.divide(
        math.bignumber(price), math.bignumber(rate)
    ), { notation: 'fixed', precision: Math.max(pAcc, rAcc) });
};

/*
Coinbase
https://developers.coinbase.com/api/v2
curl "https://api.coinbase.com/v2/prices/ETH-USD/spot"
curl "https://api.coinbase.com/v2/assets/prices?base=USD"
*/
const fetchPriceFromCoinbase = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, result, standar] = [
        coins ? Array.isArray(coins) : true, {}, 'USD'
    ];
    const url = utilitas.assembleApiUrl(
        'https://api.coinbase.com', 'v2/assets/prices', { base: standar }
    );
    coins = (coins ? (Array.isArray(coins) ? coins : [coins]) : [
    ]).map(x => x.toUpperCase());
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp && resp.data, 'Error querying Coinbase api.', 500);
    let rate = '';
    for (let item of resp.data) {
        if (item.base === base && item.currency === standar) {
            rate = item.prices.latest;
        }
    }
    for (let item of resp.data) {
        if (coins.length && !coins.includes(item.base)) { continue; }
        result[item.base] = {
            currency: item.base,
            base,
            price: standardize(item.prices.latest_price.amount.amount, rate),
            time: new Date(item.prices.latest_price.timestamp),
            provider: 'COINBASE',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

/*
Kraken
websocket: https://docs.kraken.com/websockets
rest: https://www.kraken.com/features/api
curl https://api.kraken.com/0/public/Ticker?pair=ETHUSD
curl https://api.kraken.com/0/public/Ticker?pair=XBTUSD
curl https://api.kraken.com/0/public/Ticker?pair=EOSUSD
curl https://api.kraken.com/0/public/Ticker?pair=USDTUSD
*/
const fetchPriceFromKraken = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, keys, pms, result] = [Array.isArray(coins), [], [], {}];
    coins = (batch ? coins : [coins]).map(x => x.toUpperCase());
    for (let item of coins) {
        keys.push(item);
        const url = utilitas.assembleApiUrl(
            'https://api.kraken.com', '/0/public/Ticker',
            { pair: `${item}${base}` }
        );
        pms.push(fetch(url).then(res => res.json()));
    }
    const resp = await Promise.all(pms);
    for (let i in resp) {
        if (resp[i].error && resp[i].error.length && resp[i].result) {
            continue;
        }
        for (let j in resp[i].result) {
            result[keys[i]] = {
                currency: keys[i],
                base: base,
                price: resp[i].result[j].c[0],
                time: new Date(),
                provider: 'KRAKEN',
            };
            break;
        }
    }
    if (coins.includes('EOS')) {
        const rateUrl = utilitas.assembleApiUrl(
            'https://api.kraken.com', '/0/public/Ticker', { pair: 'USDTUSD' }
        );
        const priceUrl = utilitas.assembleApiUrl(
            'https://api.kraken.com', '/0/public/Ticker', { pair: 'EOSUSD' }
        );
        const rsp = await Promise.all([
            fetch(rateUrl).then(res => res.json()),
            fetch(priceUrl).then(res => res.json())
        ]);
        if (rsp && rsp[0] && rsp[0].result && rsp[1] && rsp[1].result) {
            const price = standardize(
                rsp[1].result['EOSUSD'].c[0], rsp[0].result['USDTZUSD'].c[0]
            );
            result['EOS'] = {
                currency: 'EOS',
                base, price,
                time: new Date(),
                provider: 'KRAKEN',
            };
        }
    }
    return batch ? result : (result[coins[0]] || null);;
};

/*
Poloniex * 币币交易所，无USD价格，只有USDT *
https://docs.poloniex.com/#public-http-api-methods
curl "https://poloniex.com/public?command=returnTicker"
*/
const fetchPriceFromPoloniex = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, url, result] = [
        coins ? Array.isArray(coins) : true,
        utilitas.assembleApiUrl(
            'https://poloniex.com', 'public', { command: 'returnTicker' }
        ), {}
    ];
    coins = (coins ? (Array.isArray(coins) ? coins : [coins]) : [
    ]).map(x => x.toUpperCase());
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp, 'Error querying Poloniex api.', 500);
    for (let i in resp) {
        const key = i.replace(/^([^\\]*)_([^\\]*)$/, '$2');
        const bs = i.replace(/^([^\\]*)_([^\\]*)$/, '$1');
        if ((coins.length && !coins.includes(key)) || (bs !== base)) {
            continue;
        }
        result[key] = {
            currency: key,
            base,
            price: resp[i].last,
            time: new Date(),
            provider: 'POLONIEX',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

/*
Binance * 币币交易所，无USD价格，只有USDT *
https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#current-average-price
curl https://api.binance.com/api/v3/ticker/price
*/
const fetchPriceFromBinance = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, result, url] = [
        Array.isArray(coins), {}, utilitas.assembleApiUrl(
            'https://api.binance.com', 'api/v3/ticker/price'
        ),
    ];
    coins = (batch ? coins : [coins]).map(x => x.toUpperCase());
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp, 'Error querying Binance api.', 500);
    for (let item of resp) {
        let found = null;
        for (let c of coins) {
            if (item.symbol === `${c}${base}`) {
                found = c;
                break;
            }
        }
        if (!found) { continue; }
        result[found] = {
            currency: found,
            base,
            price: item.price,
            time: new Date(),
            provider: 'BINANCE',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

/*
Bitfinex
https://docs.bitfinex.com/reference#rest-public-tickers
curl "https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD,tETHUSD,tEOSUSD"
*/
const fetchPriceFromBitfinex = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, result] = [Array.isArray(coins), {}];
    coins = (batch ? coins : [coins]).map(x => x.toUpperCase());
    const url = utilitas.assembleApiUrl(
        'https://api-pub.bitfinex.com', 'v2/tickers',
        {
            symbols: coins.map(x => `t${x}${base}`).join(','),
        }
    );
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp, 'Error querying Bitfinex api.', 500);
    for (let item of resp) {
        let found = null;
        for (let c of coins) {
            if (item[0] === `t${c}${base}`) {
                found = c;
                break;
            }
        }
        if (!found) { continue; }
        result[found] = {
            currency: found,
            base,
            price: String(item[7]),
            time: new Date(),
            provider: 'BITFINEX',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

/*
Bigone * 币币交易所，无USD价格，只有USDT *
https://open.big.one/docs/spot_tickers.html
curl https://big.one/api/v3/asset_pairs/tickers?pair_names=BTC-USDT,ETH-USDT,PRS-USDT
*/
const fetchPriceFromBigone = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, result] = [Array.isArray(coins), {}];
    coins = (batch ? coins : [coins]).map(x => x.toUpperCase());
    const url = utilitas.assembleApiUrl(
        'https://big.one', '/api/v3/asset_pairs/tickers',
        {
            pair_names: coins.map(x => `${x}-${base}`).join(','),
        }
    );
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp && resp.data, 'Error querying Bigone api' + (
        resp && resp.message ? `: ${resp.message}` : ''
    ) + '.', 500);
    for (let item of resp.data) {
        let found = null;
        for (let c of coins) {
            if (item.asset_pair_name === `${c}-${base}`) {
                found = c;
                break;
            }
        }
        if (!found) { continue; }
        result[found] = {
            currency: found,
            base,
            price: item.close,
            time: new Date(),
            provider: 'BIGONE',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

const brokerage = {
    Coinbase: [fetchPriceFromCoinbase, interestedCoins],
    Kraken: [fetchPriceFromKraken, interestedCoins],
    Poloniex: [fetchPriceFromPoloniex, interestedCoins],
    Binance: [fetchPriceFromBinance, interestedCoins],
    Bitfinex: [fetchPriceFromBitfinex, interestedCoins],
    Bigone: [fetchPriceFromBigone, interestedCoins],
};

const fetchPrice = async () => {
    const [pms, result] = [[], {}];
    for (let i in brokerage) {
        pms.push(brokerage[i][0](brokerage[i][1]));
    }
    const resp = await Promise.all(pms);
    for (let i in resp) {
        for (let j in resp[i]) {
            result[resp[i][j].provider] = result[resp[i][j].provider] || [];
            result[resp[i][j].provider][j] = resp[i][j];
        }
    }
    return result;
};

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
    currency = String(currency || '').toUpperCase();
    base = String(base || 'USDT').toUpperCase();
    groupBy = groupBy || [];
    utilitas.assert(base === 'USDT', 'Unsupported coin base.', 400);
    utilitas.assert(
        interestedCoins.includes(currency), 'Unsupported currency.', 400
    );
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
    for (let i in resp.rows) {
        for (let j in resp.rows[i]) {
            if (!columns.includes(j)) { delete resp.rows[i][j]; }
        }
    }
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
        currency, 'minute', 5, ['year', 'month', 'day', 'hour', 'slot'], 1
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

const submitPrices = async (price, acc, pubKey, pvtKey, options = {}) => {
    utilitas.assert(publicKey, 'Invalid publicKey key.', 400);
    if (!price.currency
        || !price.base
        || !price.price
        || !price.time
        || !price.provider) {
        return log(`Mine: Invalid price object, skiped ${price}.`);
    }
    log(`Mine: Submit ${JSON.stringify(price)}...`);
    const accuracy = price.price.replace(/^([^\.]*)\.([^\.]*)$/, '$2').length;
    try {
        const result = await sushitrain.transact(
            acc, privateKey, 'prs.price', 'update',
            {
                user: acc,
                code: `${price.currency}/${price.base}`,
                price: price.price.replace('.', ''),
                accuracy,
                provider: price.provider,
                timestamp: price.time.getTime(),
                memo: '',
            }, options
        );
        log(`Mine: Success, ${result.transaction_id}.`);
    } catch (err) {
        log(`Mine: Failed, ${err.message}.`);
    }
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
            log(`Archive: ${JSON.stringify(prices[i])}.`);
        } catch (err) { console.log(err); }
    }
    return result;
};

const submitProcess = async () => {
    log(`Mine: Fetching prices from ${Object.keys(brokerage).join(', ')} @ `
        + `${new Date().toISOString()}...`);
    const prices = await fetchPrice();
    for (let i in prices) {
        for (let j in prices[i]) {
            await submitPrices(prices[i][j], account, publicKey, privateKey);
        }
    }
    log('Mine: Complete.');
};

const archiveProcess = async () => {
    const prices = await checkPrice();
    pricesCallback && await pricesCallback(prices);
    config().serviceDefiPricesArchive && await archivePrices(prices);
};

const initSubmit = async (acc, pubKey, pvtKey, options = {}) => {
    utilitas.assert((account = acc), 'Invalid account.', 400);
    utilitas.assert((publicKey = pubKey), 'Invalid public key.', 400);
    utilitas.assert((privateKey = pvtKey), 'Invalid private key.', 400);
    silent = !!options.silent;
    if (config().serviceDefiPricesSubmit) {
        return await (options && options.event || event).loop(
            submitProcess, mineInterval, mineInterval * 10, 1, null, options
        );
    }
};

const initArchive = async (prsCallback, options = {}) => {
    pricesCallback = prsCallback;
    silent = !!options.silent;
    if (config().serviceDefiPricesWatch) {
        return await (options && options.event || event).loop(
            archiveProcess, mineInterval, mineInterval - 10, 1, null, options
        );
    }
};

module.exports = {
    checkPrice,
    initArchive,
    initSubmit,
    queryPricesLast1m,
    queryPricesLast1w,
    queryPricesLast1y,
    queryPricesLast24h,
    queryPricesLastMax,
    // pending apis
    decodeSymbolPair,
    encodeSymbolPair,
};

const { utilitas, event, math } = require('utilitas');
const sushitrain = require('./sushitrain');
const database = require('./database');
const config = require('./config');
const fetch = require('node-fetch');
const mixin = require('./mixin');
const table = require('./table');
