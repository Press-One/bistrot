'use strict';

const { account, finance } = require('sushitrain');
const { utilitas } = require('utilitas');

const func = async (argv) => {
    let r = [account.getBalance(argv.account), account.getByName(argv.account)];
    const [bResp, aResp] = await Promise.all(r);
    utilitas.assert(aResp, `Account not found: ${argv.account}`, 404);
    const [currency, now] = [Object.keys(bResp)[0], new Date()];
    const result = { 'balance': finance.bigFormat(bResp[currency], currency) };
    if (aResp.refund_request) {
        result.unstaking = finance.bigFormat(finance.bignumberSum(
            finance.parseAmountAndCurrency(aResp.refund_request.net_amount)[0],
            finance.parseAmountAndCurrency(aResp.refund_request.cpu_amount)[0],
        ), currency);
        const reqTime = new Date(`${aResp.refund_request.request_time}Z`);
        const avlIn = (reqTime.getTime(
        ) + 1000 * 60 * 60 * 24 * 3 - now.getTime()) / 1000 / 60 / 60;
        result.unstak_available_in = `${Math.round(avlIn * 100) / 100} HR `;
        result.unstak_request_time = reqTime.toUTCString();
        result.timestamp = now.toUTCString();
        if (avlIn < 0) {
            result.refund_available = true;
        }
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
