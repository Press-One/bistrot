'use strict';

const { atm, exchange, utilitas } = require('..');

const func = async (argv) => {
    utilitas.prettyJson(
        await atm.getAllPaymentRequest(argv.account), { log: true }
    );
};

module.exports = {
    func,
    name: 'Check payment requests',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Including deposit requests and swap requests.              |',
        '    | 2. Support JSON output only.                                  |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
        }
    },
};
