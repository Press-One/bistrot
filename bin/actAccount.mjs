'use strict';

const { account } = require('..');

const func = async (argv) => {
    return await account.getByAddress(argv.address);
};

module.exports = {
    func,
    name: 'Check an Account',
    help: [
        '    --address  Quorum account address            [STRING  / REQUIRED]',
    ],
    example: {
        args: {
            address: true,
        }
    },
    render: { table: { KeyValue: true } },
};
