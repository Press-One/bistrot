'use strict';

const { finance, atm, system } = require('..');

const func = async (argv) => {
    const resp = await atm.deposit(
        argv.pvtkey, argv.account, argv.email, argv.amount, argv.memo
    );
    if (!argv.json && resp && resp.paymentUrl) {
        console.log(`\nOpen this URL in your browser:\n\n${system.magicPayment(
            resp.paymentUrl, { cnb: true }
        )}\n`);
    }
    return resp;
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Deposit',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [NUMBER  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. After successful execution, you will get a URL.            |',
        '    | 2. Open this URL in your browser.                             |',
        '    | 3. Scan the QR code with Mixin to complete the payment.       |',
        '    | 4. You have to complete the payment within `'
        + `${finance.transferTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 5. SCANNING AN EXPIRED QR CODE WILL RESULT IN LOST MONEY.     |',
        '    | 6. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 7. Finish, `AssetCancel` or timeout a trx before request.     |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            amount: true,
            keystore: true,
            email: true,
        },
    },
};
