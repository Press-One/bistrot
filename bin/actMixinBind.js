'use strict';

const { atm, account } = require('..');

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
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
