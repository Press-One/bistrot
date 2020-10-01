'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    const resp = await account.getByName(argv.account);
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
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm keys --account=ABCDE',
    ],
    render: {
        table: {
            KeyValue: true,
            columns: ['permission', 'key', 'weight'],
        },
    },
};
