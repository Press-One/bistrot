'use strict';

const { defi, colors } = require('../');

const formatPrice = (price, maxAccuracy) => {
    while (price.split('.')[1].length < maxAccuracy) { price += '0'; }
    return price;
};

const func = async (argv) => {
    let resp = await defi.checkPrice(argv.account, argv.pubkey, argv.pvtkey);
    if (!argv.json) {
        const tweakResp = [];
        let mxAcc = 0;
        for (let i in resp) {
            mxAcc = resp[i].accuracy > mxAcc ? resp[i].accuracy : mxAcc;
        }
        for (let i in resp) {
            resp[i].time = resp[i].time.toISOString();
            resp[i].price = formatPrice(resp[i].price, mxAcc);
            resp[i].acc = resp[i].accuracy;
            resp[i].provider = resp[i].submitter = 'PRESSone';
            for (let j in resp[i]) {
                if (j === 'prices') { continue; }
                try { resp[i][j] = colors.green(resp[i][j]); } catch (err) { }
            }
            tweakResp.push(resp[i]);
            for (let j in resp[i].prices) {
                resp[i].prices[j].time = resp[i].prices[j].time.toISOString();
                resp[i].prices[j].price = formatPrice(
                    resp[i].prices[j].price, mxAcc
                );
                resp[i].prices[j].acc = resp[i].prices[j].accuracy;
                tweakResp.push(resp[i].prices[j]);
            }
        }
        resp = tweakResp;
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
        '    $ prs-atm defiprice --account=ABCDE --keystore=keystore.json',
    ],
    render: {
        table: {
            columns: [
                'currency',
                'base',
                'price',
                'acc',
                'provider',
                'submitter',
                'time',
                'transaction_id',
            ],
            config: {
                singleLine: true,
                columns: {
                    2: { alignment: 'right' },
                    3: { alignment: 'right' }
                }
            },
        },
    },
};
