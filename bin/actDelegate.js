'use strict';

const { atm } = require('../');

const func = async (argv) => {
    return await atm.delegate(
        argv.account, argv.receiver, argv.cpu, argv.net, argv.pvtkey
    );
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Delegate CPU and/or Network Bandwidth',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        "    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]",
        '    --cpu      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --net      PRS amount like xx.xxxx           [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        "    | 1. Default `receiver` is current `account` (pvtkey holder).   |",
        '    | 2. One of `cpu` or `net` must be provided.                    |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of delegating CPU and NET:',
        '    $ prs-atm delegate \\',
        '              --account=ABCDE \\',
        '              --receiver=FIJKL \\',
        '              --cpu=12.3456 \\',
        '              --net=12.3456 \\',
        '              --keystore=keystore.json',
    ],
};
