'use strict';

const { atm } = require('../index');

const func = async (argv) => {
    return await atm.undelegateBw(
        argv.account, argv.receiver, argv.cpu, argv.net, argv.pvtkey
    );
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Undelegate CPU and/or Network Bandwidth',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        "    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]",
        '    --cpu      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --net      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `receiver` is current `account` (pvtkey holder).   |",
        '    | 2. One of `cpu` or `net` must be provided.                    |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of undelegating CPU and NET:',
        '    $ prs-atm undelegate \\',
        '              --account=ABCDE \\',
        '              --receiver=FIJKL \\',
        '              --cpu=12.3456 \\',
        '              --net=12.3456 \\',
        '              --keystore=keystore.json',
    ],
};
