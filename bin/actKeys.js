'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    const resp = await account.getByName(argv.name);
    const result = [];
    for (let i of resp && resp.permissions ? resp.permissions : []) {
        for (let j of i.required_auth.keys || []) {
            if (j.key) {
                j.permission = i.perm_name;
                result.push(j);
            }
        }
    }
    return result;
};

module.exports = {
    func,
    name: 'Check Account Keys',
    help: [
        '    --name     PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm keys --name=ABCDE',
    ],
    render: {
        table: {
            KeyValue: true,
            columns: ['permission', 'key', 'weight'],
        },
    },
};
