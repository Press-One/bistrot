'use strict';

const { pacman, utilitas } = require('..');

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
    argv.blocknum = utilitas.ensureInt(argv.blocknum, { min: 0 });
    const render = (content) => { return rawRender(content, argv); };
    const [newBlock, newTransaction] = argv.trxonly ? [null, render] : [render];
    await pacman.init({
        callbacks: {
            newBlock,
            newTransaction,
            initIdGet: argv.blocknum && (async () => { return argv.blocknum; }),
        },
        silent: !argv.detail,
    });
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
    ],
    example: [
        {
            args: {
                blocknum: true,
                trxonly: null,
                json: null,
            },
        },
        {
            args: {
                blocknum: true,
                trxonly: null,
                json: null,
                grep: 'PIP:2001',
            },
        },
    ],
};
