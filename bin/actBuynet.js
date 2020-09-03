'use strict';

const { account } = require('sushitrain');

const func = async (argv) => {
    return await account.buyNet(
        argv.account, argv.receiver, argv.net, argv.pvtkey
    );
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Buy NET',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        "    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]",
        '    --net      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `receiver` is current `account` (pvtkey holder).   |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of purchasing NET:',
        '    $ prs-atm buynet \\',
        '              --account=ABCDE \\',
        '              --receiver=FIJKL \\',
        '              --net=12.3456 \\',
        '              --keystore=keystore.json',
    ],
};
