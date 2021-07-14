'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.getAccount(argv.name);
};

module.exports = {
    func,
    name: 'Check an Account',
    help: [
        '    --name     Quorum account                    [STRING  / REQUIRED]',
    ],
    example: {
        args: {
            name: true,
        }
    },
    render: { table: { KeyValue: true } },
};
