'use strict';

const { utilitas, event } = require('utilitas');
const { sushitrain } = require('sushitrain');
const helper = require('./helper');
const fetch = require('node-fetch');

const submitInterval = 60;

let [account, publicKey, privateKey] = [null, null, null];

const log = (content) => { return utilitas.modLog(content, __filename); };

// Coinbase
// https://developers.coinbase.com/api/v2
// curl "https://api.coinbase.com/v2/prices/ETH-USD/spot"
// curl "https://api.coinbase.com/v2/assets/prices?base=USD"
const fetchPriceFromCoinbase = async (coins, base = 'USD', options = {}) => {
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, url, result] = [
        coins ? Array.isArray(coins) : true,
        helper.assembleApiUrl(
            'https://api.coinbase.com', 'v2/assets/prices', { base }
        ), {}
    ];
    coins = (coins ? (Array.isArray(coins) ? coins : [coins]) : [
    ]).map(x => x.toUpperCase());
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp && resp.data, 'Error querying Coinbase api.', 500);
    for (let item of resp.data) {
        if (coins.length && !coins.includes(item.base)) { continue; }
        result[item.base] = {
            currency: item.base,
            base: item.currency,
            price: item.prices.latest_price.amount.amount,
            time: new Date(item.prices.latest_price.timestamp),
            provider: 'COINBASE',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

// Kraken
// websocket: https://docs.kraken.com/websockets
// rest: https://www.kraken.com/features/api
// curl https://api.kraken.com/0/public/Ticker?pair=ETHUSD
// curl https://api.kraken.com/0/public/Ticker?pair=XBTUSD
// curl https://api.kraken.com/0/public/Ticker?pair=EOSUSD
// curl https://api.kraken.com/0/public/Ticker?pair=USDTUSD
const fetchPriceFromKraken = async (coins, base = 'USD', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, keys, pms, result] = [Array.isArray(coins), [], [], {}];
    coins = (batch ? coins : [coins]).map(x => x.toUpperCase());
    for (let item of coins) {
        keys.push(item);
        const url = helper.assembleApiUrl(
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
    return batch ? result : (result[coins[0]] || null);;
};

// Poloniex * 币币交易所，无USD价格，只有USDT *
// https://docs.poloniex.com/#public-http-api-methods
// curl "https://poloniex.com/public?command=returnTicker"
const fetchPriceFromPoloniex = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, url, result] = [
        coins ? Array.isArray(coins) : true,
        helper.assembleApiUrl(
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

// Binance * 币币交易所，无USD价格，只有USDT *
// https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#current-average-price
// curl https://api.binance.com/api/v3/ticker/price
const fetchPriceFromBinance = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, result, url] = [
        Array.isArray(coins), {},
        helper.assembleApiUrl('https://api.binance.com', 'api/v3/ticker/price'),
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

// Bitfinex
// https://docs.bitfinex.com/reference#rest-public-tickers
// curl "https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD,tETHUSD,tEOSUSD"
const fetchPriceFromBitfinex = async (coins, base = 'USD', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, result] = [Array.isArray(coins), {}];
    coins = (batch ? coins : [coins]).map(x => x.toUpperCase());
    const url = helper.assembleApiUrl(
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
            price: item[7],
            time: new Date(),
            provider: 'BITFINEX',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

// Bigone * 币币交易所，无USD价格，只有USDT *
// https://open.big.one/docs/spot_tickers.html
// curl https://big.one/api/v3/asset_pairs/tickers?pair_names=BTC-USDT,ETH-USDT,PRS-USDT
const fetchPriceFromBigone = async (coins, base = 'USDT', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    base = base.toUpperCase();
    const [batch, result] = [Array.isArray(coins), {}];
    coins = (batch ? coins : [coins]).map(x => x.toUpperCase());
    const url = helper.assembleApiUrl(
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
    Coinbase: [fetchPriceFromCoinbase, ['ETH', 'BTC', 'EOS', 'PRS', 'USDT']],
    Kraken: [fetchPriceFromKraken, ['ETH', 'BTC', 'EOS', 'PRS', 'USDT']],
    Poloniex: [fetchPriceFromPoloniex, ['ETH', 'BTC', 'EOS', 'PRS']],
    Binance: [fetchPriceFromBinance, ['ETH', 'BTC', 'EOS', 'PRS']],
    Bitfinex: [fetchPriceFromBitfinex, ['ETH', 'BTC', 'EOS', 'PRS', 'USDT']],
    Bigone: [fetchPriceFromBigone, ['ETH', 'BTC', 'EOS', 'PRS']],
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

const submitPrice = async (price, acc, pubKey, pvtKey, options = {}) => {
    utilitas.assert(publicKey, 'Invalid publicKey key.', 400);
    if (!price.currency
        || !price.base
        || !price.price
        || !price.time
        || !price.provider) {
        return log(`Invalid price object, skiped: ${price}`);
    }
    log(`Submit: ${JSON.stringify(price)}...`);
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
        log(`Success: ${result.transaction_id}`);
    } catch (err) {
        log(`Failed: ${err.message}`);
    }
};

const process = async () => {
    log(`=================== ${new Date().toISOString()} ===================`);
    log(`Fetching prices from ${Object.keys(brokerage).join(', ')}...`);
    const prices = await fetchPrice();
    for (let i in prices) {
        for (let j in prices[i]) {
            await submitPrice(prices[i][j], account, publicKey, privateKey);
        }
    }
    log('Done.');
};

const watch = async (acc, pubKey, pvtKey, options = {}) => {
    utilitas.assert((account = acc), 'Invalid account.', 400);
    utilitas.assert((publicKey = pubKey), 'Invalid public key.', 400);
    utilitas.assert((privateKey = pvtKey), 'Invalid private key.', 400);
    return await event.loop(process, submitInterval, 60 * 10, 1, null, {
        silent: !global.chainConfig.debug
    });
};

module.exports = {
    watch,
};
