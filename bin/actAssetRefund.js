'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.refund(argv.account, argv.pvtkey);
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Transfer the PRS in the refund to the balance',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Only when REFUND_AVAILABLE shows in AssetBalance output.   |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
