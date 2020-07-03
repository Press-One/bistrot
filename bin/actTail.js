'use strict';

global.chainConfig.serviceStateHistoryPlugin = true;

const { sushitrain, pacman } = require('sushitrain');
const { utilitas } = require('utilitas');

const rawRender = (content, argv) => {
    if (!Object.keys(content).length) { return; };
    console.log((
        argv.json ? utilitas.prettyJson(content) : JSON.stringify(content)
    ) + '\n');
};

const func = async (argv) => {
    if (!(argv.blocknum = parseInt(argv.blocknum))) {
        const chainInfo = await sushitrain.getInfo();
        utilitas.assert(chainInfo && chainInfo.last_irreversible_block_num,
            'Error connecting to chain API.', 500);
        argv.blocknum = chainInfo.last_irreversible_block_num;
    }
    const render = (content) => { return rawRender(content, argv); };
    const [blkCallback, trxCallback] = argv.trxonly ? [null, render] : [render];
    await pacman.init(() => {
        return argv.blocknum;
    }, blkCallback, trxCallback, { silent: !argv.detail });
};

module.exports = {
    func,
    name: 'Display the last block / transaction of the chain',
    help: [
        '    --blocknum Initial block num                 [NUMBER  / OPTIONAL]',
        '    --trxonly  Follow transaction instead        [WITH  OR  WITHOUT ]',
        '    --detail   Show socket channel status        [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Follow the latest block / trx while `blocknum` is missing. |',
        '    | 2. Follow trxes instead of blocks while `trxonly` is set.     |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm tail --blocknum=1000000 --trxonly --json',
    ],
};
