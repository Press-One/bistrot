'use strict';

const defi = require('../lib/defi.js');

const func = async (argv) => {
    let resp = await defi.checkPrice(argv.account, argv.pubkey, argv.pvtkey);
    if (!argv.json) {
        let maxAccuracy = 0;
        for (let i in resp) {
            resp[i].time = resp[i].time.toISOString();
            maxAccuracy = resp[i].accuracy > maxAccuracy
                ? resp[i].accuracy : maxAccuracy;
        }
        for (let i in resp) {
            while (resp[i].accuracy < maxAccuracy) {
                resp[i].price += '0';
                resp[i].accuracy++;
            }
        }
    }
    return resp;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Check Coin Prices on DeFi (beta)',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm deficheck --account=ABCDE --keystore=keystore.json',
    ],
    render: {
        table: {
            columns: [
                'currency',
                'base',
                'price',
                'provider',
                'submitter',
                'time',
                'transaction_id',
            ],
            config: { columns: { 2: { alignment: 'right' } } },
        },
    },
};
