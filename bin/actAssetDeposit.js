'use strict';

const { finance, atm } = require('..');

const func = async (argv) => {
    const resp = await atm.deposit(
        argv.pvtkey, argv.account, argv.email, argv.amount, argv.memo
    );
    if (!argv.json && resp && resp.paymentUrl) {
        console.log(`\nOpen this URL in your browser:\n\n${resp.paymentUrl}\n`);
    }
    return resp;
};

module.exports = {
    hide: true,
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
        '    ┌- Pay via QR code ---------------------------------------------┐',
        '    | 1. After successful execution, you will get a URL.            |',
        '    | 2. Open this URL in your browser.                             |',
        '    | 3. Scan the QR code with Mixin to complete the payment.       |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Pay via Message ---------------------------------------------┐',
        '    | 1. System will also send the URL to your bound Mixin-Account. |',
        '    | 2. Simply click on the URL in Mixin to complete the payment.  |',
        '    └---------------------------------------------------------------┘',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. You have to complete the payment within `'
        + `${finance.transferTimeout / 1000 / 60 / 60 / 24}\` days.          |`,
        '    | 2. PAYING AN EXPIRED TRANSACTION WILL RESULT IN LOST MONEY.   |',
        '    | 3. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 4. Finish, `AssetCancel` or timeout a trx before request.     |',
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
