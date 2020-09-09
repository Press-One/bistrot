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






// function Cpu(line) {
//     this.line = line;
//     si.currentLoad(data => {
//         this.cpuData = data.cpus.map((cpu, i) => {
//             return {
//                 title: 'CPU' + (i + 1),
//                 style: {
//                     line: colors[i % colors.length],
//                 },
//                 x: Array(61)
//                     .fill()
//                     .map((_, i) => 60 - i),
//                 y: Array(61).fill(0),
//             };
//         });
//         this.updateData(data);
//         this.interval = setInterval(() => {
//             si.currentLoad(data => {
//                 this.updateData(data);
//             });
//         }, 1000);
//     });
// }

// Cpu.prototype.updateData = function(data) {
//     data.cpus.forEach((cpu, i) => {
//         var loadString = cpu.load.toFixed(1).toString();
//         while (loadString.length < 6) {
//             loadString = ' ' + loadString;
//         }
//         loadString = loadString + '%';

//         this.cpuData[i].title = 'CPU' + (i + 1) + loadString;
//         this.cpuData[i].y.shift();
//         this.cpuData[i].y.push(cpu.load);
//     });

//     this.line.setData(this.cpuData);
//     this.line.screen.render();
// };

// const maxY = Math.max(y);
// const minY = Math.min(y);
// const step = (maxY - minY) / 5;
// const z = [];
// z.push(minY - step);
// z.push(minY + step * 0);
// z.push(minY + step * 1);
// z.push(minY + step * 2);
// z.push(minY + step * 3);
// z.push(minY + step * 4);
// z.push(minY + step * 5);
// // console.log(Math.min.apply(null, y));
// // return;
// var blessed = require('blessed')
//     , contrib = require('blessed-contrib')
//     , screen = blessed.screen()
//     , line = contrib.line(
//         {
//             style:
//             {
//                 line: "yellow"
//                 , text: "green"
//                 , baseline: "black"
//             }
//             , xLabelPadding: 3
//             , wholeNumbersOnly: false
//             , xPadding: 5
//             , label: 'BTC'
//             // , minY: 3.3 // eos
//             // , minY: 9000 // btc
//             // , minY: 400 // eth
//             // , minY: 0.18 // prs
//         })
//     , data = {
//         x: x,
//         y: y
//     }
// screen.append(line) //must append before setting data
// line.setData(data)

// screen.key(['escape', 'q', 'C-c'], function(ch, key) {
//     return process.exit(0);
// });

// let { utilitas } = require('utilitas');
// screen.render()
// for (let i = 0; i < 100; i++) {
//     await utilitas.timeout(1000);
//     // console.log('xxx');
//     data.x.push(1);
//     data.y.push(1);
//     line.setData(data);
//     screen.render()
// }
