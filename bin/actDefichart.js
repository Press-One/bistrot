'use strict';

const { defi } = require('../index');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

const logItem = ['time', 'currency', 'base', 'price'];
const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
const lpTime = (time) => { return time > 9 ? String(time) : `0${time}`; };

const pricesLine = grid.set(0, 0, 10, 12, contrib.line, {
    label: 'BTC-USDT',
    style: { line: 'yellow', text: 'green', baseline: 'black' },
    xLabelPadding: 3,
    wholeNumbersOnly: false,
    xPadding: 5,
});

const historyLog = grid.set(10, 0, 2, 8, contrib.log, {
    label: 'Price History',
    fg: 'green',
    scrollOnInput: true,
    baseLimit: 10,
});

const currentMarkdown = grid.set(10, 8, 2, 4, contrib.markdown, {
    label: 'Current Price',
    fg: 'yellow',
});

const localTime = (time) => {
    return new Date(time).toString().replace(/\ \(.*\)$/, '');
};

const axisTime = (time) => {
    const objTime = new Date(time);
    return lpTime(objTime.getMonth() + 1)
        + '-' + lpTime(objTime.getDate())
        + 'T' + lpTime(objTime.getHours())
        + ':' + lpTime(objTime.getMinutes());
};

const renderPricesLine = (resp) => {
    const [data, maxY, minY] = processData(resp);
    pricesLine.options.maxY = maxY;
    pricesLine.options.minY = minY;
    pricesLine.setData(data);
    pricesLine.screen.render();
};

const logError = (error) => {
    historyLog.log(error.message || error);
    historyLog.screen.render();
};

const renderHistoryLog = (resp) => {
    resp.map(item => {
        const arrLog = [];
        logItem.map(k => {
            if (k === 'time') { item[k] = localTime(item[k]); }
            arrLog.push(`${k}: ${item[k]}`);
        });
        historyLog.log(arrLog.join(', '));
    });
    historyLog.screen.render();
};

const renderCurrentMarkdown = (resp) => {
    const [item, arrLog] = [resp[resp.length - 1], []];
    logItem.map(k => {
        if (k === 'time') { item[k] = localTime(item[k]); }
        arrLog.push(`${k}: ${item[k]}`);
    });
    currentMarkdown.setMarkdown(arrLog.join('\n'));
    currentMarkdown.screen.render();
};

const renderAll = (resp) => {
    renderPricesLine(resp);
    renderHistoryLog(resp);
    renderCurrentMarkdown(resp);
};

const getMaxMin = (data) => {
    let [max, min] = [Math.max.apply(null, data), Math.min.apply(null, data)];
    const len = max - min;
    const spc = len / 3;
    max = Math.round(max + spc);
    min = Math.round(min - spc);
    min = min > 0 ? min : 0;
    return [max, min];
};

const processData = (resp) => {
    let [data, maxY, minY] = [{ x: [], y: [] }, null, null];
    resp.map(item => {
        data.x.push(axisTime(item.time)); data.y.push(Number(item.price));
    });
    [maxY, minY] = getMaxMin(data.y);
    return [data, maxY, minY];
};

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

const func = async (argv) => {
    await defi.pricesHistoryDaemon('btc', '24h', (err, resp) => {
        if (err) { return logError(err); }
        renderAll(resp);
    }, { silent: true });
};

module.exports = {
    func,
    name: 'Check Coin Prices on DeFi (beta)',
    help: [
        // '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        // '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        // '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        // '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        // '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        // '    ┌---------------------------------------------------------------┐',
        // '    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |',
        // '    └---------------------------------------------------------------┘',
        // '',
        // '    > Example:',
        // '    $ prs-atm defiprice --account=ABCDE --keystore=keystore.json',
    ],
    render: {},
};
