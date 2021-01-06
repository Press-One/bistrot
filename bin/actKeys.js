'use strict';

const { account } = require('..');

const func = async (argv) => {
    return await account.getKeys(argv.account);
};

module.exports = {
    func,
    name: 'Check Account Keys',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
    ],
    example: {
        args: {
            account: true,
        },
    },
    render: {
        table: {
            KeyValue: true,
            columns: ['permission', 'key', 'weight'],
        },
    },
};
