'use strict';

const { atm, account } = require('..');

const func = async (argv) => {
    const resp = await atm.bindMixinIdentity(argv.account, argv.pvtkey);
    if (!argv.json && resp && resp.paymentUrl) {
        console.log(`\nOpen this URL in your browser:\n\n${resp.paymentUrl}\n`);
    }
    return resp;
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Bind a Mixin account to a PRESS.one account',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. After successful execution, you will get a URL.            |',
        '    | 2. Open this URL in your browser.                             |',
        '    | 3. Scan the QR code with Mixin to complete the payment.       |',
        '    | 4. You will receive further notifications via Mixin.          |',
        `    | 5. It will cost \`${account.bindingPrice} PRS\` `
        + 'for each binding.                |',
        '    | 6. Binding fee is NON-REFUNDABLE, EVEN IF IT FAILS.           |',
        '    | 7. You need to bind your MX account before withdraw and swap. |',
        '    | 8. New accounts reg via PRS-ATM v4 or later have been bound.  |',
        '    | 9. Rebind the accounts if you lost or changed your Mixin acc. |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
