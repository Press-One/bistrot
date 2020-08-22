'use strict';

const { utilitas } = require('utilitas');
const helper = require('./helper');
const fetch = require('node-fetch');

const coinMap = {
    XBT: 'BTC',
};

const normalizeCoinType = (coin) => {
    coin = (coin || '').toUpperCase();
    return coinMap[coin] || coin;
};

const fetchPriceFromCoinbase = async (coins, base = 'USD', options = {}) => {
    utilitas.assert(base, 'Invalid coin base.', 400);
    coins = coins ? (Array.isArray(coins) ? coins : [coins]) : [];
    base = base.toUpperCase();
    const [batch, url, result] = [
        coins ? Array.isArray(coins) : true,
        helper.assembleApiUrl(
            'https://api.coinbase.com', 'v2/assets/prices', { base }
        ), {}
    ];
    const resp = await fetch(url).then(res => res.json());
    utilitas.assert(resp && resp.data, 'Error querying Coinbase api.', 500);
    for (let item of resp.data) {
        item.base = normalizeCoinType[item.base];
        if (coins.length && !coins.includes(item.base)) { continue; }
        result[item.base] = {
            coin: item.base,
            base: item.currency,
            price: item.prices.latest_price.amount.amount,
            time: new Date(item.prices.latest_price.timestamp),
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

const fetchPriceFromKraken = async (coins, base = 'USD', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    const [batch, pms, result] = [Array.isArray(coins), [], {}];
    coins = batch ? coins : [coins];
    base = base.toUpperCase();
    for (let item of coins) {
        const url = helper.assembleApiUrl(
            'https://api.kraken.com', '/0/public/Ticker',
            { pair: `${item}${base}` }
        );
        pms.push(fetch(url).then(res => res.json()));
    }
    const resp = await Promise.all(pms);
    for (let item of resp) {
        if (item.error && item.error.length && item.result) { continue; }
        for (let i in item.result) {
            const key = normalizeCoinType(i.replace(/X(.*)Z(.*)/, '$1'));
            result[key] = {
                coin: key,
                base: base,
                price: item.result[i].c[0],
                time: new Date(),
            };
        }
    }
    return batch ? result : (result[coins[0]] || null);;
};

(async () => {
    try {
        // console.log(await fetchPriceFromCoinbase(['ETH']));
        console.log(await fetchPriceFromKraken(['ETH', 'BTC']));

    } catch (err) {
        console.log(err);
    }
})();


/**
2. Kraken
websocket: https://docs.kraken.com/websockets
rest: https://www.kraken.com/features/api
curl https://api.kraken.com/0/public/Ticker?pair=ETHUSD
curl https://api.kraken.com/0/public/Ticker?pair=XBTUSD
curl https://api.kraken.com/0/public/Ticker?pair=EOSUSD
curl https://api.kraken.com/0/public/Ticker?pair=USDTUSD

3. poloniex * 币币交易所，无USD价格，只有USDT *
https://docs.poloniex.com/#public-http-api-methods
curl "https://poloniex.com/public?command=returnTicker"

4. binance * 币币交易所，无USD价格，只有USDT *
https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#current-average-price
curl https://api.binance.com/api/v3/ticker/price

5. bitfinex
https://docs.bitfinex.com/reference#rest-public-tickers
curl "https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD,tETHUSD,tEOSUSD"

6. bigone * 币币交易所，无USD价格，只有USDT *
https://open.big.one/docs/spot_tickers.html
curl https://big.one/api/v3/asset_pairs/tickers?pair_names=BTC-USDT,ETH-USDT,PRS-USDT
*/











/**
1. Coinbase
https://developers.coinbase.com/api/v2
curl "https://api.coinbase.com/v2/prices/ETH-USD/spot"
curl "https://api.coinbase.com/v2/assets/prices?base=USD"

2. Kraken
websocket: https://docs.kraken.com/websockets
rest: https://www.kraken.com/features/api
curl https://api.kraken.com/0/public/Ticker?pair=ETHUSD
curl https://api.kraken.com/0/public/Ticker?pair=XBTUSD
curl https://api.kraken.com/0/public/Ticker?pair=EOSUSD
curl https://api.kraken.com/0/public/Ticker?pair=USDTUSD

3. poloniex * 币币交易所，无USD价格，只有USDT *
https://docs.poloniex.com/#public-http-api-methods
curl "https://poloniex.com/public?command=returnTicker"

4. binance * 币币交易所，无USD价格，只有USDT *
https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#current-average-price
curl https://api.binance.com/api/v3/ticker/price

5. bitfinex
https://docs.bitfinex.com/reference#rest-public-tickers
curl "https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD,tETHUSD,tEOSUSD"

6. bigone * 币币交易所，无USD价格，只有USDT *
https://open.big.one/docs/spot_tickers.html
curl https://big.one/api/v3/asset_pairs/tickers?pair_names=BTC-USDT,ETH-USDT,PRS-USDT
*/
