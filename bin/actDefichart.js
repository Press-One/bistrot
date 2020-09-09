'use strict';

const { defi } = require('../index');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

const logItem = ['time', 'currency', 'base', 'price'];
const lpTime = (time) => { return time > 9 ? String(time) : `0${time}`; };

let [screen, grid, pricesLine, historyLog, currentMarkdown, resp] = [];

const init = (currency) => {
    screen = blessed.screen();
    grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
    pricesLine = grid.set(0, 0, 10, 12, contrib.line, {
        label: `${currency.toUpperCase()}-USDT`,
        style: { line: 'yellow', text: 'green', baseline: 'black' },
        xLabelPadding: 3,
        wholeNumbersOnly: false,
        xPadding: 5,
    });
    historyLog = grid.set(10, 0, 2, 8, contrib.log, {
        label: 'Price History',
        fg: 'green',
        scrollOnInput: true,
        baseLimit: 10,
    });
    currentMarkdown = grid.set(10, 8, 2, 4, contrib.markdown, {
        label: 'Current Price',
        // fg: 'yellow',
    });
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });
    screen.on('resize', function(e) {
        pricesLine.emit('attach');
        historyLog.emit('attach');
        currentMarkdown.emit('attach');
        renderAll();
    });
};

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
        arrLog.push(`\`${k}\`: ${item[k]}`);
    });
    currentMarkdown.setMarkdown(arrLog.join('\n'));
    currentMarkdown.screen.render();
};

const renderAll = () => {
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

const func = async (argv) => {
    argv.currency = argv.currency || 'BTC';
    argv.period = argv.period || '24h';
    argv.interval = argv.interval || null;
    if (argv.json) {
        return await defi.queryPricesHistory(argv.currency, argv.period);
    }
    init(argv.currency);
    await defi.pricesHistoryDaemon(
        argv.currency, argv.period, argv.interval, (err, res) => {
            if (err) { return logError(err); }
            resp = res;
            renderAll();
        }, { silent: true }
    );
};

module.exports = {
    func,
    name: 'Show Price Chart on DeFi (beta)',
    help: [
        '    --currency Cryptocurrency type               [STRING  / OPTIONAL]',
        '    --period   Price period                      [STRING  / OPTIONAL]',
        '    --interval Update interval in seconds        [INTEGER / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Currency available: `BTC`(default), `ETH`, `EOS`, `PRS`.   |',
        '    | 2. Period available: `24h`(default), `1w`, `1m`, `1y`, `max`. |',
        '    | 3. Please use option `--json` to get raw price history.       |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm defichart --currency=BTC --period=24h',
    ],
};
