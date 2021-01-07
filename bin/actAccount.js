'use strict';

const { account, atm, utilitas } = require('..');

const func = async (argv) => {
    const [accResp, accBound] = await Promise.all([
        account.getByName(argv.name), atm.queryMixinBoundByAccount(argv.name)
    ]);
    utilitas.assert(accResp, `Account Not Found (${argv.name}).`, 404);
    return Object.assign(accResp, {
        bound_mixin_account: accBound && accBound.bound_account || null,
    });
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
