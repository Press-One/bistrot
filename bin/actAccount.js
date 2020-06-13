'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    return await account.getByName(argv.name);
};

module.exports = {
    func,
    name: 'Check an Account',
    help: [
        '    --name     PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm account --name=ABCDE',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 24 }, 1: { width: 49 } } },
        },
    },
};
