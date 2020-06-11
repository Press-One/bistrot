'use strict';

const { } = require('../index');

const func = async (argv) => {
    const resp = await account.openAccount(argv.account, argv.pubkey);
    if (!global.chainConfig.json
        && resp && resp.paymentUrl) {
        console.log(`\nOpen this URL in your browser:\n\n${resp.paymentUrl}\n`);
    }
    return resp;
};

module.exports = {
    pubkey: true,
    func,
    name: 'Open an Account',
    help: [
        "    --action   Set as 'openaccount'              [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pubkey` must be provided.       |',
        '    | 2. After successful execution, you will get a URL.            |',
        '    | 3. Open this URL in your browser.                             |',
        '    | 4. Scan the QR code with Mixin to complete the payment.       |',
        '    | 5. You will receive further notifications via Mixin.          |',
        '    | 6. It will cost 4 PRS (2 for RAM, 1 for NET, 1 for CPU).      |',
        '    | 7. Registration fee is NON-REFUNDABLE, EVEN IF IT FAILS.      |',
        '    └---------------------------------------------------------------┘',
        '    ┌- Standard Account Naming Conventions -------------------------┐',
        '    | ■ Can only contain the characters                             |',
        '    |   `.abcdefghijklmnopqrstuvwxyz12345`.                         |',
        '    |   `a-z` (lowercase), `1-5` and `.` (period)                   |',
        '    | ■ Must start with a letter                                    |',
        '    | ■ Must be 12 characters                                       |',
        '    | ? https://eosio-cpp.readme.io/v1.1.0/docs/naming-conventions  |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=openaccount \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
    ],
};
