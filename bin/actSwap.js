'use strict';

const { exchange } = require('..');

const func = async (argv) => {
    const resp = await exchange.swapToken(
        argv.pvtkey, argv.account, null, // argv.receiver
        argv.from, argv.amount, argv.to, argv.slippage, argv.email,
        argv['mx-id'], argv['mx-num'], argv.memo, { dryrun: argv.dryrun }
    );
    return resp;
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
