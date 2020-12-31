'use strict';

const { atm } = require('..');

const func = async (argv) => {
    const resp = await atm.bindIdentity(argv.account, argv.pvtkey);
    // debug mode {
    const { utilitas, mixin } = require('..');
    const debug = utilitas.insensitiveCompare(
        argv.rpcapi, 'http://51.255.133.170:8888'
    );
    if (debug) {
        const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
        const replace = {
            recipient: '14da6c0c-0cbf-483c-987a-c44477dcad1b',
            asset: mixin.assetIds.CNB.id,
        };
        for (let i in replace) {
            resp.paymentUrl = resp.paymentUrl.replace(new RegExp(
                `(^.*${i}=)${uuid}(&.*$)`
            ), `$1${replace[i]}$2`);
        }
    }
    // }
    if (!argv.json && resp && resp.paymentUrl) {
        console.log(`\nOpen this URL in your browser:\n\n${resp.paymentUrl}\n`);
    }
    return resp;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Open an Account',
    help: [
        '    --name     PRESS.one account                 [STRING  / REQUIRED]',
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
        '    $ prs-atm openaccount --name=ABCDE --keystore=keystore.json',
    ],
};
