'use strict';

const { exchange } = require('..');

const func = async (argv) => {
    return await exchange.cancelSwap(argv.pvtkey, argv.account, argv.memo);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Get swap pools',
    help: [
        'ARGS desc are coming...',
        '',
        '    > Example:',
        '    $ prs-atm pool',
    ],
};
