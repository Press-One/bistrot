'use strict';

const { sushitrain, pacman, utilitas } = require('..');

const rawRender = (content, argv) => {
    if (!Object.keys(content).length) { return; };
    const compactJson = JSON.stringify(content);
    if (argv.grep && !/^\/|\/$/.test(argv.grep)) {
        if (compactJson.toLowerCase().indexOf(argv.grep.toLowerCase()) === -1) {
            return;
        }
    } else if (argv.grep && /^\/|\/$/.test(argv.grep)) {
        const regExp = new RegExp(argv.grep.replace(/^\/|\/$/g, ''), 'i');
        if (!regExp.test(compactJson)) { return; }
    }
    console.log(
        (argv.json ? utilitas.prettyJson(content) : compactJson) + '\n'
    );
};

const func = async (argv) => {
    Object.assign(global.chainConfig, { serviceStateHistoryPlugin: true });
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
        '    --grep     Match keyword or RegExp           [STRING  / OPTIONAL]',
        '    --trxonly  Follow transaction instead        [WITH  OR  WITHOUT ]',
        '    --detail   Show socket channel status        [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Follow the latest block / trx while `blocknum` is missing. |',
        '    | 2. Follow trxes instead of blocks while `trxonly` is set.     |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm tail --blocknum=999999 --trxonly --json',
        '    $ prs-atm tail --blocknum=999999 --trxonly --json --grep=PIP:2001',
    ],
};
