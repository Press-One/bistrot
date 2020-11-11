'use strict';

const { account } = require('..');

const func = async (argv) => {
    return await account.buyRam(
        argv.account, argv.receiver, argv.ram, argv.pvtkey
    );
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Buy RAM',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        "    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]",
        '    --ram      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `receiver` is current `account` (pvtkey holder).   |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of purchasing RAM:',
        '    $ prs-atm buyram \\',
        '              --account=ABCDE \\',
        '              --receiver=FIJKL \\',
        '              --ram=12.3456 \\',
        '              --keystore=keystore.json',
    ],
};
