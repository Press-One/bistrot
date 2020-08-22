'use strict';

const { utilitas } = require('utilitas');
const helper = require('./helper');
const fetch = require('node-fetch');

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
        if (coins.length && !coins.includes(item.base)) { continue; }
        result[item.base] = {
            coin: item.base,
            base: item.currency,
            price: item.prices.latest_price.amount.amount,
            time: new Date(item.prices.latest_price.timestamp),
            provider: 'COINBASE',
        };
    }
    return batch ? result : (result[coins[0]] || null);
};

const fetchPriceFromKraken = async (coins, base = 'USD', options = {}) => {
    utilitas.assert(coins, 'Invalid coin types.', 400);
    utilitas.assert(base, 'Invalid coin base.', 400);
    const [batch, keys, pms, result] = [Array.isArray(coins), [], [], {}];
    coins = batch ? coins : [coins];
    base = base.toUpperCase();
    for (let item of coins) {
        keys.push((item = item.toUpperCase()));
        const url = helper.assembleApiUrl(
            'https://api.kraken.com', '/0/public/Ticker',
            { pair: `${item}${base}` }
        );
        pms.push(fetch(url).then(res => res.json()));
    }
    const resp = await Promise.all(pms);
    for (let i in resp) {
        if (resp[i].error && resp[i].error.length && resp[i].result) { continue; }
        for (let j in resp[i].result) {
            result[keys[i]] = {
                coin: keys[i],
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

(async () => {
    try {
        // console.log(await fetchPriceFromCoinbase(['ETH', 'BTC', 'EOS', 'PRS', 'USDT']));
        // console.log(await fetchPriceFromKraken(['ETH', 'BTC', 'EOS', 'PRS', 'USDT']));

    } catch (err) {
        console.log(err);
    }
})();


/**
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
