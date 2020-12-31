'use strict';

const { account, finance, utilitas, mixin } = require('..');

const func = async (argv) => {
    const resp = await account.getByName(argv.account);
    utilitas.assert(resp, `Account not found: ${argv.account}`, 404);
    const [result, now] = [await account.getBalance(argv.account), new Date()];
    for (let i in result) { result[i] = finance.bigFormat(result[i]); }
    if (resp.refund_request) {
        result[`unstaking_${mixin.defaultCurrency}`] = finance.bignumberSum(
            finance.parseAmountAndCurrency(resp.refund_request.net_amount)[0],
            finance.parseAmountAndCurrency(resp.refund_request.cpu_amount)[0],
        );
        const reqTime = new Date(`${resp.refund_request.request_time}Z`);
        const avlIn = (reqTime.getTime(
        ) + 1000 * 60 * 60 * 24 * 3 - now.getTime()) / 1000 / 60 / 60;
        result.unstak_available_in = `${Math.round(avlIn * 100) / 100} HR `;
        result.unstak_request_time = reqTime.toUTCString();
        result.timestamp = now.toUTCString();
        if (avlIn < 0) { result.refund_available = true; }
    }
    return result;
};

module.exports = {
    func,
    name: 'Check Balance',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '',
        '    > Example:',
        '    $ prs-atm balance --account=ABCDE',
    ],
    render: {
        table: {
            KeyValue: true,
            config: {
                columns: {
                    0: { width: 20 }, 1: { width: 53, alignment: 'right' },
                },
            },
        },
    },
};
