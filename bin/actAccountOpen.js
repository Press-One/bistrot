'use strict';

const { atm } = require('..');

const func = async (argv) => {
    const resp = await atm.openAccount(argv.account, argv.pubkey);
    if (!argv.json && resp && resp.paymentUrl) {
        console.log(`\nOpen this URL in your browser:\n\n${resp.paymentUrl}\n`);
    }
    return resp;
};

module.exports = {
    pubkey: true,
    func,
    name: 'Open an Account',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. After successful execution, you will get a URL.            |',
        '    | 2. Open this URL in your browser.                             |',
        '    | 3. Scan the QR code with Mixin to complete the payment.       |',
        '    | 4. You will receive further notifications via Mixin.          |',
        '    | 5. It will cost 4 PRS (2 for RAM, 1 for NET, 1 for CPU).      |',
        '    | 6. Registration fee is NON-REFUNDABLE, EVEN IF IT FAILS.      |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Standard Account Naming Conventions -------------------------┐',
        '    | ■ Must be 2-13 characters                                     |',
        '    | ■ First 12 characters can be `a-z` (lowercase) or `1-5` or `.`|',
        '    | ■ The 13th character can only be `a-j` or `1-5`               |',
        '    | ? https://github.com/EOSIO/eos/issues/955                     |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
