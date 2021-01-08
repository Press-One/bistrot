'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.getAccount(argv.name);
};

module.exports = {
    func,
    name: 'Check an Account',
    help: [
        '    --name     PRESS.one account                 [STRING  / REQUIRED]',
    ],
    example: {
        args: {
            name: true,
        }
    },
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 24 }, 1: { width: 49 } } },
        },
    },
};
